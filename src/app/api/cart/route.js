import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { customerFromRequest } from "@/lib/customerAuth";
import { isUuid, serializeProduct } from "@/lib/product";
import { validateSelection, keyFor } from "@/lib/cartAttributes";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const reply = (message,status=422) => NextResponse.json({message},{status});
async function auth(request){const c=await customerFromRequest(request);return c && (!request.headers.get("x-cart-customer") || request.headers.get("x-cart-customer")===c.uuid) ? c : null;}
async function loadCart(id){
 const rows=await prisma.customerCartItem.findMany({where:{customerUuid:id},include:{product:{include:{category:true,images:{orderBy:{sortOrder:"asc"}},reviews:{include:{customer:{select:{uuid:true,name:true}}},orderBy:{createdAt:"desc"}}}}},orderBy:{createdAt:"asc"}});
 const data=rows.map(r=>{const product=serializeProduct(r.product);return {id:r.uuid,product_id:r.productUuid,selection_key:r.selectionKey,selected_attributes:r.selectedAttributes,variation_id:null,variation:null,product,quantity:r.quantity,sub_total:Math.round(Number(product.sale_price??product.price)*r.quantity*100)/100};});
 return NextResponse.json({data,items:data,total:data.reduce((n,i)=>n+i.sub_total,0)},{headers:{"Cache-Control":"no-store"}});
}
async function entries(db,raw){
 if(!Array.isArray(raw)||raw.length>50)throw Error("Cart has too many products");
 const seen=new Set(),out=[];
 for(const row of raw){const productId=String(row?.product_id||""),quantity=Number(row?.quantity);
  if(!isUuid(productId)||!Number.isSafeInteger(quantity)||quantity<1||quantity>100)throw Error("Invalid cart product or quantity");
  const attrs=await validateSelection(db,productId,row?.selected_attributes||[]),key=keyFor(attrs),identity=productId+"|"+key;
  if(seen.has(identity))throw Error("Duplicate cart selection");seen.add(identity);out.push({productId,quantity,attrs,key});
 }return out;
}
async function stockCheck(tx,customerId,items){
 const ids=[...new Set(items.map(i=>i.productId))];
 const products=await tx.product.findMany({where:{uuid:{in:ids},status:true},select:{uuid:true,quantity:true}});
 const stock=new Map(products.map(p=>[p.uuid,p.quantity]));
 const existing=await tx.customerCartItem.findMany({where:{customerUuid:customerId},select:{productUuid:true,quantity:true}});
 const totals=new Map();for(const item of items)totals.set(item.productId,(totals.get(item.productId)||0)+item.quantity);
 for(const [id,qty] of totals)if(!stock.has(id)||qty>stock.get(id))throw Error("A product is unavailable or has insufficient stock");
 return {stock,existing};
}
export async function GET(request){const c=await auth(request);return c?loadCart(c.uuid):reply("Customer login required",401);}
export async function PUT(request){const c=await auth(request);if(!c)return reply("Customer login required",401);
 try{const b=await request.json();await prisma.$transaction(async tx=>{const items=await entries(tx,b.items);await stockCheck(tx,c.uuid,items);await tx.customerCartItem.deleteMany({where:{customerUuid:c.uuid}});if(items.length)await tx.customerCartItem.createMany({data:items.map(i=>({customerUuid:c.uuid,productUuid:i.productId,selectionKey:i.key,selectedAttributes:i.attrs,quantity:i.quantity}))});});return loadCart(c.uuid);}catch(e){return reply(e.message||"Could not update cart",409);}
}
export async function POST(request){const c=await auth(request);if(!c)return reply("Customer login required",401);
 try{const b=await request.json();if(b.action==="merge"){
  if(!isUuid(String(b.merge_id||"")))return reply("Invalid merge key");
  try{await prisma.$transaction(async tx=>{await tx.customerCartMerge.create({data:{customerUuid:c.uuid,mergeKey:b.merge_id}});const incoming=await entries(tx,b.items);const current=await tx.customerCartItem.findMany({where:{customerUuid:c.uuid}});const merged=new Map(current.map(i=>[i.productUuid+"|"+i.selectionKey,{productId:i.productUuid,key:i.selectionKey,attrs:i.selectedAttributes,quantity:i.quantity}]));for(const i of incoming){const k=i.productId+"|"+i.key;merged.set(k,{...i,quantity:Math.min(100,(merged.get(k)?.quantity||0)+i.quantity)});}const all=[...merged.values()];const ids=[...new Set(all.map(i=>i.productId))];const products=await tx.product.findMany({where:{uuid:{in:ids},status:true},select:{uuid:true,quantity:true}});const stock=new Map(products.map(i=>[i.uuid,i.quantity]));const totals=new Map();for(const i of all)totals.set(i.productId,(totals.get(i.productId)||0)+i.quantity);if([...totals].some(([id,qty])=>!stock.has(id)||qty>stock.get(id)))throw Error("Insufficient stock for merged cart");await tx.customerCartItem.deleteMany({where:{customerUuid:c.uuid}});if(all.length)await tx.customerCartItem.createMany({data:all.map(i=>({customerUuid:c.uuid,productUuid:i.productId,selectionKey:i.key,selectedAttributes:i.attrs,quantity:i.quantity}))});});}catch(e){if(e.code!=="P2002")throw e;}return loadCart(c.uuid);
 }
 if(b.action==="change"){
  const productId=String(b.product_id||""),delta=Number(b.delta);if(!isUuid(productId)||!Number.isSafeInteger(delta)||!delta||Math.abs(delta)>100)throw Error("Invalid cart change");
  await prisma.$transaction(async tx=>{const attrs=await validateSelection(tx,productId,b.selected_attributes||[]),key=keyFor(attrs);const product=await tx.product.findUnique({where:{uuid:productId},select:{status:true,quantity:true}});if(!product?.status)throw Error("Product unavailable");const where={customerUuid_productUuid_selectionKey:{customerUuid:c.uuid,productUuid:productId,selectionKey:key}};const existing=await tx.customerCartItem.findUnique({where});const quantity=(existing?.quantity||0)+delta;const others=await tx.customerCartItem.aggregate({where:{customerUuid:c.uuid,productUuid:productId,NOT:{selectionKey:key}},_sum:{quantity:true}});if(quantity+(others._sum.quantity||0)>product.quantity||quantity>100)throw Error("Insufficient stock");if(quantity<=0)await tx.customerCartItem.deleteMany({where:{customerUuid:c.uuid,productUuid:productId,selectionKey:key}});else await tx.customerCartItem.upsert({where,create:{customerUuid:c.uuid,productUuid:productId,selectionKey:key,selectedAttributes:attrs,quantity},update:{quantity}});});return loadCart(c.uuid);
 }return reply("Invalid cart action");}catch(e){return reply(e.message||"Could not update cart",409);}
}
export async function DELETE(request){const c=await auth(request);if(!c)return reply("Customer login required",401);const q=new URL(request.url).searchParams;const id=q.get("item_id"),product=q.get("product_id");if(id&&!isUuid(id))return reply("Invalid item ID");if(product&&!isUuid(product))return reply("Invalid product ID");await prisma.customerCartItem.deleteMany({where:{customerUuid:c.uuid,...(id?{uuid:id}:product?{productUuid:product}:{})}});return loadCart(c.uuid);}
