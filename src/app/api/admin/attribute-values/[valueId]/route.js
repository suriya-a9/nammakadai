import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminRequest } from "@/lib/adminAuth";
export async function DELETE(request,{params}) {
 const {admin}=await requireAdminRequest(request);if(!admin)return NextResponse.json({message:"Unauthorized"},{status:401});
 const {valueId}=await params;await prisma.attributeValue.delete({where:{uuid:valueId}});return NextResponse.json({message:"Value removed"});
}
