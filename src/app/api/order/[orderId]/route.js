import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { customerFromRequest } from "@/lib/customerAuth";
export const runtime="nodejs";

const STATUS = {
  placed: { name:"placed", slug:"pending", sequence:1 },
  confirmed: { name:"confirmed", slug:"confirmed", sequence:2 },
  processing: { name:"processing", slug:"processing", sequence:3 },
  shipped: { name:"shipped", slug:"shipped", sequence:4 },
  delivered: { name:"delivered", slug:"delivered", sequence:5 },
  cancelled: { name:"cancelled", slug:"cancelled", sequence:99 },
};

export async function GET(request,{params}){
  const customer=await customerFromRequest(request);
  if(!customer)return NextResponse.json({message:"Unauthorized"},{status:401});
  const {orderId}=await params;
  const order=await prisma.order.findFirst({
    where:{customerUuid:customer.uuid,OR:[{uuid:/^[0-9a-f-]{36}$/i.test(orderId)?orderId:"00000000-0000-0000-0000-000000000000"},{orderNumber:orderId}]},
    include:{items:true}
  });
  if(!order)return NextResponse.json({message:"Order not found"},{status:404});
  const orderStatus=STATUS[order.status] || {name:order.status,slug:order.status,sequence:1};
  const shipping={name:order.name,phone:order.phone,street:order.address,address:order.address,city:order.city,state:{name:order.state},pincode:order.pincode};
  return NextResponse.json({data:{
    uuid:order.uuid,order_number:order.orderNumber,status:order.status,order_status:orderStatus,
    payment_status:order.paymentStatus?.toUpperCase(),payment_method:order.paymentMethod,
    amount:Number(order.subtotal),subtotal:Number(order.subtotal),total:Number(order.total),created_at:order.createdAt,
    shipping_address:shipping,billing_address:shipping,
    products:order.items.map(i=>({id:i.uuid,name:i.productName,quantity:i.quantity,price:Number(i.unitPrice),subtotal:Number(i.lineTotal),pivot:{quantity:i.quantity,subtotal:Number(i.lineTotal)}})),
    items:order.items.map(i=>({name:i.productName,quantity:i.quantity,price:Number(i.unitPrice),total:Number(i.lineTotal)}))
  }});
}
