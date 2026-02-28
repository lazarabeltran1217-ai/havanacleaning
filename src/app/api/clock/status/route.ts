import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ isClockedIn: false, currentEntry: null });
    }

    const openEntry = await prisma.timeEntry.findFirst({
      where: { employeeId: session.user.id, clockOut: null },
      include: {
        booking: {
          select: {
            bookingNumber: true,
            service: { select: { name: true, icon: true } },
            address: { select: { street: true, city: true } },
          },
        },
      },
    });

    return NextResponse.json({
      isClockedIn: !!openEntry,
      currentEntry: openEntry,
    });
  } catch (err) {
    console.error("Clock status GET error:", err);
    return NextResponse.json({ isClockedIn: false, currentEntry: null });
  }
}
