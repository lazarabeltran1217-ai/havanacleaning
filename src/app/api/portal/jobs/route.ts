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

    const jobs = await prisma.jobAssignment.findMany({
      where: {
        employeeId: session.user.id,
        booking: {
          status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED"] },
        },
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
            address: {
              select: {
                street: true,
                unit: true,
                city: true,
                state: true,
                zipCode: true,
              },
            },
          },
        },
      },
      orderBy: { booking: { scheduledDate: "desc" } },
      take: 30,
    });

    return NextResponse.json({ jobs });
  } catch (err) {
    console.error("Portal jobs GET error:", err);
    return NextResponse.json({ jobs: [] });
  }
}
