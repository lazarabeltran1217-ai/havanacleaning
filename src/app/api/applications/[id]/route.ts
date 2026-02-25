import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  return NextResponse.json({ application });
}
