import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validPolicy } from "@/lib/storePolicies";
export const dynamic = "force-dynamic";
export async function GET(request, { params }) {
 const { slug } = await params;
 const policy = validPolicy(slug);
 if (!policy) return NextResponse.json({ message: "Not found" }, { status: 404 });
 const saved = await prisma.storePolicy.findUnique({ where: { slug } });
 return NextResponse.json({ data: { ...policy, content: saved?.content || "", updatedAt: saved?.updatedAt || null } });
}
