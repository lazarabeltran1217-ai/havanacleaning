import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      service: true,
      address: true,
      customer: { select: { id: true, name: true, email: true, phone: true } },
      addOns: { include: { addOn: { select: { name: true } } } },
      assignments: { include: { employee: { select: { name: true } } } },
      payments: true,
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // Customers can only see their own bookings
  if (
    session.user.role === "CUSTOMER" &&
    booking.customerId !== session.user.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ booking });
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await req.json();

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // Only owner can update any booking; customer can only cancel or edit (when allowed)
  if (session.user.role === "CUSTOMER") {
    if (booking.customerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Customer edit flow — only when admin has enabled editing
    if (body.customerEdit) {
      if (!booking.customerCanEdit) {
        return NextResponse.json({ error: "Editing is not enabled for this booking" }, { status: 403 });
      }
      const editData: Record<string, unknown> = {
        customerCanEdit: false,
        status: "PENDING",
      };
      if (body.customerNotes !== undefined) editData.customerNotes = body.customerNotes;
      if (body.scheduledDate) editData.scheduledDate = new Date(body.scheduledDate + "T12:00:00");
      if (body.scheduledTime) editData.scheduledTime = body.scheduledTime;

      const updated = await prisma.booking.update({ where: { id }, data: editData });
      return NextResponse.json({ booking: updated });
    }

    // Customers can only cancel
    if (body.status && body.status !== "CANCELLED") {
      return NextResponse.json(
        { error: "You can only cancel your booking" },
        { status: 403 }
      );
    }
  }

  const updateData: Record<string, unknown> = {};
  if (body.status) updateData.status = body.status;
  if (body.internalNotes !== undefined)
    updateData.internalNotes = body.internalNotes;
  if (body.actualHours !== undefined) updateData.actualHours = body.actualHours;
  if (body.rating !== undefined) updateData.rating = body.rating;
  if (body.review !== undefined) updateData.review = body.review;
  if (body.status === "COMPLETED") updateData.completedAt = new Date();
  if (body.scheduledDate) updateData.scheduledDate = new Date(body.scheduledDate + "T12:00:00");
  if (body.scheduledTime) updateData.scheduledTime = body.scheduledTime;

  // Admin reply
  if (body.adminReply !== undefined) {
    updateData.adminReply = body.adminReply;
    updateData.adminRepliedAt = new Date();
    updateData.customerCanEdit = true;
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ booking: updated });
}
