import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const FREE_EMAIL_DOMAINS = [
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
  "aol.com", "icloud.com", "mail.com", "protonmail.com",
];

// POST — Public submission
export async function POST(req: NextRequest) {
  const body = await req.json();

  // Validate required fields
  if (
    !body.companyName ||
    !body.contactName ||
    !body.contactEmail ||
    !body.contactPhone ||
    !body.propertyAddress
  ) {
    return NextResponse.json(
      { error: "Please fill in all required fields" },
      { status: 400 }
    );
  }

  // Business email validation
  const emailDomain = body.contactEmail.split("@")[1]?.toLowerCase();
  if (FREE_EMAIL_DOMAINS.includes(emailDomain)) {
    return NextResponse.json(
      { error: "Please use a business email address for commercial inquiries" },
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

  // Calculate spam score (0 = not spam, higher = more suspicious)
  let spamScore = 0;
  if (!body.industry) spamScore += 1;
  if (!body.squareFootage) spamScore += 1;
  if (!body.contactTitle) spamScore += 0.5;
  if (body.serviceTypes?.length === 0) spamScore += 1;
  // Free email already rejected above, but if it somehow gets through
  if (FREE_EMAIL_DOMAINS.includes(emailDomain)) spamScore += 3;

  const inquiry = await prisma.commercialInquiry.create({
    data: {
      companyName: body.companyName,
      industry: body.industry || null,
      website: body.website || null,
      contactName: body.contactName,
      contactTitle: body.contactTitle || null,
      contactEmail: body.contactEmail.toLowerCase(),
      contactPhone: body.contactPhone,
      propertyAddress: body.propertyAddress,
      squareFootage: body.squareFootage || null,
      floors: body.floors || null,
      serviceTypes: body.serviceTypes || [],
      areas: body.areas || [],
      budgetRange: body.budgetRange || null,
      specialRequirements: body.specialRequirements || null,
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

  const inquiries = await prisma.commercialInquiry.findMany({
    include: { quotes: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ inquiries });
}
