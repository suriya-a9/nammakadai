import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { normalizeMobile } from "@/lib/mobileNumber";
import { CUSTOMER_COOKIE, customerCookieOptions, createCustomerSession, safeCustomer } from "@/lib/customerAuth";
import { sendWelcomeWhatsApp } from "@/lib/whatsapp";
export const runtime = "nodejs";
// IMPORTANT: Requested passwordless AND verification-free login. Anyone who knows a phone number can impersonate its owner.
export async function POST(request) {
  try {
    const body = await request.json();
    const phone = normalizeMobile(body.phone);
    if (!phone) return NextResponse.json({ message: "Enter a valid Indian mobile number" }, { status: 422 });
    let customer = await prisma.customer.findUnique({ where: { phone } });
    let created = false;
    if (!customer) {
      // Pre-migration legacy records may have 10-digit phone values. Migrate them first (see setup guide).
      try { customer = await prisma.customer.create({ data: { phone, name: "Customer" } }); created = true; }
      catch (error) { if (error?.code !== "P2002") throw error; customer = await prisma.customer.findUnique({ where: { phone } }); }
    }
    if (!customer) throw new Error("Unable to resolve customer");
    const response = NextResponse.json({ message: "Logged in", data: safeCustomer(customer) });
    response.cookies.set(CUSTOMER_COOKIE, await createCustomerSession(customer), customerCookieOptions);
    if (created) { try { await sendWelcomeWhatsApp(phone); } catch (error) { console.error("Welcome WhatsApp failed", error); } }
    return response;
  } catch (error) { console.error("Mobile login", error); return NextResponse.json({ message: "Unable to sign in" }, { status: 500 }); }
}
