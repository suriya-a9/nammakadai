import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { customerFromRequest } from "@/lib/customerAuth";
import { isUuid } from "@/lib/product";

export const dynamic = "force-dynamic";

const serialize = (review) => ({
  id: review.uuid,
  uuid: review.uuid,
  rating: review.rating,
  description: review.description || "",
  created_at: review.createdAt,
  consumer: { id: review.customer.uuid, name: review.customer.name, profile_image: null },
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("product_id");
  if (!isUuid(productId)) return NextResponse.json({ data: [] });
  const reviews = await prisma.productReview.findMany({
    where: { productUuid: productId },
    include: { customer: { select: { uuid: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ data: reviews.map(serialize) });
}

export async function POST(request) {
  const customer = await customerFromRequest(request);
  if (!customer) return NextResponse.json({ message: "Please login to write a review" }, { status: 401 });
  const body = await request.json();
  const productUuid = String(body.product_id || "");
  const rating = Number(body.rating);
  const description = String(body.description || "").trim();
  if (!isUuid(productUuid)) return NextResponse.json({ message: "Invalid product" }, { status: 422 });
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return NextResponse.json({ message: "Rating must be between 1 and 5" }, { status: 422 });
  const product = await prisma.product.findUnique({ where: { uuid: productUuid }, select: { uuid: true } });
  if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });

  // Reviews are restricted to verified buyers. An order counts as purchased only
  // after it has been delivered, so a newly placed/cancelled order cannot review.
  const purchased = await prisma.order.findFirst({
    where: {
      customerUuid: customer.uuid,
      status: { equals: "delivered", mode: "insensitive" },
      items: { some: { productUuid } },
    },
    select: { uuid: true },
  });
  if (!purchased) {
    return NextResponse.json({ message: "Only customers who have purchased and received this product can write a review" }, { status: 403 });
  }

  const review = await prisma.productReview.upsert({
    where: { productUuid_customerUuid: { productUuid, customerUuid: customer.uuid } },
    create: { productUuid, customerUuid: customer.uuid, rating, description: description || null },
    update: { rating, description: description || null },
    include: { customer: { select: { uuid: true, name: true } } },
  });
  return NextResponse.json({ message: "Review saved successfully", data: serialize(review) }, { status: 201 });
}
