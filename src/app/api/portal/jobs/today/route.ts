import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { todayStartET, tomorrowStartET } from "@/lib/timezone";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = todayStartET();
    const tomorrow = tomorrowStartET();

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
