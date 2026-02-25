import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const featured = searchParams.get("featured");

  const where: Record<string, unknown> = { isActive: true };
  if (featured === "true") where.isFeatured = true;

  const services = await prisma.service.findMany({
    where,
    include: {
      addOns: { where: { isActive: true } },
      pricingRules: { orderBy: [{ bedroomsMin: "asc" }] },
    },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ services });
}
