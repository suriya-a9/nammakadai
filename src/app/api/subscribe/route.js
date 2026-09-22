import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body?.email || "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: "Please enter a valid email address." }, { status: 400 });
    }
    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: {},
      create: { email },
    });
    return NextResponse.json({ message: "Subscribed successfully.", data: subscriber }, { status: 201 });
  } catch (error) {
    console.error("newsletter subscribe", error);
    return NextResponse.json({ message: "Unable to subscribe right now." }, { status: 500 });
  }
}
