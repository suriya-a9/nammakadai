import { NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function GET(request) {
  const { admin } = await requireAdminRequest(request);
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ data: admin });
}
