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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const jobs = await prisma.jobAssignment.findMany({
    where: {
      employeeId: session.user.id,
      booking: {
        scheduledDate: { gte: today, lt: tomorrow },
        status: { in: ["CONFIRMED", "IN_PROGRESS"] },
      },
    },
    include: {
      booking: {
        select: {
          bookingNumber: true,
          scheduledTime: true,
          status: true,
          service: { select: { name: true, icon: true } },
          address: { select: { street: true, city: true } },
        },
      },
    },
    orderBy: { booking: { scheduledTime: "asc" } },
  });

  return NextResponse.json({ jobs });
}
