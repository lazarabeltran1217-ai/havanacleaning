import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — List FAQs (public if pageType/pageId specified, otherwise admin)
export async function GET(req: NextRequest) {
  const pageType = req.nextUrl.searchParams.get("pageType");
  const pageId = req.nextUrl.searchParams.get("pageId");

  if (pageType) {
    // Public: get FAQs for a specific page
    const faqs = await prisma.fAQ.findMany({
      where: { pageType, pageId: pageId || null, isPublished: true },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ faqs });
  }

  // Admin: get all FAQs
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const faqs = await prisma.fAQ.findMany({
    orderBy: [{ pageType: "asc" }, { sortOrder: "asc" }],
  });

  return NextResponse.json({ faqs });
}

// POST — Create a FAQ (admin only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (!body.question || !body.answer || !body.pageType) {
    return NextResponse.json({ error: "question, answer, and pageType are required" }, { status: 400 });
  }

  const faq = await prisma.fAQ.create({
    data: {
      pageType: body.pageType,
      pageId: body.pageId || null,
      question: body.question,
      questionEs: body.questionEs || null,
      answer: body.answer,
      answerEs: body.answerEs || null,
      sortOrder: body.sortOrder || 0,
      isPublished: body.isPublished ?? true,
    },
  });

  return NextResponse.json({ faq }, { status: 201 });
}
