import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminRequest } from "@/lib/adminAuth";
export const dynamic = "force-dynamic";
export async function GET(request) {
  const { admin } = await requireAdminRequest(request);
  if (!admin) return NextResponse.json({message:"Unauthorized"},{status:401});
  const data = await prisma.attribute.findMany({include:{values:{orderBy:{value:"asc"}}},orderBy:{name:"asc"}});
  return NextResponse.json({data});
}
export async function POST(request) {
  const { admin } = await requireAdminRequest(request);
  if (!admin) return NextResponse.json({message:"Unauthorized"},{status:401});
  const body = await request.json();
  const name = String(body.name || "").trim();
  if (!name) return NextResponse.json({message:"Attribute name required"},{status:422});
  try {
    const data = await prisma.attribute.create({data:{name},include:{values:true}});
    return NextResponse.json({data},{status:201});
  } catch (error) {return NextResponse.json({message:"Attribute already exists or could not be created"},{status:409});}
}
