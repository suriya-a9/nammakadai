import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { customerFromRequest } from "@/lib/customerAuth";
import { isUuid, serializeProduct } from "@/lib/product";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const unauthorized = () => NextResponse.json({ message: "Customer login required" }, { status: 401 });

async function loadWishlist(customerUuid) {
  const rows = await prisma.customerWishlistItem.findMany({
    where: { customerUuid },
    include: { product: { include: { category: true, images: { orderBy: { sortOrder: "asc" } }, reviews: { include: { customer: { select: { uuid: true, name: true } } }, orderBy: { createdAt: "desc" } } } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ data: rows.map((row) => ({ ...serializeProduct(row.product), is_wishlist: true, wishlist_id: row.uuid })) },
    { headers: { "Cache-Control": "no-store" } });
}

export async function GET(request) {
  const customer = await customerFromRequest(request);
  return customer ? loadWishlist(customer.uuid) : unauthorized();
}

export async function POST(request) {
  const customer = await customerFromRequest(request);
  if (!customer) return unauthorized();
  try {
    const body = await request.json();
    const productUuid = String(body.product_id || body.product_uuid || "");
    if (!isUuid(productUuid)) return NextResponse.json({ message: "Invalid product ID" }, { status: 422 });
    const product = await prisma.product.findUnique({ where: { uuid: productUuid }, select: { uuid: true, status: true } });
    if (!product || !product.status) return NextResponse.json({ message: "Product not found" }, { status: 404 });
    await prisma.customerWishlistItem.upsert({
      where: { customerUuid_productUuid: { customerUuid: customer.uuid, productUuid } },
      create: { customerUuid: customer.uuid, productUuid },
      update: {},
    });
    return loadWishlist(customer.uuid);
  } catch (error) {
    console.error("wishlist POST", error);
    return NextResponse.json({ message: "Could not update wishlist" }, { status: 500 });
  }
}
