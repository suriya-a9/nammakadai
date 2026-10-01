import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminRequest } from "@/lib/adminAuth";
import { sendOrderStatusWhatsApp } from "@/lib/whatsapp";
export const runtime="nodejs"; export const dynamic="force-dynamic";
export async function GET(request){const {admin}=await requireAdminRequest(request);if(!admin)return NextResponse.json({message:"Unauthorized"},{status:401});const orders=await prisma.order.findMany({orderBy:{createdAt:"desc"},take:100,include:{items:true,customer:{select:{email:true,phone:true}}}});return NextResponse.json({data:orders.map(order=>({uuid:order.uuid,number:order.orderNumber,date:order.createdAt,name:order.name,email:order.customer.email,phone:order.phone,address:order.address,city:order.city,state:order.state,pincode:order.pincode,total:Number(order.total),status:order.status,payment_method:order.paymentMethod,payment_status:order.paymentStatus,items:order.items.map(item=>({name:item.productName + ((item.selectedAttributes||[]).length ? " (" + item.selectedAttributes.map(a=>a.name+": "+a.value).join(", ") + ")" : ""),quantity:item.quantity,price:Number(item.unitPrice),selected_attributes:item.selectedAttributes||[]}))}))});}


const ORDER_STATUSES = ["placed", "confirmed", "processing", "shipped", "delivered", "cancelled"];
export async function PATCH(request){
  const {admin}=await requireAdminRequest(request);
  if(!admin)return NextResponse.json({message:"Unauthorized"},{status:401});
  try{
    const body=await request.json();
    const uuid=String(body.uuid||"");
    const status=String(body.status||"").toLowerCase();
    const paymentStatus=String(body.payment_status||"").toLowerCase();
    if (body.payment_status !== undefined) {
      if (!uuid || !["pending", "paid"].includes(paymentStatus)) return NextResponse.json({message:"Invalid payment status"},{status:422});
      const existing=await prisma.order.findUnique({where:{uuid},select:{uuid:true,paymentMethod:true,paymentStatus:true,status:true}});
      if (!existing) return NextResponse.json({message:"Order not found"},{status:404});
      if (existing.paymentMethod!=="cod") return NextResponse.json({message:"Online payment status is managed by verified Razorpay transactions"},{status:403});
      if (existing.status==="cancelled") return NextResponse.json({message:"Cannot change payment status of a cancelled order"},{status:409});
      if (existing.paymentStatus===paymentStatus) return NextResponse.json({message:"Payment status unchanged",data:{uuid,payment_status:paymentStatus}});
      const updated=await prisma.order.updateMany({where:{uuid,paymentMethod:"cod",status:{not:"cancelled"},paymentStatus:existing.paymentStatus},data:{paymentStatus}});
      if (updated.count!==1) return NextResponse.json({message:"Order was changed; refresh and retry"},{status:409});
      return NextResponse.json({message:"COD payment status updated",data:{uuid,payment_status:paymentStatus}});
    }
    if(!uuid || !ORDER_STATUSES.includes(status)) return NextResponse.json({message:"Invalid order or status"},{status:422});
    const current=await prisma.order.findUnique({where:{uuid},include:{customer:{select:{email:true,phone:true}}}});
    if(!current) return NextResponse.json({message:"Order not found"},{status:404});
    if(current.status===status) return NextResponse.json({message:"Order status unchanged",data:{uuid:current.uuid,status:current.status}});
    const order=await prisma.order.update({where:{uuid},data:{status},include:{customer:{select:{email:true,phone:true}}}});
    try { await sendOrderStatusWhatsApp(order.customer.phone || order.phone, order); } catch (whatsAppError) { console.error("order status WhatsApp", whatsAppError); }
    return NextResponse.json({message:"Order status updated",data:{uuid:order.uuid,status:order.status}});
  }catch(error){
    if(error?.code==="P2025") return NextResponse.json({message:"Order not found"},{status:404});
    console.error("admin order status",error);
    return NextResponse.json({message:"Unable to update order status"},{status:500});
  }
}
