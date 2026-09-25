import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminRequest } from "@/lib/adminAuth";
import { STORE_POLICIES, validPolicy } from "@/lib/storePolicies";
export const dynamic = "force-dynamic";
export async function GET(request) {
 const { admin } = await requireAdminRequest(request);
 if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
 const saved = await prisma.storePolicy.findMany();
 return NextResponse.json({ data: STORE_POLICIES.map((p) => ({ ...p, content: saved.find((s) => s.slug === p.slug)?.content || "", updatedAt: saved.find((s) => s.slug === p.slug)?.updatedAt || null })) });
}
export async function PUT(request) {
 const { admin } = await requireAdminRequest(request);
 if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
 const body = await request.json();
 const policy = validPolicy(body.slug);
 if (!policy || typeof body.content !== "string" || body.content.length > 100000) return NextResponse.json({ message: "Invalid policy or content" }, { status: 422 });
 const data = await prisma.storePolicy.upsert({ where: { slug: policy.slug }, create: { slug: policy.slug, title: policy.title, content: body.content }, update: { content: body.content } });
 return NextResponse.json({ data });
}
