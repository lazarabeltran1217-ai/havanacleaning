import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET — List active checkouts (admin)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const checkouts = await prisma.inventoryCheckout.findMany({
    where: { returnedAt: null },
    include: {
      inventoryItem: { select: { name: true, unit: true } },
      employee: { select: { name: true } },
      booking: { select: { bookingNumber: true } },
    },
    orderBy: { checkedOutAt: "desc" },
  });

  return NextResponse.json({ checkouts });
}

// POST — Check out inventory to an employee (admin)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { inventoryItemId, employeeId, bookingId, quantity, notes } = await req.json();

  if (!inventoryItemId || !employeeId || !quantity) {
    return NextResponse.json(
      { error: "inventoryItemId, employeeId, and quantity are required" },
      { status: 400 }
    );
  }

  const item = await prisma.inventoryItem.findUnique({
    where: { id: inventoryItemId },
  });

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const qty = Math.abs(Number(quantity));
  const previousStock = item.currentStock;
  const newStock = Math.max(0, previousStock - qty);

  // Create checkout record, deduct stock, and log transaction atomically
  const [checkout] = await prisma.$transaction([
    prisma.inventoryCheckout.create({
      data: {
        inventoryItemId,
        employeeId,
        bookingId: bookingId || null,
        quantity: qty,
        notes: notes || null,
      },
    }),
    prisma.inventoryTransaction.create({
      data: {
        inventoryItemId,
        type: "CHECKOUT",
        quantity: qty,
        previousStock,
        newStock,
        bookingId: bookingId || null,
        loggedById: session.user.id,
        notes: `Checked out to employee${notes ? `: ${notes}` : ""}`,
      },
    }),
    prisma.inventoryItem.update({
      where: { id: inventoryItemId },
      data: { currentStock: newStock },
    }),
  ]);

  return NextResponse.json({ checkout, newStock }, { status: 201 });
}
