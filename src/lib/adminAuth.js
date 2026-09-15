import { jwtVerify, SignJWT } from "jose";
import prisma from "@/lib/prisma";

export const ADMIN_COOKIE = "admin_token";
export const ADMIN_TOKEN_MAX_AGE = 60 * 60 * 24;

const getSecret = () => {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    throw new Error("ADMIN_JWT_SECRET is not configured");
  }
  return new TextEncoder().encode(secret);
};

export const createAdminToken = async (admin) => {
  return new SignJWT({ email: admin.email, name: admin.name, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(admin.uuid)
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(getSecret());
};

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: ADMIN_TOKEN_MAX_AGE,
};

export const readAdminBearerToken = (request) => {
  const cookieToken = request.cookies?.get?.(ADMIN_COOKIE)?.value;
  if (cookieToken) return cookieToken;

  const authorization = request.headers?.get?.("authorization") || "";
  if (authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.slice(7).trim();
  }

  return null;
};

export const verifyAdminToken = async (token, { checkDatabase = true } = {}) => {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.role !== "admin" || !payload.sub) return null;

    if (!checkDatabase) {
      return {
        uuid: payload.sub,
        email: payload.email,
        name: payload.name,
      };
    }

    const admin = await prisma.admin.findUnique({
      where: { uuid: payload.sub },
      select: {
        uuid: true,
        name: true,
        email: true,
        token: true,
        tokenExpiresAt: true,
      },
    });

    if (!admin || admin.token !== token) return null;
    if (!admin.tokenExpiresAt || admin.tokenExpiresAt <= new Date()) return null;

    return {
      uuid: admin.uuid,
      name: admin.name,
      email: admin.email,
    };
  } catch {
    return null;
  }
};

export const requireAdminRequest = async (request) => {
  const token = readAdminBearerToken(request);
  const admin = await verifyAdminToken(token);
  return { admin, token };
};
