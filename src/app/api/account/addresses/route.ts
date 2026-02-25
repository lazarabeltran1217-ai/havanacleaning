import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ addresses });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (!body.street || !body.zipCode) {
    return NextResponse.json(
      { error: "Street and ZIP code are required" },
      { status: 400 }
    );
  }

  const address = await prisma.address.create({
    data: {
      userId: session.user.id,
      label: body.label || "Home",
      street: body.street,
      unit: body.unit || null,
      city: body.city || "Miami",
      state: body.state || "FL",
      zipCode: body.zipCode,
      notes: body.notes || null,
      isDefault: body.isDefault || false,
    },
  });

  return NextResponse.json({ address });
}
