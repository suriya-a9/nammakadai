import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import prisma from "@/lib/prisma";
import { parseIds, validateAssignments } from "@/lib/productAssignments";
import { requireAdminRequest } from "@/lib/adminAuth";
import { deleteProductImages, MAX_PRODUCT_IMAGES, readProductRequest, saveProductImages } from "@/lib/productImage";
import { isUuid, makeProductSlug, parseProductStatus, serializeProduct } from "@/lib/product";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const errorResponse = (message, status = 400, errors) =>
  NextResponse.json({ message, ...(errors ? { errors } : {}) }, { status });

const parseMoney = (value, field, { required = false } = {}) => {
  if (value === undefined || value === null || value === "") {
    if (required) throw new Error(`${field} is required`);
    return null;
  }
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw new Error(`${field} must be a valid positive number`);
  return number;
};

const expandCategoryIds = async (ids) => {
  const valid = [...new Set(ids.filter(isUuid))];
  if (!valid.length) return [];
  const children = await prisma.category.findMany({
    where: { parentUuid: { in: valid } },
    select: { uuid: true },
  });
  return [...new Set([...valid, ...children.map((item) => item.uuid)])];
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const perPage = Math.min(Math.max(Number(searchParams.get("paginate")) || 25, 1), 500);
    const search = searchParams.get("search")?.trim();
    const status = parseProductStatus(searchParams.get("status"));
    const sortBy = searchParams.get("sortBy") || "desc";
    const categoryParam = searchParams.get("category") || searchParams.get("category_ids");
    const idsParam = searchParams.get("ids");
    const priceParam = searchParams.get("price");

    const where = {
      ...(status !== undefined ? { status } : {}),
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    };

    if (categoryParam) {
      const categoryIds = await expandCategoryIds(categoryParam.split(",").map((value) => value.trim()));
      if (!categoryIds.length) {
        return NextResponse.json({ current_page: page, last_page: 1, total: 0, per_page: perPage, data: [] });
      }
      where.OR = [{categoryUuid:{in:categoryIds}},{categoryLinks:{some:{categoryUuid:{in:categoryIds}}}}];
    }

    if (priceParam) {
      const ranges = priceParam.split(",").map((value) => value.trim()).filter(Boolean);
      const priceConditions = [];
      const effectivePrice = (condition) => ({
        OR: [
          { salePrice: { not: null, ...condition } },
          { salePrice: null, price: condition },
        ],
      });
      for (const range of ranges) {
        if (range.includes("-")) {
          const [min, max] = range.split("-").map(Number);
          if (Number.isFinite(min) && Number.isFinite(max)) priceConditions.push(effectivePrice({ gte: min, lte: max }));
        } else {
          const value = Number(range);
          if (!Number.isFinite(value)) continue;
          if (value <= 100) priceConditions.push(effectivePrice({ lte: value }));
          else if (value >= 1000) priceConditions.push(effectivePrice({ gte: value }));
        }
      }
      if (priceConditions.length) where.AND = [{ OR: priceConditions }];
    }

    if (idsParam) {
      const ids = idsParam.split(",").map((value) => value.trim()).filter(isUuid);
      // Old Fashion Five JSON contains numeric demo IDs. If none are UUIDs, ignore that legacy filter
      // so newly-created PostgreSQL products can still populate shared product widgets.
      if (ids.length) where.uuid = { in: ids };
    }

    let orderBy = { createdAt: "desc" };
    if (sortBy === "asc") orderBy = { createdAt: "asc" };
    if (sortBy === "a-z") orderBy = { name: "asc" };
    if (sortBy === "z-a") orderBy = { name: "desc" };
    if (sortBy === "low-high") orderBy = { salePrice: "asc" };
    if (sortBy === "high-low") orderBy = { salePrice: "desc" };

    const [rows, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, categoryLinks: {include:{category:true}}, attributeValues:{include:{value:{include:{attribute:true}}}}, images: { orderBy: { sortOrder: "asc" } }, reviews: { include: { customer: { select: { uuid: true, name: true } } }, orderBy: { createdAt: "desc" } } },
        orderBy,
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      current_page: page,
      last_page: Math.max(Math.ceil(total / perPage), 1),
      total,
      per_page: perPage,
      data: rows.map(serializeProduct),
    });
  } catch (error) {
    console.error("GET /api/product failed:", error);
    return errorResponse("Failed to load products", 500);
  }
}

export async function POST(request) {
  let uploadedImageUrls = [];
  try {
    const { admin } = await requireAdminRequest(request);
    if (!admin) return errorResponse("Unauthorized", 401);

    const body = await readProductRequest(request);
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const categoryIds = parseIds(body.category_uuids?.length ? body.category_uuids : [body.category_uuid]);
    const attributeValueIds = parseIds(body.attribute_value_uuids);
    await validateAssignments(prisma, categoryIds, attributeValueIds);
    const categoryUuid = categoryIds[0];
    const status = parseProductStatus(body.status);
    const price = parseMoney(body.price, "Price", { required: true });
    const salePrice = parseMoney(body.sale_price, "Sale price");
    const quantity = Math.max(Number.parseInt(body.quantity, 10) || 0, 0);

    if (!name) return errorResponse("Product name is required", 422);
    if (!isUuid(categoryUuid)) return errorResponse("Category is required", 422);
    if (salePrice !== null && salePrice > price) return errorResponse("Sale price cannot be greater than price", 422);
    if ((body.images || []).length > MAX_PRODUCT_IMAGES) return errorResponse(`A product can have up to ${MAX_PRODUCT_IMAGES} images`, 422);

    const category = await prisma.category.findUnique({ where: { uuid: categoryUuid } });
    if (!category) return errorResponse("Category not found", 422);

    uploadedImageUrls = await saveProductImages(body.images || []);

    const uuid = randomUUID();
    const product = await prisma.product.create({
      data: {
        uuid,
        name,
        slug: makeProductSlug(name, uuid),
        description: typeof body.description === "string" ? body.description.trim() || null : null,
        price,
        salePrice,
        quantity,
        status: status === undefined ? true : status,
        imageUrl: uploadedImageUrls[0] || null,
        categoryUuid,
        categoryLinks: {create:categoryIds.map((id)=>({categoryUuid:id}))},
        ...(attributeValueIds.length ? {attributeValues:{create:attributeValueIds.map((id)=>({valueUuid:id}))}} : {}),
        ...(uploadedImageUrls.length
          ? {
              images: {
                create: uploadedImageUrls.map((imageUrl, index) => ({ imageUrl, sortOrder: index })),
              },
            }
          : {}),
      },
      include: { category: true, categoryLinks: {include:{category:true}}, attributeValues:{include:{value:{include:{attribute:true}}}}, images: { orderBy: { sortOrder: "asc" } }, reviews: { include: { customer: { select: { uuid: true, name: true } } }, orderBy: { createdAt: "desc" } } },
    });

    return NextResponse.json({ message: "Product created successfully", data: serializeProduct(product) }, { status: 201 });
  } catch (error) {
    console.error("POST /api/product failed:", error);
    if (uploadedImageUrls.length) await deleteProductImages(uploadedImageUrls);
    if (/category selection|attribute value selection/i.test(error?.message || "")) return errorResponse(error.message, 422);
    if (error?.message?.toLowerCase().includes("image") || /price/i.test(error?.message || "")) return errorResponse(error.message, 422);
    return errorResponse("Failed to create product", 500);
  }
}
