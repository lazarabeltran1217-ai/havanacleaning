import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const inquiry = await prisma.handymanInquiry.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  });

  if (!inquiry) {
    return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
  }

  if (session.user.role === "CUSTOMER" && inquiry.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ inquiry });
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await req.json();

  const inquiry = await prisma.handymanInquiry.findUnique({ where: { id } });
  if (!inquiry) {
    return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};
  if (body.status) updateData.status = body.status;
  if (body.notes !== undefined) updateData.notes = body.notes;
  if (body.quotedPrice !== undefined) updateData.quotedPrice = body.quotedPrice;
  if (body.preferredDate !== undefined) updateData.preferredDate = new Date(body.preferredDate + "T12:00:00");
  if (body.preferredTime !== undefined) updateData.preferredTime = body.preferredTime;

  // Admin reply
  if (body.adminReply !== undefined) {
    updateData.adminReply = body.adminReply;
    updateData.adminRepliedAt = new Date();
    updateData.customerCanEdit = true;
  }

  const updated = await prisma.handymanInquiry.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ inquiry: updated });
}
