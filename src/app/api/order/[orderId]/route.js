import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { customerFromRequest } from "@/lib/customerAuth";
export const runtime="nodejs";
export async function GET(request,{params}){const customer=await customerFromRequest(request);if(!customer)return NextResponse.json({message:"Unauthorized"},{status:401});const {orderId}=await params;const order=await prisma.order.findFirst({where:{customerUuid:customer.uuid,OR:[{uuid:/^[0-9a-f-]{36}$/i.test(orderId)?orderId:"00000000-0000-0000-0000-000000000000"},{orderNumber:orderId}]},include:{items:true}});if(!order)return NextResponse.json({message:"Order not found"},{status:404});return NextResponse.json({data:{uuid:order.uuid,order_number:order.orderNumber,status:order.status,payment_status:order.paymentStatus,total:Number(order.total),created_at:order.createdAt,items:order.items.map(i=>({name:i.productName,quantity:i.quantity,price:Number(i.unitPrice),total:Number(i.lineTotal)}))}});}
