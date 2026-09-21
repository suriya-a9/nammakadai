import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { CUSTOMER_COOKIE, customerCookieOptions, createCustomerSession, safeCustomer } from "@/lib/customerAuth";
export const runtime="nodejs";
export async function POST(request){
 try {const b=await request.json();const email=String(b.email||"").trim().toLowerCase();const password=String(b.password||"");
 const customer=await prisma.customer.findUnique({where:{email}});
 if(!customer || !(await bcrypt.compare(password,customer.password)))return NextResponse.json({message:"Invalid email or password"},{status:401});
 const response=NextResponse.json({message:"Logged in",data:safeCustomer(customer)});
 response.cookies.set(CUSTOMER_COOKIE,await createCustomerSession(customer),customerCookieOptions);return response;
 }catch(e){console.error("customer login",e);return NextResponse.json({message:"Login failed"},{status:500});}
}
