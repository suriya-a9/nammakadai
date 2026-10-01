import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import prisma from "@/lib/prisma";
import { customerFromRequest } from "@/lib/customerAuth";
import { validateSelection } from "@/lib/cartAttributes";
import { priceForSelection } from "@/lib/variantPricing";
import { razorpay } from "@/lib/razorpay";
export const runtime="nodejs";
export async function POST(request){
 const customer=await customerFromRequest(request);if(!customer)return NextResponse.json({message:"Login required"},{status:401});
 try{
  const body=await request.json();const address=await prisma.customerAddress.findFirst({where:{uuid:String(body.address_id||""),customerUuid:customer.uuid}});
  if(!address)throw new Error("Choose a valid delivery address");
  const cart=await prisma.customerCartItem.findMany({where:{customerUuid:customer.uuid}});
  if(!cart.length||cart.length>50)throw new Error("Cart is empty or too large");
  const submitted=Array.isArray(body.items)?body.items:[];
  const submittedMap=new Map(submitted.map(item=>[`${item.product_id}|${(item.selected_attributes||[]).map(a=>a.value_uuid).sort().join(":")}`,Number(item.quantity)]));
  if(submitted.length!==cart.length||cart.some(item=>submittedMap.get(`${item.productUuid}|${item.selectionKey}`)!==item.quantity))throw new Error("Cart changed. Refresh checkout.");
  const products=await prisma.product.findMany({where:{uuid:{in:cart.map(item=>item.productUuid)},status:true},select:{uuid:true,name:true,quantity:true,price:true,salePrice:true}});
  const map=new Map(products.map(item=>[item.uuid,item]));const totals=new Map();const lines=[];let totalPaise=0;
  for(const item of cart){const product=map.get(item.productUuid);if(!product)throw new Error("Product unavailable");totals.set(product.uuid,(totals.get(product.uuid)||0)+item.quantity);const attrs=await validateSelection(prisma,product.uuid,item.selectedAttributes||[]);const price=(await priceForSelection(prisma,product,attrs)).price;const paise=Math.round(price*100);if(!Number.isSafeInteger(paise)||paise<1)throw new Error("Invalid price");totalPaise+=paise*item.quantity;lines.push({productUuid:product.uuid,productName:product.name,quantity:item.quantity,unitPrice:price,lineTotal:paise*item.quantity/100,selectedAttributes:attrs});}
  for(const [id,qty] of totals)if(map.get(id).quantity<qty)throw new Error(`${map.get(id).name} has insufficient stock`);
  if(!Number.isSafeInteger(totalPaise)||totalPaise<100)throw new Error("Invalid order total");
  const number=`NK-${Date.now()}-${randomUUID().slice(0,8).toUpperCase()}`;
  const remote=await razorpay("orders",{method:"POST",body:JSON.stringify({amount:totalPaise,currency:"INR",receipt:number,notes:{customer:customer.uuid}})});
  const order=await prisma.order.create({data:{orderNumber:number,customerUuid:customer.uuid,name:address.name,phone:address.phone,address:address.address,city:address.city,state:address.state,pincode:address.pincode,notes:String(body.notes||"").slice(0,1000)||null,subtotal:totalPaise/100,total:totalPaise/100,status:"payment_pending",paymentMethod:"razorpay",paymentStatus:"pending",razorpayOrderId:remote.id,items:{create:lines}}});
  return NextResponse.json({key:process.env.RAZORPAY_KEY_ID,razorpay_order_id:remote.id,amount:totalPaise,currency:"INR",order_number:order.orderNumber,customer:{name:address.name,contact:address.phone,email:customer.email||""}});
 }catch(error){console.error("razorpay create",error);return NextResponse.json({message:error.message||"Unable to start payment"},{status:409});}
}
