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

  const inquiry = await prisma.handymanInquiry.findUnique({ where: { id } });
  if (!inquiry) {
    return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
  }

  const current = (Array.isArray(inquiry.assignedEmployees) ? inquiry.assignedEmployees : []) as string[];
  if (current.includes(employeeId)) {
    return NextResponse.json({ error: "Already assigned" }, { status: 400 });
  }

  await prisma.handymanInquiry.update({
    where: { id },
    data: { assignedEmployees: [...current, employeeId] },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const { employeeId } = await req.json();

  if (!employeeId) {
    return NextResponse.json({ error: "Employee ID required" }, { status: 400 });
  }

  const inquiry = await prisma.handymanInquiry.findUnique({ where: { id } });
  if (!inquiry) {
    return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
  }

  const current = (Array.isArray(inquiry.assignedEmployees) ? inquiry.assignedEmployees : []) as string[];
  await prisma.handymanInquiry.update({
    where: { id },
    data: { assignedEmployees: current.filter((eid) => eid !== employeeId) },
  });

  return NextResponse.json({ ok: true });
}
