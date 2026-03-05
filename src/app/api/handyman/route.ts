import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// POST — Public submission
export async function POST(req: NextRequest) {
  const body = await req.json();

  // Validate required fields
  if (
    !body.fullName ||
    !body.email ||
    !body.phone ||
    !body.address ||
    !body.projectDescription
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

  // Calculate spam score
  let spamScore = 0;
  if (!body.borough) spamScore += 1;
  if (!body.serviceCategories || body.serviceCategories.length === 0) spamScore += 1;
  if (!body.preferredDate) spamScore += 0.5;
  if (body.projectDescription.length < 10) spamScore += 2;

  const inquiry = await prisma.handymanInquiry.create({
    data: {
      fullName: body.fullName,
      email: body.email.toLowerCase(),
      phone: body.phone,
      borough: body.borough || null,
      address: body.address,
      serviceCategories: body.serviceCategories || [],
      projectDescription: body.projectDescription,
      preferredDate: body.preferredDate ? new Date(body.preferredDate) : null,
      preferredTime: body.preferredTime || null,
      spamScore,
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
