import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH — Update a FAQ
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

  const faq = await prisma.fAQ.update({
    where: { id },
    data: {
      ...(body.question !== undefined && { question: body.question }),
      ...(body.questionEs !== undefined && { questionEs: body.questionEs }),
      ...(body.answer !== undefined && { answer: body.answer }),
      ...(body.answerEs !== undefined && { answerEs: body.answerEs }),
      ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
    },
  });

  return NextResponse.json({ faq });
}

// DELETE — Delete a FAQ
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.fAQ.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
