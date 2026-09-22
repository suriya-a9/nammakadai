import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminRequest } from "@/lib/adminAuth";
export const dynamic = "force-dynamic";
export async function GET(request) {
  const { admin } = await requireAdminRequest(request);
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    select: { uuid:true, name:true, email:true, phone:true, createdAt:true, _count:{select:{orders:true}} },
  });
  return NextResponse.json({ data: customers.map(c => ({...c, orders:c._count.orders, _count:undefined})) });
}
