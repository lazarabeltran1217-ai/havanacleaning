import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await req.json();

  const updateData: Record<string, unknown> = {};
  if (body.status) updateData.status = body.status;
  if (body.reviewNotes !== undefined) updateData.reviewNotes = body.reviewNotes;
  updateData.reviewedBy = session.user.id;

  const application = await prisma.jobApplication.update({
    where: { id },
    data: updateData,
  });

  // Auto-create employee account when status changes to HIRED
  let employeeCreated = false;
  let employeeName = "";
  if (body.status === "HIRED") {
    const fullApp = await prisma.jobApplication.findUnique({ where: { id } });
    if (fullApp) {
      const name = `${fullApp.firstName} ${fullApp.lastName}`.trim();
      const email = fullApp.email.toLowerCase();
      employeeName = name;

      // Check if employee already exists with this email
      const existing = await prisma.user.findUnique({ where: { email } });
      if (!existing) {
        // Parse hourly rate from desiredRate (e.g. "$22-25/hr" -> 22)
        let hourlyRate: number | null = null;
        if (fullApp.desiredRate) {
          const match = fullApp.desiredRate.match(/(\d+)/);
          if (match) hourlyRate = parseFloat(match[1]);
        }

        // Generate a temporary password from first name + last 4 of phone
        const tempPass = `${fullApp.firstName.toLowerCase()}${(fullApp.phone || "0000").slice(-4)}`;
        const hashedPassword = await hash(tempPass, 12);

        await prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            phone: fullApp.phone || null,
            role: "EMPLOYEE",
            hourlyRate,
            hireDate: new Date(),
          },
        });
        employeeCreated = true;
      }
    }
  }

  return NextResponse.json({ application, employeeCreated, employeeName });
}
