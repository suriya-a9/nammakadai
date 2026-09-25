import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { customerFromRequest } from "@/lib/customerAuth";
import { isUuid } from "@/lib/product";
export const runtime="nodejs";
export async function POST(request){const customer=await customerFromRequest(request);if(!customer)return NextResponse.json({message:"Login required"},{status:401});
 try{const b=await request.json();if(!Array.isArray(b.items)||!b.items.length||b.items.length>50)return NextResponse.json({message:"Cart is empty"},{status:422});const ids=b.items.map(i=>i.product_id);if(ids.some(id=>!isUuid(id))||b.items.some(i=>!Number.isSafeInteger(Number(i.quantity))||Number(i.quantity)<1||Number(i.quantity)>100))return NextResponse.json({message:"Invalid cart"},{status:422});
 const products=await prisma.product.findMany({where:{uuid:{in:ids},status:true},select:{uuid:true,name:true,price:true,salePrice:true,quantity:true}});
 if(products.length!==new Set(ids).size)return NextResponse.json({message:"A product is no longer available"},{status:409});const map=new Map(products.map(p=>[p.uuid,p]));let cents=0;const totals=new Map();for(const i of b.items)totals.set(i.product_id,(totals.get(i.product_id)||0)+Number(i.quantity));const items=b.items.map(i=>{const p=map.get(i.product_id);const qty=Number(i.quantity);if(p.quantity<totals.get(i.product_id))throw new Error(`${p.name} has only ${p.quantity} in stock`);const price=Number(p.salePrice??p.price);cents+=Math.round(price*100)*qty;return {product_id:p.uuid,name:p.name,quantity:qty,unit_price:price,selected_attributes:i.selected_attributes||[]};});return NextResponse.json({items,subtotal:cents/100,total:cents/100,payment_method:"cod"});
 }catch(e){return NextResponse.json({message:e.message||"Unable to check cart"},{status:409});}}
