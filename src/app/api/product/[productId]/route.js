import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminRequest } from "@/lib/adminAuth";
import { customerFromRequest } from "@/lib/customerAuth";
import { deleteProductImages, MAX_PRODUCT_IMAGES, readProductRequest, saveProductImages } from "@/lib/productImage";
import { isUuid, makeProductSlug, parseProductStatus, serializeProduct } from "@/lib/product";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const errorResponse = (message, status = 400) => NextResponse.json({ message }, { status });

const findProduct = async (value) =>
  prisma.product.findFirst({
    where: isUuid(value) ? { OR: [{ uuid: value }, { slug: value }] } : { slug: value },
    include: { category: true, images: { orderBy: { sortOrder: "asc" } }, reviews: { include: { customer: { select: { uuid: true, name: true } } }, orderBy: { createdAt: "desc" } } },
  });

const parseMoney = (value, field) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw new Error(`${field} must be a valid positive number`);
  return number;
};

export async function GET(request, { params }) {
  try {
    const { productId } = await params;
    const product = await findProduct(productId);
    if (!product) return errorResponse("Product not found", 404);

    const customer = await customerFromRequest(request);
    let canReview = false;
    let userReview = null;

    if (customer) {
      const [purchased, existingReview] = await Promise.all([
        prisma.order.findFirst({
          where: {
            customerUuid: customer.uuid,
            status: { equals: "delivered", mode: "insensitive" },
            items: { some: { productUuid: product.uuid } },
          },
          select: { uuid: true },
        }),
        prisma.productReview.findUnique({
          where: { productUuid_customerUuid: { productUuid: product.uuid, customerUuid: customer.uuid } },
          select: { uuid: true, rating: true, description: true },
        }),
      ]);
      canReview = Boolean(purchased);
      userReview = existingReview;
    }

    return NextResponse.json({ ...serializeProduct(product), can_review: canReview, user_review: userReview });
  } catch (error) {
    console.error("GET /api/product/:id failed:", error);
    return errorResponse("Failed to load product", 500);
  }
}

const updateProduct = async (request, params) => {
  let newImageUrls = [];
  try {
    const { admin } = await requireAdminRequest(request);
    if (!admin) return errorResponse("Unauthorized", 401);

    const { productId } = await params;
    const existing = await findProduct(productId);
    if (!existing) return errorResponse("Product not found", 404);

    const body = await readProductRequest(request);
    const data = {};

    if (body.name !== undefined) {
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (!name) return errorResponse("Product name cannot be empty", 422);
      data.name = name;
      data.slug = makeProductSlug(name, existing.uuid);
    }
    if (body.description !== undefined) data.description = String(body.description || "").trim() || null;
    if (body.status !== undefined) {
      const status = parseProductStatus(body.status);
      if (status === undefined) return errorResponse("Invalid product status", 422);
      data.status = status;
    }
    if (body.quantity !== undefined) data.quantity = Math.max(Number.parseInt(body.quantity, 10) || 0, 0);

    const price = parseMoney(body.price, "Price");
    const salePrice = parseMoney(body.sale_price, "Sale price");
    if (price !== undefined) data.price = price;
    if (salePrice !== undefined) data.salePrice = salePrice;
    const finalPrice = price !== undefined ? price : Number(existing.price);
    const finalSalePrice = salePrice !== undefined ? salePrice : existing.salePrice === null ? null : Number(existing.salePrice);
    if (finalSalePrice !== null && finalSalePrice > finalPrice) return errorResponse("Sale price cannot be greater than price", 422);

    if (body.category_uuid !== undefined) {
      const categoryUuid = String(body.category_uuid || "").trim();
      if (!isUuid(categoryUuid)) return errorResponse("Category is required", 422);
      const category = await prisma.category.findUnique({ where: { uuid: categoryUuid } });
      if (!category) return errorResponse("Category not found", 422);
      data.categoryUuid = categoryUuid;
    }

    const requestedRemoveIds = new Set((body.remove_image_ids || []).filter(isUuid));
    if (body.remove_image === true || body.remove_image === "1" || body.remove_image === "true") {
      existing.images.forEach((image) => requestedRemoveIds.add(image.uuid));
    }

    const removedImages = existing.images.filter((image) => requestedRemoveIds.has(image.uuid));
    const keptImages = existing.images.filter((image) => !requestedRemoveIds.has(image.uuid));
    const incomingImages = body.images || [];

    if (keptImages.length + incomingImages.length > MAX_PRODUCT_IMAGES) {
      return errorResponse(`A product can have up to ${MAX_PRODUCT_IMAGES} images`, 422);
    }

    newImageUrls = await saveProductImages(incomingImages);
    const firstImageUrl = keptImages[0]?.imageUrl || newImageUrls[0] || null;
    data.imageUrl = firstImageUrl;

    await prisma.$transaction(async (tx) => {
      if (removedImages.length) {
        await tx.productImage.deleteMany({
          where: { uuid: { in: removedImages.map((image) => image.uuid) }, productUuid: existing.uuid },
        });
      }

      if (newImageUrls.length) {
        const nextSortOrder = keptImages.length ? Math.max(...keptImages.map((image) => image.sortOrder ?? 0)) + 1 : 0;
        await tx.productImage.createMany({
          data: newImageUrls.map((imageUrl, index) => ({
            productUuid: existing.uuid,
            imageUrl,
            sortOrder: nextSortOrder + index,
          })),
        });
      }

      await tx.product.update({ where: { uuid: existing.uuid }, data });
    });

    const product = await findProduct(existing.uuid);
    await deleteProductImages(removedImages.map((image) => image.imageUrl));

    return NextResponse.json({ message: "Product updated successfully", data: serializeProduct(product) });
  } catch (error) {
    console.error("PUT/PATCH /api/product/:id failed:", error);
    if (newImageUrls.length) await deleteProductImages(newImageUrls);
    if (error?.message?.toLowerCase().includes("image") || /price/i.test(error?.message || "")) return errorResponse(error.message, 422);
    return errorResponse("Failed to update product", 500);
  }
};

export async function PUT(request, { params }) {
  return updateProduct(request, params);
}

export async function PATCH(request, { params }) {
  return updateProduct(request, params);
}

export async function DELETE(request, { params }) {
  try {
    const { admin } = await requireAdminRequest(request);
    if (!admin) return errorResponse("Unauthorized", 401);
    const { productId } = await params;
    const existing = await findProduct(productId);
    if (!existing) return errorResponse("Product not found", 404);

    await prisma.product.delete({ where: { uuid: existing.uuid } });
    await deleteProductImages([existing.imageUrl, ...existing.images.map((image) => image.imageUrl)]);
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/product/:id failed:", error);
    return errorResponse("Failed to delete product", 500);
  }
}
