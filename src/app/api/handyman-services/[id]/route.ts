import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await req.json();

  const updateData: Record<string, unknown> = {};
  if (body.basePrice !== undefined) updateData.basePrice = body.basePrice;
  if (body.isActive !== undefined) updateData.isActive = body.isActive;

  const updated = await prisma.handymanServicePrice.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ price: updated });
}
