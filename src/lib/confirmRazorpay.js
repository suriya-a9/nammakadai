import prisma from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay";
import { sendNewOrderAdminEmail } from "@/lib/orderEmail";
import { sendOrderConfirmationWhatsApp } from "@/lib/whatsapp";
export async function confirmRazorpay(razorpayOrderId,paymentId){
 const payment=await razorpay(`payments/${encodeURIComponent(paymentId)}`);
 if(payment.order_id!==razorpayOrderId||payment.status!=="captured"||payment.currency!=="INR")throw new Error("Payment has not been captured");
 const result=await prisma.$transaction(async tx=>{
  const order=await tx.order.findUnique({where:{razorpayOrderId},include:{items:true}});
  if(!order||order.paymentMethod!=="razorpay"||Math.round(Number(order.total)*100)!==payment.amount)throw new Error("Payment does not match order");
  if(order.paymentStatus==="paid") {if(order.razorpayPaymentId!==paymentId)throw new Error("Payment mismatch");return {order,changed:false};}
  if(order.paymentStatus!=="pending")throw new Error("Order cannot be confirmed");
  const changed=await tx.order.updateMany({where:{uuid:order.uuid,paymentStatus:"pending"},data:{paymentStatus:"processing"}});
  if(changed.count!==1)throw new Error("Payment confirmation already in progress");
  const totals=new Map();for(const item of order.items)totals.set(item.productUuid,(totals.get(item.productUuid)||0)+item.quantity);
  for(const [uuid,quantity] of totals){const updated=await tx.product.updateMany({where:{uuid,status:true,quantity:{gte:quantity}},data:{quantity:{decrement:quantity}}});if(updated.count!==1)throw new Error("Paid order needs manual fulfillment: insufficient stock");}
  const updated=await tx.order.update({where:{uuid:order.uuid},data:{paymentStatus:"paid",status:"placed",razorpayPaymentId:paymentId},include:{items:true}});
  for(const item of order.items)await tx.customerCartItem.deleteMany({where:{customerUuid:order.customerUuid,productUuid:item.productUuid,selectionKey:(item.selectedAttributes||[]).map(a=>a.value_uuid).sort().join(":")}});
  return {order:updated,changed:true};
 });
 if(result.changed){try{await sendNewOrderAdminEmail(result.order)}catch(error){console.error("admin email",error)}try{await sendOrderConfirmationWhatsApp(result.order.phone,result.order)}catch(error){console.error("WhatsApp",error)}}
 return result.order;
}
