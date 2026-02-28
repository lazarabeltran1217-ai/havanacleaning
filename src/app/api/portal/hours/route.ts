import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const period = req.nextUrl.searchParams.get("period") || "week";

    const now = new Date();
    let startDate: Date;

    if (period === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      // This week (Monday start)
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      const day = startDate.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      startDate.setDate(startDate.getDate() + diff);
    }

    const entries = await prisma.timeEntry.findMany({
      where: {
        employeeId: session.user.id,
        clockIn: { gte: startDate },
      },
      include: {
        booking: {
          select: {
            bookingNumber: true,
            service: { select: { name: true } },
          },
        },
      },
      orderBy: { clockIn: "desc" },
    });

    // Get employee hourly rate
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { hourlyRate: true },
    });

    const hourlyRate = user?.hourlyRate || 0;
    const totalHours = entries.reduce((sum, e) => sum + (e.hoursWorked || 0), 0);

    return NextResponse.json({
      entries,
      summary: {
        totalHours,
        totalEntries: entries.filter((e) => e.clockOut !== null).length,
        hourlyRate,
        estimatedEarnings: totalHours * hourlyRate,
      },
    });
  } catch (err) {
    console.error("Portal hours GET error:", err);
    return NextResponse.json({
      entries: [],
      summary: { totalHours: 0, totalEntries: 0, hourlyRate: 0, estimatedEarnings: 0 },
    });
  }
}
