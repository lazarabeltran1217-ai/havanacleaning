import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET — List target keywords
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keywords = await prisma.targetKeyword.findMany({
    orderBy: [{ intent: "asc" }, { keyword: "asc" }],
  });

  return NextResponse.json({ keywords });
}

// POST — Add a target keyword
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (!body.keyword) {
    return NextResponse.json({ error: "keyword is required" }, { status: 400 });
  }

  const keyword = await prisma.targetKeyword.create({
    data: {
      keyword: body.keyword,
      keywordEs: body.keywordEs || null,
      pageUrl: body.pageUrl || null,
      searchVolume: body.searchVolume || null,
      difficulty: body.difficulty || null,
      intent: body.intent || "transactional",
    },
  });

  return NextResponse.json({ keyword }, { status: 201 });
}
