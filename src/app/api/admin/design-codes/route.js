import {NextResponse} from "next/server";
import prisma from "@/lib/prisma";
import {requireAdminRequest} from "@/lib/adminAuth";
export const dynamic="force-dynamic";
export async function GET(request){const {admin}=await requireAdminRequest(request);if(!admin)return NextResponse.json({message:"Unauthorized"},{status:401});return NextResponse.json({data:await prisma.designCode.findMany({include:{_count:{select:{products:true}}},orderBy:{code:"asc"}})});}
export async function POST(request){const {admin}=await requireAdminRequest(request);if(!admin)return NextResponse.json({message:"Unauthorized"},{status:401});const code=String((await request.json()).code||"").trim().toUpperCase();if(!code||code.length>80)return NextResponse.json({message:"Enter a design code (maximum 80 characters)"},{status:422});try{return NextResponse.json({data:await prisma.designCode.create({data:{code}})},{status:201});}catch{return NextResponse.json({message:"Design code already exists"},{status:409});}}
