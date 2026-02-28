import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const jobs = await prisma.jobAssignment.findMany({
      where: {
        employeeId: session.user.id,
        booking: {
          scheduledDate: { gte: today, lt: tomorrow },
          status: { in: ["CONFIRMED", "IN_PROGRESS", "COMPLETED"] },
        },
      },
      include: {
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            scheduledDate: true,
            scheduledTime: true,
            status: true,
            customerNotes: true,
            service: { select: { name: true, icon: true } },
            customer: { select: { name: true, phone: true } },
            address: { select: { street: true, unit: true, city: true, state: true, zipCode: true } },
          },
        },
      },
      orderBy: { booking: { scheduledTime: "asc" } },
    });

    return NextResponse.json({ jobs });
  } catch (err) {
    console.error("Portal today jobs GET error:", err);
    return NextResponse.json({ jobs: [] });
  }
}
