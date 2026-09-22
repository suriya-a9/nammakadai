import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { CUSTOMER_COOKIE, customerCookieOptions, createCustomerSession, safeCustomer } from "@/lib/customerAuth";
import { sendRegistrationEmail } from "@/lib/orderEmail";
export const runtime = "nodejs";
export async function POST(request) {
 try {
  const b = await request.json();
  const name = String(b.name || "").trim();
  const email = String(b.email || "").trim().toLowerCase();
  const password = String(b.password || "");
  if (!name || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255 || password.length < 8 || password.length > 72 || password !== b.password_confirmation)
    return NextResponse.json({message:"Valid name, email, matching password of 8–72 characters are required"},{status:422});
  if (await prisma.customer.findUnique({where:{email},select:{uuid:true}})) return NextResponse.json({message:"Email already registered"},{status:409});
  const customer = await prisma.customer.create({data:{name,email,password:await bcrypt.hash(password,12),phone:String(b.phone||"").trim().slice(0,30)||null}});
  try { await sendRegistrationEmail(customer); } catch (mailError) { console.error("registration email", mailError); }
  const response = NextResponse.json({message:"Account created",data:safeCustomer(customer)},{status:201});
  response.cookies.set(CUSTOMER_COOKIE, await createCustomerSession(customer), customerCookieOptions);
  return response;
 } catch (e) {if(e?.code==="P2002")return NextResponse.json({message:"Email already registered"},{status:409});console.error("customer register",e);return NextResponse.json({message:"Registration failed"},{status:500});}
}
