import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET — Employee's active checkouts (supplies in their possession)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const checkouts = await prisma.inventoryCheckout.findMany({
      where: {
        employeeId: session.user.id,
        returnedAt: null,
      },
      include: {
        inventoryItem: { select: { name: true, unit: true } },
        booking: { select: { bookingNumber: true } },
      },
      orderBy: { checkedOutAt: "desc" },
    });

    return NextResponse.json({ checkouts });
  } catch (e) {
    console.error("Supplies GET error:", e);
    // Table might not exist yet — return empty instead of crashing
    return NextResponse.json({ checkouts: [] });
  }
}

// POST — Employee returns checked-out items
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { checkoutId } = await req.json();

    if (!checkoutId) {
      return NextResponse.json({ error: "checkoutId is required" }, { status: 400 });
    }

    // Verify checkout belongs to this employee
    const checkout = await prisma.inventoryCheckout.findFirst({
      where: {
        id: checkoutId,
        employeeId: session.user.id,
        returnedAt: null,
      },
      include: { inventoryItem: true },
    });

    if (!checkout) {
      return NextResponse.json({ error: "Checkout not found" }, { status: 404 });
    }

    const returnQty = checkout.quantity - checkout.returnedQty;
    const previousStock = checkout.inventoryItem.currentStock;
    const newStock = previousStock + returnQty;

    // Mark as returned, add stock back, and log transaction
    await prisma.$transaction([
      prisma.inventoryCheckout.update({
        where: { id: checkoutId },
        data: {
          returnedAt: new Date(),
          returnedQty: checkout.quantity,
        },
      }),
      prisma.inventoryTransaction.create({
        data: {
          inventoryItemId: checkout.inventoryItemId,
          type: "RETURN",
          quantity: returnQty,
          previousStock,
          newStock,
          loggedById: session.user.id,
          notes: "Returned by employee",
        },
      }),
      prisma.inventoryItem.update({
        where: { id: checkout.inventoryItemId },
        data: { currentStock: newStock },
      }),
    ]);

    return NextResponse.json({ success: true, newStock });
  } catch (e) {
    console.error("Supplies POST error:", e);
    return NextResponse.json({ error: "Failed to return supply" }, { status: 500 });
  }
}
