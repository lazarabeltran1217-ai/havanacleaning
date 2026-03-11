import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const service = await prisma.service.findUnique({
    where: { id },
    select: {
      id: true,
      includedItems: true,
      extraItemPrice: true,
      items: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: { id: true, name: true, nameEs: true, icon: true },
      },
    },
  });

  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  return NextResponse.json({
    items: service.items,
    includedItems: service.includedItems,
    extraItemPrice: service.extraItemPrice,
  });
}
