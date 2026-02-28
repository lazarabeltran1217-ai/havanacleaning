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

    const uid = session.user.id;
    const now = new Date();

    // Today boundaries
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // This-week start (Monday)
    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);
    const day = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() + (day === 0 ? -6 : 1 - day));

    // Run all queries in parallel on the SAME connection pool
    const [
      clockEntry,
      todayJobs,
      allJobs,
      hoursEntries,
      hourlyUser,
      payStubs,
      supplies,
      profile,
    ] = await Promise.all([
      // Clock status
      prisma.timeEntry.findFirst({
        where: { employeeId: uid, clockOut: null },
        include: {
          booking: {
            select: {
              bookingNumber: true,
              service: { select: { name: true, icon: true } },
              address: { select: { street: true, city: true } },
            },
          },
        },
      }),

      // Today's jobs
      prisma.jobAssignment.findMany({
        where: {
          employeeId: uid,
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
      }),

      // Schedule (all jobs, last 30)
      prisma.jobAssignment.findMany({
        where: {
          employeeId: uid,
          booking: { status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED"] } },
        },
        include: {
          booking: {
            select: {
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
        orderBy: { booking: { scheduledDate: "desc" } },
        take: 30,
      }),

      // Hours (this week)
      prisma.timeEntry.findMany({
        where: { employeeId: uid, clockIn: { gte: weekStart } },
        include: {
          booking: { select: { bookingNumber: true, service: { select: { name: true } } } },
        },
        orderBy: { clockIn: "desc" },
      }),

      // Hourly rate
      prisma.user.findUnique({
        where: { id: uid },
        select: { hourlyRate: true },
      }),

      // Pay stubs
      prisma.payroll.findMany({
        where: { employeeId: uid, status: "PAID" },
        orderBy: { periodEnd: "desc" },
      }),

      // Supplies
      prisma.inventoryCheckout.findMany({
        where: { employeeId: uid, returnedAt: null },
        include: {
          inventoryItem: { select: { name: true, unit: true } },
          booking: { select: { bookingNumber: true } },
        },
        orderBy: { checkedOutAt: "desc" },
      }).catch(() => []),

      // Profile
      prisma.user.findUnique({
        where: { id: uid },
        select: { id: true, name: true, email: true, phone: true, locale: true, createdAt: true },
      }).catch(() =>
        prisma.user.findUnique({
          where: { id: uid },
          select: { id: true, name: true, email: true, phone: true, createdAt: true },
        }).then((u) => u ? { ...u, locale: "en" } : null)
      ),
    ]);

    const hourlyRate = hourlyUser?.hourlyRate || 0;
    const totalHours = hoursEntries.reduce((sum, e) => sum + (e.hoursWorked || 0), 0);

    return NextResponse.json({
      clock: {
        isClockedIn: !!clockEntry,
        currentEntry: clockEntry,
      },
      todayJobs,
      allJobs,
      hours: {
        entries: hoursEntries,
        summary: {
          totalHours,
          totalEntries: hoursEntries.filter((e) => e.clockOut !== null).length,
          hourlyRate,
          estimatedEarnings: totalHours * hourlyRate,
        },
      },
      payStubs,
      supplies,
      profile,
    });
  } catch (err) {
    console.error("Dashboard GET error:", err);
    return NextResponse.json(
      { error: "Failed to load dashboard data", detail: String(err) },
      { status: 500 }
    );
  }
}
