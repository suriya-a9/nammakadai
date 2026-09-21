import { NextResponse } from "next/server";
import { CUSTOMER_COOKIE, customerCookieOptions } from "@/lib/customerAuth";
export async function POST(){ const res=NextResponse.json({message:"Logged out"});res.cookies.set(CUSTOMER_COOKIE,"",{...customerCookieOptions,maxAge:0});return res; }
