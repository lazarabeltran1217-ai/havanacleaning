import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { serviceId, name, nameEs, icon, sortOrder } = body;

  if (!serviceId || !name) {
    return NextResponse.json({ error: "Service ID and name are required" }, { status: 400 });
  }

  const item = await prisma.serviceItem.create({
    data: {
      serviceId,
      name,
      nameEs: nameEs || null,
      icon: icon || null,
      sortOrder: sortOrder ?? 0,
      isActive: true,
    },
  });

  return NextResponse.json({ item });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // Bulk update: service includedItems and extraItemPrice
  if (body.serviceId && body.includedItems !== undefined) {
    await prisma.service.update({
      where: { id: body.serviceId },
      data: {
        includedItems: body.includedItems,
        extraItemPrice: body.extraItemPrice,
      },
    });
    return NextResponse.json({ success: true });
  }

  // Single item update
  const { id, name, nameEs, icon, sortOrder, isActive } = body;
  if (!id) {
    return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
  }

  const item = await prisma.serviceItem.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(nameEs !== undefined && { nameEs }),
      ...(icon !== undefined && { icon }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return NextResponse.json({ item });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
  }

  await prisma.serviceItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
