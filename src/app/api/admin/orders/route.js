import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminRequest } from "@/lib/adminAuth";
export const runtime="nodejs"; export const dynamic="force-dynamic";
export async function GET(request){const {admin}=await requireAdminRequest(request);if(!admin)return NextResponse.json({message:"Unauthorized"},{status:401});const orders=await prisma.order.findMany({orderBy:{createdAt:"desc"},take:100,include:{items:true,customer:{select:{email:true}}}});return NextResponse.json({data:orders.map(order=>({uuid:order.uuid,number:order.orderNumber,date:order.createdAt,name:order.name,email:order.customer.email,phone:order.phone,address:order.address,city:order.city,state:order.state,pincode:order.pincode,total:Number(order.total),status:order.status,payment_method:order.paymentMethod,payment_status:order.paymentStatus,items:order.items.map(item=>({name:item.productName,quantity:item.quantity,price:Number(item.unitPrice)}))}))});}
