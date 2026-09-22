import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminRequest } from "@/lib/adminAuth";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const { admin } = await requireAdminRequest(request);
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const data = await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ data });
}
