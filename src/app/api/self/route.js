import { NextResponse } from "next/server";
import { customerFromRequest, safeCustomer } from "@/lib/customerAuth";
import prisma from "@/lib/prisma";
export const runtime="nodejs";export const dynamic="force-dynamic";
const bad=(message,status=422)=>NextResponse.json({message},{status});
const addressOut=a=>({id:a.uuid,uuid:a.uuid,title:a.label[0].toUpperCase()+a.label.slice(1),label:a.label,name:a.name,phone:a.phone,street:a.address,address:a.address,city:a.city,state:a.state,pincode:a.pincode,is_default:a.isDefault,isDefault:a.isDefault});
export async function GET(request){const customer=await customerFromRequest(request);if(!customer)return NextResponse.json({message:"Unauthenticated"},{status:401});const [orders_count,addresses]=await Promise.all([prisma.order.count({where:{customerUuid:customer.uuid}}),prisma.customerAddress.findMany({where:{customerUuid:customer.uuid},orderBy:[{isDefault:"desc"},{createdAt:"desc"}]})]);const list=addresses.map(addressOut);return NextResponse.json({...safeCustomer(customer),address:list,addresses:list,orders_count});}
export async function PUT(request) {
 const customer = await customerFromRequest(request); if (!customer) return bad("Unauthenticated",401);
 try {
  const body=await request.json(); const name=String(body.name||"").trim(); const email=String(body.email||"").trim().toLowerCase();
  if (!name || name.length>120) return bad("Enter a valid name");
  if (email && (!/^\S+@\S+\.\S+$/.test(email) || email.length>255)) return bad("Enter a valid email");
  if (email && await prisma.customer.findFirst({where:{email,NOT:{uuid:customer.uuid}},select:{uuid:true}})) return bad("Email already in use",409);
  // Phone is the unverified account identifier and must not be silently changed in the profile.
  const updated=await prisma.customer.update({where:{uuid:customer.uuid},data:{name,email:email||null}});
  return NextResponse.json({message:"Profile updated",data:safeCustomer(updated)});
 } catch(error) { console.error("Profile update",error); return bad("Unable to update profile",500); }
}
