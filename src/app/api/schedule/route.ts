import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET — bookings for a given week + all employees
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const weekStart = searchParams.get("start"); // ISO date string (Monday)

  let start: Date;
  if (weekStart) {
    start = new Date(weekStart);
  } else {
    // Default to current week's Monday
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
  }

  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  const [bookings, employees] = await Promise.all([
    prisma.booking.findMany({
      where: {
        scheduledDate: { gte: start, lt: end },
        status: { not: "CANCELLED" },
      },
      include: {
        service: { select: { name: true, icon: true } },
        customer: { select: { name: true, phone: true } },
        address: { select: { street: true, city: true } },
        assignments: {
          include: { employee: { select: { id: true, name: true } } },
        },
      },
      orderBy: { scheduledTime: "asc" },
    }),
    prisma.user.findMany({
      where: { role: "EMPLOYEE", isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return NextResponse.json({ bookings, employees, weekStart: start.toISOString() });
}
