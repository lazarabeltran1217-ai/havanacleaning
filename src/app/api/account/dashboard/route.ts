import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { todayStartET } from "@/lib/timezone";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const uid = session.user.id;
    const today = todayStartET();

    const [profile, upcomingBookings, recentBookings, addresses, totalCount, totalSpent] =
      await Promise.all([
        // Profile
        prisma.user.findUnique({
          where: { id: uid },
          select: { id: true, name: true, email: true, phone: true, locale: true, createdAt: true },
        }),

        // Upcoming bookings (PENDING/CONFIRMED, date >= today)
        prisma.booking.findMany({
          where: {
            customerId: uid,
            status: { in: ["PENDING", "CONFIRMED"] },
            scheduledDate: { gte: today },
          },
          include: {
            service: { select: { name: true, icon: true } },
            address: { select: { street: true, unit: true, city: true, state: true, zipCode: true } },
            payments: { select: { status: true } },
          },
          orderBy: { scheduledDate: "asc" },
          take: 5,
        }),

        // Recent bookings (last 5 completed)
        prisma.booking.findMany({
          where: { customerId: uid, status: "COMPLETED" },
          include: {
            service: { select: { name: true, icon: true } },
            address: { select: { street: true, city: true } },
          },
          orderBy: { scheduledDate: "desc" },
          take: 5,
        }),

        // Addresses
        prisma.address.findMany({
          where: { userId: uid },
          orderBy: { createdAt: "desc" },
        }),

        // Total bookings count
        prisma.booking.count({ where: { customerId: uid } }),

        // Total spent (sum of completed booking totals)
        prisma.booking.aggregate({
          where: { customerId: uid, status: "COMPLETED" },
          _sum: { total: true },
        }),
      ]);

    return NextResponse.json({
      profile,
      upcomingBookings,
      recentBookings,
      addresses,
      stats: {
        totalBookings: totalCount,
        totalSpent: totalSpent._sum.total || 0,
      },
    });
  } catch (err) {
    console.error("Customer dashboard GET error:", err);
    return NextResponse.json(
      { error: "Failed to load dashboard data", detail: String(err) },
      { status: 500 }
    );
  }
}
