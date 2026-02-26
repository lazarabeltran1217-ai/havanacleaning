import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// PATCH — Update a blog post (OWNER only)
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

  // If publishing for the first time, set publishedAt
  let publishedAt: Date | null | undefined = undefined;
  if (body.isPublished !== undefined) {
    if (body.isPublished) {
      const existing = await prisma.blogPost.findUnique({ where: { id }, select: { publishedAt: true } });
      if (!existing?.publishedAt) {
        publishedAt = new Date();
      }
    } else {
      publishedAt = null;
    }
  }

  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.titleEs !== undefined && { titleEs: body.titleEs || null }),
      ...(body.slug !== undefined && { slug: body.slug }),
      ...(body.content !== undefined && { content: body.content || null }),
      ...(body.contentEs !== undefined && { contentEs: body.contentEs || null }),
      ...(body.excerpt !== undefined && { excerpt: body.excerpt || null }),
      ...(body.excerptEs !== undefined && { excerptEs: body.excerptEs || null }),
      ...(body.metaTitle !== undefined && { metaTitle: body.metaTitle || null }),
      ...(body.metaDescription !== undefined && { metaDescription: body.metaDescription || null }),
      ...(body.author !== undefined && { author: body.author || null }),
      ...(body.featuredImage !== undefined && { featuredImage: body.featuredImage || null }),
      ...(body.tags !== undefined && { tags: body.tags }),
      ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
      ...(publishedAt !== undefined && { publishedAt }),
    },
  });

  return NextResponse.json({ post });
}

// DELETE — Delete a blog post (OWNER only)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.blogPost.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
