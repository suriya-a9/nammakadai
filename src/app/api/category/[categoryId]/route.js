import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseStatus, serializeCategory } from "@/lib/category";
import { deleteCategoryImage, readCategoryRequest, saveCategoryImage } from "@/lib/categoryImage";
import { requireAdminRequest } from "@/lib/adminAuth";
import { deleteProductImage } from "@/lib/productImage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const errorResponse = (message, status = 400, errors) =>
  NextResponse.json({ message, ...(errors ? { errors } : {}) }, { status });

const normalizeParentUuid = (value) => {
  if (value === undefined) return undefined;
  if (value === null || value === "" || value === "null") return null;
  return String(value).trim();
};

export async function GET(_request, { params }) {
  try {
    const { categoryId } = await params;
    const category = await prisma.category.findUnique({
      where: { uuid: categoryId },
      include: { subcategories: { orderBy: { name: "asc" } } },
    });
    if (!category) return errorResponse("Category not found", 404);
    return NextResponse.json({ data: serializeCategory(category) });
  } catch (error) {
    console.error("GET /api/category/:uuid failed:", error);
    return errorResponse("Failed to load category", 500);
  }
}

const updateCategory = async (request, params) => {
  let newImageUrl = null;

  try {
    const { admin } = await requireAdminRequest(request);
    if (!admin) return errorResponse("Unauthorized", 401);

    const { categoryId } = await params;
    const existing = await prisma.category.findUnique({
      where: { uuid: categoryId },
      include: { subcategories: { select: { uuid: true } } },
    });
    if (!existing) return errorResponse("Category not found", 404);

    const body = await readCategoryRequest(request);
    const data = {};

    if (body.name !== undefined) {
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (!name) {
        return errorResponse("Category name cannot be empty", 422, {
          name: ["Category name cannot be empty"],
        });
      }
      data.name = name;
    }

    if (body.status !== undefined) {
      const status = parseStatus(body.status);
      if (status === undefined) return errorResponse("Invalid category status", 422);
      data.status = status;
    }

    const parentUuid = normalizeParentUuid(body.parent_uuid ?? body.parent_id);
    if (parentUuid !== undefined) {
      if (parentUuid === categoryId) return errorResponse("A category cannot be its own parent", 422);

      if (parentUuid) {
        if (existing.subcategories.length) {
          return errorResponse("A category that has subcategories cannot be changed into a subcategory", 422);
        }

        const parent = await prisma.category.findUnique({ where: { uuid: parentUuid } });
        if (!parent) return errorResponse("Parent category not found", 422);
        if (parent.parentUuid) {
          return errorResponse("Subcategories can only be added under a main category", 422);
        }
      }
      data.parentUuid = parentUuid;
    }

    if (body.image && typeof body.image.arrayBuffer === "function" && body.image.size) {
      newImageUrl = await saveCategoryImage(body.image);
      data.imageUrl = newImageUrl;
    } else if (body.remove_image === true || body.remove_image === "1" || body.remove_image === "true") {
      data.imageUrl = null;
    }

    const category = await prisma.category.update({
      where: { uuid: categoryId },
      data,
      include: { subcategories: { orderBy: { name: "asc" } } },
    });

    if ((newImageUrl || data.imageUrl === null) && existing.imageUrl && existing.imageUrl !== newImageUrl) {
      await deleteCategoryImage(existing.imageUrl);
    }

    return NextResponse.json({
      message: "Category updated successfully",
      data: serializeCategory(category),
    });
  } catch (error) {
    console.error("PUT/PATCH /api/category/:uuid failed:", error);
    if (newImageUrl) await deleteCategoryImage(newImageUrl);
    if (error?.message?.includes("image")) return errorResponse(error.message, 422);
    return errorResponse("Failed to update category", 500);
  }
};

export async function PUT(request, { params }) {
  return updateCategory(request, params);
}

export async function PATCH(request, { params }) {
  return updateCategory(request, params);
}

export async function DELETE(request, { params }) {
  try {
    const { admin } = await requireAdminRequest(request);
    if (!admin) return errorResponse("Unauthorized", 401);

    const { categoryId } = await params;
    const existing = await prisma.category.findUnique({
      where: { uuid: categoryId },
      include: {
        products: { select: { imageUrl: true } },
        subcategories: {
          select: {
            imageUrl: true,
            products: { select: { imageUrl: true } },
          },
        },
      },
    });
    if (!existing) return errorResponse("Category not found", 404);

    await prisma.category.delete({ where: { uuid: categoryId } });

    await Promise.all([
      deleteCategoryImage(existing.imageUrl),
      ...existing.subcategories.map((subcategory) => deleteCategoryImage(subcategory.imageUrl)),
      ...existing.products.map((product) => deleteProductImage(product.imageUrl)),
      ...existing.subcategories.flatMap((subcategory) =>
        subcategory.products.map((product) => deleteProductImage(product.imageUrl))
      ),
    ]);

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/category/:uuid failed:", error);
    return errorResponse("Failed to delete category", 500);
  }
}
