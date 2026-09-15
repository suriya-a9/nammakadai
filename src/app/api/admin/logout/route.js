import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ADMIN_COOKIE, readAdminBearerToken, verifyAdminToken } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function POST(request) {
  const token = readAdminBearerToken(request);
  const admin = await verifyAdminToken(token);

  if (admin) {
    await prisma.admin.update({
      where: { uuid: admin.uuid },
      data: { token: null, tokenExpiresAt: null },
    });
  }

  const response = NextResponse.json({ message: "Logged out successfully" });
  response.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
