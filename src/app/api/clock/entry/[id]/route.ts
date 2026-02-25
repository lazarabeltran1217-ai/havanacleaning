import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const clockIn = body.clockIn ? new Date(body.clockIn) : undefined;
  const clockOut = body.clockOut ? new Date(body.clockOut) : null;

  // Calculate hours worked if both times present
  let hoursWorked: number | null = null;
  if (clockIn && clockOut) {
    hoursWorked = Math.round(((clockOut.getTime() - clockIn.getTime()) / 3600000) * 100) / 100;
  }

  const entry = await prisma.timeEntry.update({
    where: { id },
    data: {
      ...(clockIn && { clockIn }),
      clockOut,
      hoursWorked,
      notes: body.notes !== undefined ? body.notes : undefined,
      isEdited: true,
      editedById: session.user.id,
      editReason: body.notes || "Admin edit",
    },
  });

  return NextResponse.json({ entry });
}
