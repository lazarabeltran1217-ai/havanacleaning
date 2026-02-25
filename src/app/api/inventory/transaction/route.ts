import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST — Log an inventory transaction (purchase, usage, adjustment, damaged)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (!body.inventoryItemId || !body.type || body.quantity === undefined) {
    return NextResponse.json(
      { error: "inventoryItemId, type, and quantity are required" },
      { status: 400 }
    );
  }

  const validTypes = ["PURCHASE", "USAGE", "ADJUSTMENT", "DAMAGED"];
  if (!validTypes.includes(body.type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  // Get current item
  const item = await prisma.inventoryItem.findUnique({
    where: { id: body.inventoryItemId },
  });

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const quantity = Number(body.quantity);
  const previousStock = item.currentStock;

  // Calculate new stock
  let newStock: number;
  if (body.type === "PURCHASE") {
    newStock = previousStock + Math.abs(quantity);
  } else if (body.type === "USAGE" || body.type === "DAMAGED") {
    newStock = Math.max(0, previousStock - Math.abs(quantity));
  } else {
    // ADJUSTMENT — quantity is the new absolute stock level
    newStock = quantity;
  }

  // Create transaction and update stock atomically
  const [transaction] = await prisma.$transaction([
    prisma.inventoryTransaction.create({
      data: {
        inventoryItemId: body.inventoryItemId,
        type: body.type,
        quantity: Math.abs(quantity),
        previousStock,
        newStock,
        bookingId: body.bookingId || null,
        loggedById: session.user.id,
        notes: body.notes || null,
      },
    }),
    prisma.inventoryItem.update({
      where: { id: body.inventoryItemId },
      data: { currentStock: newStock },
    }),
  ]);

  return NextResponse.json({ transaction, newStock }, { status: 201 });
}
