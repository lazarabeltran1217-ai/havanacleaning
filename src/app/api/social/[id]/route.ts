import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// PATCH — Update a social post
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

  // If transitioning to PUBLISHED, set publishedAt
  let publishedAt: Date | null | undefined = undefined;
  if (body.status === "PUBLISHED") {
    const existing = await prisma.socialPost.findUnique({
      where: { id },
      select: { publishedAt: true },
    });
    if (!existing?.publishedAt) publishedAt = new Date();
  }

  const post = await prisma.socialPost.update({
    where: { id },
    data: {
      ...(body.platforms !== undefined && { platforms: body.platforms }),
      ...(body.contentType !== undefined && { contentType: body.contentType }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.contentEs !== undefined && { contentEs: body.contentEs || null }),
      ...(body.hashtags !== undefined && { hashtags: body.hashtags }),
      ...(body.imagePrompt !== undefined && { imagePrompt: body.imagePrompt || null }),
      ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl || null }),
      ...(body.callToAction !== undefined && { callToAction: body.callToAction || null }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.scheduledFor !== undefined && {
        scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null,
      }),
      ...(publishedAt !== undefined && { publishedAt }),
      ...(body.publishResults !== undefined && { publishResults: body.publishResults }),
      ...(body.failureReason !== undefined && { failureReason: body.failureReason || null }),
    },
  });

  return NextResponse.json({ post });
}

// DELETE — Delete a social post
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.socialPost.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
