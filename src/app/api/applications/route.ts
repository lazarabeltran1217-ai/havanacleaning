import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// POST — Public submission (no auth required)
export async function POST(req: NextRequest) {
  const body = await req.json();

  // Basic validation
  if (!body.firstName || !body.lastName || !body.phone || !body.email) {
    return NextResponse.json(
      { error: "Name, phone, and email are required" },
      { status: 400 }
    );
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    return NextResponse.json(
      { error: "Please provide a valid email address" },
      { status: 400 }
    );
  }

  const application = await prisma.jobApplication.create({
    data: {
      firstName: body.firstName,
      middleName: body.middleName || null,
      lastName: body.lastName,
      phone: body.phone,
      email: body.email.toLowerCase(),
      street: body.street || "",
      city: body.city || "Miami",
      state: body.state || "FL",
      zip: body.zip || "",
      authorizedToWork: body.authorizedToWork ?? false,
      requiresSponsorship: body.requiresSponsorship ?? false,
      felonyConviction: body.felonyConviction ?? false,
      felonyExplanation: body.felonyExplanation || null,
      hasDriversLicense: body.hasDriversLicense ?? false,
      hasTransportation: body.hasTransportation ?? false,
      yearsExperience: body.yearsExperience || null,
      cleaningTypes: body.cleaningTypes || [],
      languages: body.languages || [],
      ecoExperience: body.ecoExperience ?? false,
      specialSkills: body.specialSkills || null,
      employmentType: body.employmentType || null,
      availableDays: body.availableDays || [],
      availableHours: body.availableHours || [],
      desiredRate: body.desiredRate || null,
      electronicSignature: body.electronicSignature || null,
      consentBackgroundCheck: body.consentBackgroundCheck ?? false,
      consentDrugScreen: body.consentDrugScreen ?? false,
      references: {
        create: (body.references || [])
          .filter((r: { name: string }) => r.name)
          .map((r: { name: string; phone?: string; email?: string; relationship?: string }) => ({
            name: r.name,
            phone: r.phone || null,
            email: r.email || null,
            relationship: r.relationship || null,
          })),
      },
    },
  });

  return NextResponse.json({ id: application.id });
}

// GET — Admin only
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const applications = await prisma.jobApplication.findMany({
    include: { references: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ applications });
}
