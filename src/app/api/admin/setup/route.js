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
    const adminCount = await prisma.admin.count();
    if (adminCount > 0) {
      return NextResponse.json(
        { message: "Admin setup has already been completed" },
        { status: 409 }
      );
    }

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!name) {
      return NextResponse.json({ message: "Admin name is required" }, { status: 422 });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ message: "A valid email is required" }, { status: 422 });
    }
    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters" },
        { status: 422 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    let admin = await prisma.admin.create({
      data: { name, email, password: hashedPassword },
    });

    const token = await createAdminToken(admin);
    const tokenExpiresAt = new Date(Date.now() + ADMIN_TOKEN_MAX_AGE * 1000);
    admin = await prisma.admin.update({
      where: { uuid: admin.uuid },
      data: { token, tokenExpiresAt },
    });

    const response = NextResponse.json(
      {
        message: "Admin created successfully",
        data: { uuid: admin.uuid, name: admin.name, email: admin.email },
      },
      { status: 201 }
    );
    response.cookies.set(ADMIN_COOKIE, token, adminCookieOptions);
    return response;
  } catch (error) {
    if (error?.code === "P2002") {
      return NextResponse.json({ message: "Email already exists" }, { status: 409 });
    }
    console.error("POST /api/admin/setup failed:", error);
    return NextResponse.json({ message: "Failed to create admin" }, { status: 500 });
  }
}
