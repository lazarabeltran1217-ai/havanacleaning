import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET — List social posts with optional filters
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const platform = searchParams.get("platform");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (status) where.status = status;
  if (from || to) {
    where.scheduledFor = {};
    if (from) where.scheduledFor.gte = new Date(from);
    if (to) where.scheduledFor.lte = new Date(to);
  }
  // Platform filter — JSON array contains value
  if (platform) {
    where.platforms = { array_contains: [platform] };
  }

  const posts = await prisma.socialPost.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(posts);
}

// POST — Create a new social post
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const post = await prisma.socialPost.create({
    data: {
      platforms: body.platforms || ["facebook"],
      contentType: body.contentType || "tip",
      content: body.content,
      contentEs: body.contentEs || null,
      hashtags: body.hashtags || null,
      imagePrompt: body.imagePrompt || null,
      imageUrl: body.imageUrl || null,
      callToAction: body.callToAction || null,
      status: body.status || "DRAFT",
      scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null,
      publishedAt: body.status === "PUBLISHED" ? new Date() : null,
      aiModel: body.aiModel || null,
      aiPromptUsed: body.aiPromptUsed || null,
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}
