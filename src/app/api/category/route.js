import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { buildCategoryTree, parseStatus, serializeCategory } from "@/lib/category";
import { deleteCategoryImage, readCategoryRequest, saveCategoryImage } from "@/lib/categoryImage";
import { requireAdminRequest } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const errorResponse = (message, status = 400, errors) =>
  NextResponse.json({ message, ...(errors ? { errors } : {}) }, { status });

const normalizeParentUuid = (value) => {
  if (value === undefined) return undefined;
  if (value === null || value === "" || value === "null") return null;
  return String(value).trim();
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = parseStatus(searchParams.get("status"));
    const search = searchParams.get("search")?.trim();
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const perPage = Math.min(Math.max(Number(searchParams.get("paginate")) || 100, 1), 500);

    const where = {
      ...(status !== undefined ? { status } : {}),
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    };

    const rows = await prisma.category.findMany({
      where,
      orderBy: { name: "asc" },
    });

    const tree = buildCategoryTree(rows);
    const start = (page - 1) * perPage;
    const pagedTree = tree.slice(start, start + perPage);
    const data = pagedTree.map(serializeCategory);
    const total = tree.length;
    const lastPage = Math.max(Math.ceil(total / perPage), 1);

    return NextResponse.json({
      current_page: page,
      data,
      from: data.length ? start + 1 : null,
      last_page: lastPage,
      per_page: perPage,
      to: data.length ? start + data.length : null,
      total,
    });
  } catch (error) {
    console.error("GET /api/category failed:", error);
    return errorResponse("Failed to load categories", 500);
  }
}

export async function POST(request) {
  let uploadedImageUrl = null;

  try {
    const { admin } = await requireAdminRequest(request);
    if (!admin) return errorResponse("Unauthorized", 401);

    const body = await readCategoryRequest(request);
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const status = parseStatus(body.status);
    const parentUuid = normalizeParentUuid(body.parent_uuid ?? body.parent_id);

    if (!name) {
      return errorResponse("Category name is required", 422, {
        name: ["Category name is required"],
      });
    }

    if (parentUuid) {
      const parent = await prisma.category.findUnique({ where: { uuid: parentUuid } });
      if (!parent) return errorResponse("Parent category not found", 422);
      if (parent.parentUuid) {
        return errorResponse("Subcategories can only be added under a main category", 422);
      }
    }

    if (body.image && typeof body.image.arrayBuffer === "function" && body.image.size) {
      uploadedImageUrl = await saveCategoryImage(body.image);
    }

    const category = await prisma.category.create({
      data: {
        name,
        status: status === undefined ? true : status,
        imageUrl: uploadedImageUrl,
        parentUuid: parentUuid || null,
      },
    });

    return NextResponse.json(
      { message: parentUuid ? "Subcategory created successfully" : "Category created successfully", data: serializeCategory(category) },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/category failed:", error);
    if (uploadedImageUrl) await deleteCategoryImage(uploadedImageUrl);
    if (error?.message?.includes("image")) return errorResponse(error.message, 422);
    return errorResponse("Failed to create category", 500);
  }
}
