import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminRequest } from "@/lib/adminAuth";
export async function DELETE(request,{params}) {
  const {admin}=await requireAdminRequest(request);
  if(!admin)return NextResponse.json({message:"Unauthorized"},{status:401});
  const {attributeId}=await params;
  await prisma.attribute.delete({where:{uuid:attributeId}});
  return NextResponse.json({message:"Attribute removed"});
}
