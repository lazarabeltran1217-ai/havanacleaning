import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — List payroll records
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payrolls = await prisma.payroll.findMany({
    include: { employee: { select: { name: true, email: true } } },
    orderBy: { periodStart: "desc" },
    take: 50,
  });

  return NextResponse.json({ payrolls });
}

// POST — Generate payroll from time entries for a date range
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (!body.periodStart || !body.periodEnd) {
    return NextResponse.json(
      { error: "periodStart and periodEnd are required" },
      { status: 400 }
    );
  }

  const periodStart = new Date(body.periodStart);
  const periodEnd = new Date(body.periodEnd);
  periodEnd.setHours(23, 59, 59, 999);

  // Get all employees with time entries in the period
  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE", isActive: true },
    select: { id: true, name: true, hourlyRate: true },
  });

  const created: string[] = [];

  for (const emp of employees) {
    // Check if payroll already exists for this employee/period
    const existing = await prisma.payroll.findFirst({
      where: {
        employeeId: emp.id,
        periodStart: { gte: periodStart },
        periodEnd: { lte: periodEnd },
      },
    });

    if (existing) continue;

    // Sum completed time entries in the period
    const entries = await prisma.timeEntry.findMany({
      where: {
        employeeId: emp.id,
        clockIn: { gte: periodStart },
        clockOut: { not: null, lte: periodEnd },
      },
    });

    const totalHours = entries.reduce((sum, e) => sum + (e.hoursWorked || 0), 0);

    if (totalHours === 0) continue;

    const hourlyRate = emp.hourlyRate || 0;
    const grossPay = totalHours * hourlyRate;
    const netPay = grossPay; // No deductions by default — admin can adjust

    await prisma.payroll.create({
      data: {
        employeeId: emp.id,
        periodStart,
        periodEnd,
        totalHours,
        hourlyRate,
        grossPay,
        netPay,
      },
    });

    created.push(emp.name);
  }

  return NextResponse.json({
    message: `Payroll generated for ${created.length} employee(s)`,
    employees: created,
  });
}
