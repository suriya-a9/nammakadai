import { NextResponse } from "next/server";
// Registration is replaced by automatic account creation during mobile login.
export async function POST() { return NextResponse.json({ message: "Use mobile login", login: "/auth/login" }, { status: 410 }); }
