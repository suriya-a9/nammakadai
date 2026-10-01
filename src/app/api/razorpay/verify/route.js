import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { customerFromRequest } from "@/lib/customerAuth";
import { verifySignature } from "@/lib/razorpay";
import { confirmRazorpay } from "@/lib/confirmRazorpay";
export const runtime="nodejs";
export async function POST(request){const customer=await customerFromRequest(request);if(!customer)return NextResponse.json({message:"Login required"},{status:401});try{const body=await request.json();const id=String(body.razorpay_order_id||""),payment=String(body.razorpay_payment_id||"");const order=await prisma.order.findFirst({where:{razorpayOrderId:id,customerUuid:customer.uuid}});if(!order||!verifySignature(`${id}|${payment}`,body.razorpay_signature,process.env.RAZORPAY_KEY_SECRET))return NextResponse.json({message:"Invalid payment verification"},{status:403});const confirmed=await confirmRazorpay(id,payment);return NextResponse.json({order_number:confirmed.orderNumber});}catch(error){console.error("payment verification",error);return NextResponse.json({message:"Payment could not be confirmed. If charged, contact support with your payment ID; do not pay again."},{status:409});}}
