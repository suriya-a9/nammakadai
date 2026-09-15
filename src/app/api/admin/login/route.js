import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import {
  ADMIN_COOKIE,
  ADMIN_TOKEN_MAX_AGE,
  adminCookieOptions,
  createAdminToken,
} from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 422 }
      );
    }

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    const token = await createAdminToken(admin);
    const tokenExpiresAt = new Date(Date.now() + ADMIN_TOKEN_MAX_AGE * 1000);
    await prisma.admin.update({
      where: { uuid: admin.uuid },
      data: { token, tokenExpiresAt },
    });

    const response = NextResponse.json({
      message: "Login successful",
      data: { uuid: admin.uuid, name: admin.name, email: admin.email },
      expires_in: ADMIN_TOKEN_MAX_AGE,
    });
    response.cookies.set(ADMIN_COOKIE, token, adminCookieOptions);
    return response;
  } catch (error) {
    console.error("POST /api/admin/login failed:", error);
    return NextResponse.json({ message: "Login failed" }, { status: 500 });
  }
}
