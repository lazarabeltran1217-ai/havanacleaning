import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPLOYEE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const openEntry = await prisma.timeEntry.findFirst({
    where: { employeeId: session.user.id, clockOut: null },
    include: { booking: { select: { bookingNumber: true, service: { select: { name: true } } } } },
  });

  return NextResponse.json({
    isClockedIn: !!openEntry,
    currentEntry: openEntry,
  });
}
