import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminRequest } from "@/lib/adminAuth";
export async function POST(request,{params}) {
  const {admin}=await requireAdminRequest(request);
  if(!admin)return NextResponse.json({message:"Unauthorized"},{status:401});
  const {attributeId}=await params;
  const {value}=await request.json();
  const clean=String(value||"").trim();
  if(!clean)return NextResponse.json({message:"Value required"},{status:422});
  try {const data=await prisma.attributeValue.create({data:{attributeUuid:attributeId,value:clean}});return NextResponse.json({data},{status:201});}
  catch{return NextResponse.json({message:"Value already exists or invalid attribute"},{status:409});}
}
