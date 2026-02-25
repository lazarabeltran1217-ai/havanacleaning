import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const { employeeId } = await req.json();

  if (!employeeId) {
    return NextResponse.json({ error: "Employee ID required" }, { status: 400 });
  }

  const assignment = await prisma.jobAssignment.create({
    data: {
      bookingId: id,
      employeeId,
      isPrimary: true,
    },
  });

  return NextResponse.json({ assignment });
}
