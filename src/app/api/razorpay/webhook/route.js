import { NextResponse } from "next/server";
import { verifySignature } from "@/lib/razorpay";
import { confirmRazorpay } from "@/lib/confirmRazorpay";
export const runtime="nodejs";
export async function POST(request){const raw=await request.text();if(!verifySignature(raw,request.headers.get("x-razorpay-signature"),process.env.RAZORPAY_WEBHOOK_SECRET))return NextResponse.json({message:"Invalid signature"},{status:403});const event=JSON.parse(raw);if(event.event==="payment.captured"){const payment=event.payload?.payment?.entity;if(payment?.order_id&&payment?.id){try{await confirmRazorpay(payment.order_id,payment.id)}catch(error){console.error("webhook confirmation",error);return NextResponse.json({message:"Retry required"},{status:500});}}}return NextResponse.json({ok:true});}
