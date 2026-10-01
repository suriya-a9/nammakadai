import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminRequest } from "@/lib/adminAuth";
import { isUuid } from "@/lib/product";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { admin } = await requireAdminRequest(request);
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const reviews = await prisma.productReview.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { uuid: true, name: true } },
      customer: { select: { uuid: true, name: true, phone: true, email: true } },
    },
  });

  return NextResponse.json({
    data: reviews.map((review) => ({
      uuid: review.uuid,
      rating: review.rating,
      description: review.description || "",
      createdAt: review.createdAt,
      product: review.product,
      customer: review.customer,
    })),
  });
}

export async function DELETE(request) {
  const { admin } = await requireAdminRequest(request);
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const reviewUuid = String(body.review_uuid || body.uuid || "");
  if (!isUuid(reviewUuid)) return NextResponse.json({ message: "Invalid review" }, { status: 422 });

  const review = await prisma.productReview.findUnique({ where: { uuid: reviewUuid }, select: { uuid: true } });
  if (!review) return NextResponse.json({ message: "Review not found" }, { status: 404 });

  await prisma.productReview.delete({ where: { uuid: reviewUuid } });
  return NextResponse.json({ message: "Review deleted successfully" });
}
