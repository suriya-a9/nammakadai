import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { customerFromRequest } from "@/lib/customerAuth";
import { isUuid, serializeProduct } from "@/lib/product";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(request, { params }) {
  const customer = await customerFromRequest(request);
  if (!customer) return NextResponse.json({ message: "Customer login required" }, { status: 401 });
  const { productId } = await params;
  if (!isUuid(productId)) return NextResponse.json({ message: "Invalid product ID" }, { status: 422 });
  await prisma.customerWishlistItem.deleteMany({ where: { customerUuid: customer.uuid, productUuid: productId } });
  const rows = await prisma.customerWishlistItem.findMany({
    where: { customerUuid: customer.uuid },
    include: { product: { include: { category: true, images: { orderBy: { sortOrder: "asc" } }, reviews: { include: { customer: { select: { uuid: true, name: true } } }, orderBy: { createdAt: "desc" } } } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ data: rows.map((row) => ({ ...serializeProduct(row.product), is_wishlist: true, wishlist_id: row.uuid })) });
}
