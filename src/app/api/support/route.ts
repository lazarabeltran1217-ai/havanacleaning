import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Honeypot check
  if (body.website || body.company) {
    return NextResponse.json({ id: "ok" });
  }

  // JS token check (bot protection)
  if (!body.jsToken) {
    return NextResponse.json(
      { error: "JavaScript must be enabled" },
      { status: 400 }
    );
  }

  // Validate required fields
  if (!body.name || !body.email || !body.subject || !body.message) {
    return NextResponse.json(
      { error: "Please fill in all required fields" },
      { status: 400 }
    );
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address" },
      { status: 400 }
    );
  }

  try {
    const ticket = await prisma.supportTicket.create({
      data: {
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        subject: body.subject.trim(),
        message: body.message.trim(),
        category: body.category || null,
      },
    });

    return NextResponse.json({ id: ticket.id });
  } catch (error) {
    console.error("Failed to create support ticket:", error);
    return NextResponse.json(
      { error: "Failed to submit. Please try again." },
      { status: 500 }
    );
  }
}
