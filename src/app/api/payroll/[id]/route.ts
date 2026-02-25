import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH — Update payroll (approve, mark paid, adjust amounts)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const payroll = await prisma.payroll.findUnique({ where: { id } });
  if (!payroll) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};

  // Status transitions
  if (body.status) {
    const validTransitions: Record<string, string[]> = {
      DRAFT: ["APPROVED"],
      APPROVED: ["PAID", "DRAFT"],
      PAID: [],
    };

    if (!validTransitions[payroll.status]?.includes(body.status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${payroll.status} to ${body.status}` },
        { status: 400 }
      );
    }

    data.status = body.status;

    if (body.status === "PAID") {
      data.paidAt = new Date();
      data.paidVia = body.paidVia || "DIRECT_DEPOSIT";
    }
  }

  // Adjustable amounts
  if (body.bonuses !== undefined) data.bonuses = body.bonuses;
  if (body.deductions !== undefined) data.deductions = body.deductions;
  if (body.mileageReimbursement !== undefined) data.mileageReimbursement = body.mileageReimbursement;
  if (body.tips !== undefined) data.tips = body.tips;

  // Recalculate netPay if amounts changed
  if (body.bonuses !== undefined || body.deductions !== undefined || body.mileageReimbursement !== undefined || body.tips !== undefined) {
    const bonuses = body.bonuses ?? payroll.bonuses;
    const deductions = body.deductions ?? payroll.deductions;
    const mileage = body.mileageReimbursement ?? payroll.mileageReimbursement;
    const tips = body.tips ?? payroll.tips;
    data.netPay = payroll.grossPay + bonuses - deductions + mileage + tips;
  }

  const updated = await prisma.payroll.update({
    where: { id },
    data,
    include: { employee: { select: { name: true } } },
  });

  return NextResponse.json({ payroll: updated });
}
