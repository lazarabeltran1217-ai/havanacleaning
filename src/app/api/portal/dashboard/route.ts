import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { todayStartET, weekStartET } from "@/lib/timezone";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const uid = session.user.id;

    // Today boundaries (Eastern Time)
    const today = todayStartET();

    // This-week start (Monday, Eastern Time)
    const weekStart = weekStartET();

    // Run all queries in parallel on the SAME connection pool
    const [
      clockEntry,
      todayJobs,
      allJobs,
      handymanJobs,
      hoursEntries,
      hourlyUser,
      payStubs,
      supplies,
      profile,
      stripePublishableSetting,
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
          handymanInquiry: {
            select: {
              bookingNumber: true,
              address: true,
            },
          },
        },
      }),

      // Upcoming jobs (today and future)
      prisma.jobAssignment.findMany({
        where: {
          employeeId: uid,
          booking: {
            scheduledDate: { gte: today },
            status: { in: ["CONFIRMED", "IN_PROGRESS", "COMPLETED", "PENDING"] },
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
        orderBy: [{ booking: { scheduledDate: "asc" } }, { booking: { scheduledTime: "asc" } }],
        take: 10,
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

      // Handyman inquiries assigned to this employee
      prisma.handymanInquiry.findMany({
        where: {
          assignedEmployees: { array_contains: [uid] },
          status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED"] },
        },
        include: {
          user: { select: { name: true, phone: true } },
        },
        orderBy: { preferredDate: "desc" },
      }),

      // Hours (this week)
      prisma.timeEntry.findMany({
        where: { employeeId: uid, clockIn: { gte: weekStart } },
        include: {
          booking: { select: { bookingNumber: true, service: { select: { name: true } } } },
          handymanInquiry: { select: { bookingNumber: true } },
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
        select: { id: true, name: true, email: true, phone: true, locale: true, createdAt: true, stripeConnectOnboarded: true },
      }).catch(() =>
        prisma.user.findUnique({
          where: { id: uid },
          select: { id: true, name: true, email: true, phone: true, createdAt: true, stripeConnectOnboarded: true },
        }).then((u) => u ? { ...u, locale: "en" } : null)
      ),

      // Stripe publishable key for embedded Connect components
      prisma.setting.findUnique({ where: { key: "api_stripe_publishable" } }).catch(() => null),
    ]);

    const hourlyRate = hourlyUser?.hourlyRate || 0;
    const totalHours = hoursEntries.reduce((sum, e) => sum + (e.hoursWorked || 0), 0);

    // Transform handyman inquiries into the same shape as regular jobs
    const hmJobsShaped = handymanJobs.map((hm) => ({
      id: `hm-${hm.id}`,
      isHandyman: true,
      booking: {
        id: hm.id,
        bookingNumber: hm.bookingNumber,
        scheduledDate: hm.preferredDate?.toISOString() || new Date().toISOString(),
        scheduledTime: hm.preferredTime || "morning",
        status: hm.status,
        customerNotes: hm.projectDescription || null,
        service: { name: "Handyman Service", icon: "wrench" },
        customer: { name: hm.user?.name || hm.fullName, phone: hm.user?.phone || hm.phone },
        address: hm.address
          ? { street: hm.address, unit: null, city: "", state: "", zipCode: "" }
          : null,
      },
    }));

    // Merge handyman upcoming jobs with regular upcoming jobs
    const hmUpcoming = hmJobsShaped.filter((h) => {
      const d = new Date(h.booking.scheduledDate);
      return d >= today && ["PENDING", "CONFIRMED", "IN_PROGRESS"].includes(h.booking.status);
    });

    const mergedTodayJobs = [...todayJobs, ...hmUpcoming].sort((a, b) =>
      new Date(a.booking.scheduledDate).getTime() - new Date(b.booking.scheduledDate).getTime()
    );

    const mergedAllJobs = [...allJobs, ...hmJobsShaped].sort((a, b) =>
      new Date(b.booking.scheduledDate).getTime() - new Date(a.booking.scheduledDate).getTime()
    );

    // Transform clock entry for handyman inquiries
    const clockData = clockEntry
      ? {
          isClockedIn: true,
          currentEntry: {
            ...clockEntry,
            booking: clockEntry.booking || (clockEntry.handymanInquiry ? {
              bookingNumber: clockEntry.handymanInquiry.bookingNumber,
              service: { name: "Handyman Service", icon: "wrench" },
              address: clockEntry.handymanInquiry.address
                ? { street: clockEntry.handymanInquiry.address, city: "" }
                : null,
            } : null),
          },
        }
      : { isClockedIn: false, currentEntry: null };

    return NextResponse.json({
      clock: clockData,
      todayJobs: mergedTodayJobs,
      allJobs: mergedAllJobs,
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
      stripePublishableKey: (typeof stripePublishableSetting?.value === "string" ? stripePublishableSetting.value : null)
        || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        || null,
    });
  } catch (err) {
    console.error("Dashboard GET error:", err);
    return NextResponse.json(
      { error: "Failed to load dashboard data", detail: String(err) },
      { status: 500 }
    );
  }
}
