import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminRequest } from "@/lib/adminAuth";
import { sendOrderStatusEmail } from "@/lib/orderEmail";
export const runtime="nodejs"; export const dynamic="force-dynamic";
export async function GET(request){const {admin}=await requireAdminRequest(request);if(!admin)return NextResponse.json({message:"Unauthorized"},{status:401});const orders=await prisma.order.findMany({orderBy:{createdAt:"desc"},take:100,include:{items:true,customer:{select:{email:true}}}});return NextResponse.json({data:orders.map(order=>({uuid:order.uuid,number:order.orderNumber,date:order.createdAt,name:order.name,email:order.customer.email,phone:order.phone,address:order.address,city:order.city,state:order.state,pincode:order.pincode,total:Number(order.total),status:order.status,payment_method:order.paymentMethod,payment_status:order.paymentStatus,items:order.items.map(item=>({name:item.productName,quantity:item.quantity,price:Number(item.unitPrice)}))}))});}


const ORDER_STATUSES = ["placed", "confirmed", "processing", "shipped", "delivered", "cancelled"];
export async function PATCH(request){
  const {admin}=await requireAdminRequest(request);
  if(!admin)return NextResponse.json({message:"Unauthorized"},{status:401});
  try{
    const body=await request.json();
    const uuid=String(body.uuid||"");
    const status=String(body.status||"").toLowerCase();
    if(!uuid || !ORDER_STATUSES.includes(status)) return NextResponse.json({message:"Invalid order or status"},{status:422});
    const current=await prisma.order.findUnique({where:{uuid},include:{customer:{select:{email:true}}}});
    if(!current) return NextResponse.json({message:"Order not found"},{status:404});
    if(current.status===status) return NextResponse.json({message:"Order status unchanged",data:{uuid:current.uuid,status:current.status}});
    const order=await prisma.order.update({where:{uuid},data:{status},include:{customer:{select:{email:true}}}});
    try { await sendOrderStatusEmail(order, order.customer.email); } catch (mailError) { console.error("order status email", mailError); }
    return NextResponse.json({message:"Order status updated",data:{uuid:order.uuid,status:order.status}});
  }catch(error){
    if(error?.code==="P2025") return NextResponse.json({message:"Order not found"},{status:404});
    console.error("admin order status",error);
    return NextResponse.json({message:"Unable to update order status"},{status:500});
  }
}
