import { NextResponse } from "next/server";
import { customerFromRequest, safeCustomer } from "@/lib/customerAuth";
import prisma from "@/lib/prisma";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(request){const customer=await customerFromRequest(request);if(!customer)return NextResponse.json({message:"Unauthenticated"},{status:401});const orders_count=await prisma.order.count({where:{customerUuid:customer.uuid}});return NextResponse.json({...safeCustomer(customer),address:[],orders_count});}
