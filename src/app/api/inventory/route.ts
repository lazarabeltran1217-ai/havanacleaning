import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET — List all inventory items (OWNER only)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await prisma.inventoryItem.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({ items });
}

// POST — Create a new inventory item (OWNER only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (!body.name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const item = await prisma.inventoryItem.create({
    data: {
      name: body.name,
      sku: body.sku || null,
      category: body.category || null,
      unit: body.unit || "each",
      currentStock: body.currentStock || 0,
      minStock: body.minStock || 5,
      costPerUnit: body.costPerUnit || 0,
      supplier: body.supplier || null,
    },
  });

  return NextResponse.json({ item }, { status: 201 });
}
