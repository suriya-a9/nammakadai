import { createHash } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import prisma from "@/lib/prisma";

export const CUSTOMER_COOKIE = "customer_session";
export const customerCookieOptions = { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 86400 };
const key = () => {
  const secret = process.env.CUSTOMER_JWT_SECRET || process.env.ADMIN_JWT_SECRET;
  if (!secret || secret.startsWith("replace-")) throw new Error("Set CUSTOMER_JWT_SECRET in .env.local");
  return createHash("sha256").update(`nammakadai-customer:${secret}`).digest();
};
export async function createCustomerSession(customer) {
  return new SignJWT({ role: "customer" }).setProtectedHeader({ alg: "HS256" }).setSubject(customer.uuid).setIssuedAt().setExpirationTime("1d").sign(key());
}
export async function customerFromToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    if (payload.role !== "customer" || !payload.sub) return null;
    return await prisma.customer.findUnique({ where: { uuid: payload.sub }, select: { uuid: true, name: true, email: true, phone: true } });
  } catch { return null; }
}
export async function customerFromRequest(request) {
  return customerFromToken(request.cookies.get(CUSTOMER_COOKIE)?.value);
}
export function safeCustomer(customer) { return { id: customer.uuid, uuid: customer.uuid, name: customer.name, email: customer.email, phone: customer.phone }; }
