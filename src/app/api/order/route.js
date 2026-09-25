import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import prisma from "@/lib/prisma";
import { customerFromRequest } from "@/lib/customerAuth";
import { isUuid } from "@/lib/product";
import { validateSelection } from "@/lib/cartAttributes";
import { sendNewOrderEmails } from "@/lib/orderEmail";
export const runtime="nodejs";export const dynamic="force-dynamic";
const invalid=(message,status=422)=>NextResponse.json({message},{status});
const serialize=(o)=>({id:o.uuid,uuid:o.uuid,order_number:o.orderNumber,created_at:o.createdAt,total:Number(o.total),subtotal:Number(o.subtotal),status:o.status,payment_status:o.paymentStatus,payment_method:o.paymentMethod,shipping_address:{name:o.name,phone:o.phone,address:o.address,city:o.city,state:o.state,pincode:o.pincode},items:o.items?.map(i=>({name:i.productName,quantity:i.quantity,price:Number(i.unitPrice),total:Number(i.lineTotal),selected_attributes:i.selectedAttributes||[]}))});
export async function GET(request){
 const customer=await customerFromRequest(request);if(!customer)return invalid("Login required",401);
 const q=new URL(request.url).searchParams;const page=Math.max(1,Number.parseInt(q.get("page"),10)||1);const perPage=Math.min(50,Math.max(1,Number.parseInt(q.get("paginate"),10)||10));
 const [rows,total]=await Promise.all([prisma.order.findMany({where:{customerUuid:customer.uuid},include:{items:true},orderBy:{createdAt:"desc"},skip:(page-1)*perPage,take:perPage}),prisma.order.count({where:{customerUuid:customer.uuid}})]);
 return NextResponse.json({data:rows.map(serialize),total,current_page:page,last_page:Math.max(1,Math.ceil(total/perPage)),per_page:perPage});
}
export async function POST(request){
 const customer=await customerFromRequest(request);if(!customer)return invalid("Please login before placing your order",401);
 try {
  const b=await request.json();
  const savedAddress=await prisma.customerAddress.findFirst({where:{uuid:String(b.address_id||""),customerUuid:customer.uuid}});
  if(!savedAddress)return invalid("Please select a valid saved delivery address");
  const name=savedAddress.name;const phone=savedAddress.phone;const address=savedAddress.address;const city=savedAddress.city;const state=savedAddress.state;const pincode=savedAddress.pincode;
  if(b.payment_method!=="cod")return invalid("Only Cash on Delivery is supported at this time");
  if(!Array.isArray(b.items)||b.items.length===0||b.items.length>50)return invalid("Cart is empty or too large");
  const items=[];const unique=new Set();
  for(const item of b.items){const id=String(item.product_id||"");const quantity=Number(item.quantity);if(!isUuid(id)||!Number.isSafeInteger(quantity)||quantity<1||quantity>100||unique.has(id+"|"+(item.selected_attributes||[]).map(a=>a.value_uuid).sort().join(":")))return invalid("Invalid cart items");unique.add(id+"|"+(item.selected_attributes||[]).map(a=>a.value_uuid).sort().join(":"));items.push({id,quantity,selected_attributes:item.selected_attributes||[]});}
  // Order and stock changes commit together; changing client-side prices cannot affect order totals.
  const order=await prisma.$transaction(async(tx)=>{
    // Orders must match the customer's saved cart, not an arbitrary browser payload.
    const savedCart = await tx.customerCartItem.findMany({where:{customerUuid:customer.uuid},select:{productUuid:true,quantity:true,selectionKey:true,selectedAttributes:true}});
    const submitted = new Map(items.map(i=>[i.id+"|"+i.selected_attributes.map(a=>a.value_uuid).sort().join(":"),i.quantity]));
    if(savedCart.length!==items.length || savedCart.some(i=>submitted.get(i.productUuid+"|"+i.selectionKey)!==i.quantity)) {
      throw new Error("Your cart changed. Please refresh the cart before placing your order.");
    }
    for(const item of items){
      const verified=await validateSelection(tx,item.id,item.selected_attributes);
      const saved=savedCart.find(c=>c.productUuid===item.id && c.selectionKey===verified.map(a=>a.value_uuid).sort().join(":"));
      // Compare canonical attribute/value IDs rather than JSON serialization.
      // The cart may contain an older snapshot with a different field order or
      // updated display names, even when the selected values remain valid.
      const savedKey = (saved?.selectedAttributes || []).map(a => String(a.value_uuid)).sort().join(":");
      const verifiedKey = verified.map(a => a.value_uuid).sort().join(":");
      if (!saved || savedKey !== verifiedKey) throw new Error("Product attributes changed. Please reselect this product before ordering.");
      // Store current canonical names/values in the order, not stale cart labels.
      item.verifiedAttributes = verified;
    }
    const products=await tx.product.findMany({where:{uuid:{in:items.map(i=>i.id)},status:true},select:{uuid:true,name:true,price:true,salePrice:true,quantity:true}});
    if(products.length!==new Set(items.map(i=>i.id)).size)throw new Error("One or more products are no longer available");
    const byId=new Map(products.map(p=>[p.uuid,p]));let subtotal=0;
    const lines=items.map(item=>{const p=byId.get(item.id);const price=Number(p.salePrice??p.price);if(!Number.isFinite(price)||price<0)throw new Error("Invalid product price");subtotal+=Math.round(price*100)*item.quantity;return {productUuid:p.uuid,productName:p.name,quantity:item.quantity,unitPrice:price,lineTotal:Math.round(price*100)*item.quantity/100,selectedAttributes:item.verifiedAttributes||[]};});
    for(const [id,qty] of [...new Set(items.map(i=>i.id))].map(id=>[id,items.filter(i=>i.id===id).reduce((n,i)=>n+i.quantity,0)])){const result=await tx.product.updateMany({where:{uuid:id,status:true,quantity:{gte:qty}},data:{quantity:{decrement:qty}}});if(result.count!==1)throw new Error("A product is out of stock or quantity changed. Please update your cart.");}
    const placedOrder = await tx.order.create({data:{orderNumber:`NK-${Date.now()}-${randomUUID().slice(0,8).toUpperCase()}`,customerUuid:customer.uuid,name,phone,address,city,state,pincode,notes:String(b.notes||"").trim().slice(0,1000)||null,subtotal:subtotal/100,total:subtotal/100,items:{create:lines}},include:{items:true}});
    // Remove purchased items in the SAME transaction as order creation and stock adjustment.
    const cleared = await tx.customerCartItem.deleteMany({where:{customerUuid:customer.uuid}});
    if (cleared.count !== items.length) throw new Error("Your cart changed. Please refresh the cart before placing your order.");
    return placedOrder;
  });
  try { await sendNewOrderEmails(order, customer.email); } catch (mailError) { console.error("new order email", mailError); }
  return NextResponse.json({message:"Order placed successfully",data:serialize(order)},{status:201});
 }catch(e){if(e?.message?.includes("stock")||e?.message?.includes("available")||e?.message?.includes("price")||e?.message?.includes("cart changed")||e?.message?.includes("attributes changed"))return invalid(e.message,409);console.error("place order",e);return invalid("Unable to place order. Please try again.",500);}
}
