import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminRequest } from "@/lib/adminAuth";
import { keyFor } from "@/lib/cartAttributes";
import { isUuid } from "@/lib/product";

export const runtime = "nodejs";
const fail = (message, status=422) => NextResponse.json({message},{status});
export async function GET(request,{params}) {
 const {admin}=await requireAdminRequest(request);if(!admin)return fail("Unauthorized",401);
 const {productId}=await params;
 const groups=await prisma.productPriceGroup.findMany({where:{productUuid:productId},include:{options:true},orderBy:{label:"asc"}});
 return NextResponse.json({data:groups.map(g=>({uuid:g.uuid,label:g.label,price:Number(g.price),sale_price:g.salePrice==null?"":Number(g.salePrice),options:g.options.map(o=>({uuid:o.uuid,selected_attributes:o.selectedAttributes}))}))});
}
export async function PUT(request,{params}) {
 const {admin}=await requireAdminRequest(request);if(!admin)return fail("Unauthorized",401);
 const {productId}=await params;if(!isUuid(productId))return fail("Invalid product",422);
 try {
  const {groups}=await request.json();if(!Array.isArray(groups)||groups.length>100)return fail("Invalid pricing groups");
  const links=await prisma.productAttributeValue.findMany({where:{productUuid:productId},include:{value:true}});
  const allowed=new Map();for(const link of links){const a=link.value.attributeUuid;if(!allowed.has(a))allowed.set(a,new Set());allowed.get(a).add(link.valueUuid);}
  if(groups.length && !allowed.size)throw Error("Assign product attributes before adding price groups");
  const names=new Set(),keys=new Set();const checked=groups.map(group=>{
   const label=String(group.label||"").trim();const price=Number(group.price);const sale=group.sale_price===""||group.sale_price==null?null:Number(group.sale_price);
   if(!label||label.length>120||names.has(label))throw Error("Every price group needs a unique label");names.add(label);
   if(!Number.isFinite(price)||price<0||Math.abs(Math.round(price*100)-price*100)>0.00001||sale!==null&&(!Number.isFinite(sale)||sale<0||sale>price))throw Error("Invalid price or sale price");
   if(!Array.isArray(group.options)||!group.options.length||group.options.length>200)throw Error("Each group needs at least one valid combination");
   const options=group.options.map(option=>{
    const raw=option.selected_attributes;if(!Array.isArray(raw)||raw.length!==allowed.size)throw Error("Choose one value for every assigned attribute");
    const byAttribute=new Set();const canonical=raw.map(a=>{
     const attr=String(a.attribute_uuid||""),val=String(a.value_uuid||"");
     if(byAttribute.has(attr)||!allowed.get(attr)?.has(val))throw Error("Invalid or duplicate attribute selection");byAttribute.add(attr);return {attribute_uuid:attr,value_uuid:val};
    }).sort((a,b)=>a.attribute_uuid.localeCompare(b.attribute_uuid));
    const key=keyFor(canonical);if(key.length>1000)throw Error("Too many attributes for one combination");if(keys.has(key))throw Error("Duplicate measurement combination across price groups");keys.add(key);return {selectionKey:key,selectedAttributes:canonical};
   });return {label,price,salePrice:sale,options};
  });
  await prisma.$transaction(async tx=>{
   // Existing cart selections are revalidated on checkout. Order snapshots remain unchanged.
   await tx.productPriceGroup.deleteMany({where:{productUuid:productId}});
   for(const group of checked){await tx.productPriceGroup.create({data:{productUuid:productId,label:group.label,price:group.price,salePrice:group.salePrice,options:{create:group.options.map(o=>({...o,productUuid:productId}))}}});}
  });return NextResponse.json({message:"Variant pricing saved"});
 }catch(e){return fail(e.message||"Could not save variant pricing",422);}
}
