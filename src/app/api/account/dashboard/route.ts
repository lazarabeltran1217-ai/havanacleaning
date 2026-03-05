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

    const [profile, upcomingBookings, allBookings, addresses, totalCount, totalSpent, stripeSetting, services, addOns, handymanInquiries] =
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
            service: { select: { name: true, nameEs: true, icon: true } },
            address: { select: { street: true, unit: true, city: true, state: true, zipCode: true } },
            payments: { select: { status: true } },
            assignments: { include: { employee: { select: { name: true } } } },
          },
          orderBy: { scheduledDate: "asc" },
          take: 5,
        }),

        // All bookings (ordered by date desc)
        prisma.booking.findMany({
          where: { customerId: uid },
          include: {
            service: { select: { name: true, nameEs: true, icon: true } },
            address: { select: { street: true, unit: true, city: true, state: true, zipCode: true } },
            payments: { select: { status: true } },
            assignments: { include: { employee: { select: { name: true } } } },
          },
          orderBy: { scheduledDate: "desc" },
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

        // Stripe publishable key
        prisma.setting.findUnique({ where: { key: "api_stripe_publishable" } }),

        // Services for booking form
        prisma.service.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: { id: true, name: true, nameEs: true, slug: true, icon: true, basePrice: true, pricePerBedroom: true, pricePerBathroom: true, estimatedHours: true },
        }),

        // Add-ons for booking form
        prisma.serviceAddOn.findMany({
          where: { isActive: true },
          select: { id: true, name: true, nameEs: true, price: true },
          orderBy: { name: "asc" },
        }),

        // Handyman inquiries for this user
        prisma.handymanInquiry.findMany({
          where: { userId: uid },
          select: {
            id: true,
            bookingNumber: true,
            serviceCategories: true,
            projectDescription: true,
            preferredDate: true,
            preferredTime: true,
            rush: true,
            status: true,
            address: true,
            quotedPrice: true,
            estimatedTotal: true,
            createdAt: true,
            payments: { select: { status: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
      ]);

    // Handyman service prices (for the portal wizard)
    const handymanPrices = await prisma.handymanServicePrice.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { key: true, basePrice: true },
    });

    const stripeKey =
      (typeof stripeSetting?.value === "string" ? stripeSetting.value : "") ||
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
      "";

    return NextResponse.json({
      profile,
      upcomingBookings,
      allBookings,
      addresses,
      stats: {
        totalBookings: totalCount,
        totalSpent: totalSpent._sum.total || 0,
      },
      stripeKey,
      services,
      addOns,
      handymanInquiries,
      handymanPrices,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("Customer dashboard GET error:", message);
    if (stack) console.error(stack);
    return NextResponse.json(
      { error: "Failed to load dashboard data", detail: message },
      { status: 500 }
    );
  }
}
