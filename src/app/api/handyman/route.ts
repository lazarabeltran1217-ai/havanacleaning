import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export const dynamic = "force-dynamic";

// POST — Public submission (booking wizard)
export async function POST(req: NextRequest) {
  const body = await req.json();

  // Validate required fields
  if (
    !body.fullName ||
    !body.email ||
    !body.address ||
    !body.serviceCategories?.length
  ) {
    return NextResponse.json(
      { error: "Please fill in all required fields" },
      { status: 400 }
    );
  }

  // JS token validation (basic bot check)
  if (!body.jsToken) {
    return NextResponse.json(
      { error: "JavaScript must be enabled" },
      { status: 400 }
    );
  }

  // Password required for account creation
  if (!body.customerPassword || body.customerPassword.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  // Calculate spam score
  let spamScore = 0;
  if (!body.borough) spamScore += 1;
  if (!body.preferredDate) spamScore += 0.5;
  if (!body.projectDescription || body.projectDescription.length < 10) spamScore += 2;

  // Find or create user account
  const emailLower = body.email.trim().toLowerCase();
  let user = await prisma.user.findUnique({ where: { email: emailLower } });

  if (user) {
    // Update phone if provided and missing
    if (body.phone && !user.phone) {
      await prisma.user.update({
        where: { id: user.id },
        data: { phone: body.phone },
      });
    }
  } else {
    const hashedPassword = await hash(body.customerPassword, 12);
    user = await prisma.user.create({
      data: {
        email: emailLower,
        password: hashedPassword,
        name: body.fullName.trim(),
        phone: body.phone?.trim() || null,
        role: "CUSTOMER",
      },
    });
  }

  const inquiry = await prisma.handymanInquiry.create({
    data: {
      fullName: body.fullName.trim(),
      email: emailLower,
      phone: body.phone?.trim() || "",
      borough: body.borough || null,
      address: body.address,
      serviceCategories: body.serviceCategories || [],
      projectDescription: body.projectDescription || "",
      preferredDate: body.preferredDate ? new Date(body.preferredDate) : null,
      preferredTime: body.preferredTime || null,
      rush: body.rush || false,
      spamScore,
      userId: user.id,
    },
  });

  return NextResponse.json({ id: inquiry.id });
}

// GET — Admin only
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const inquiries = await prisma.handymanInquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ inquiries });
}
