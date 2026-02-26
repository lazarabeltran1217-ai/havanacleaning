import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET — List all blog posts (OWNER only)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(posts);
}

// POST — Create a new blog post (OWNER only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const slug =
    body.slug ||
    body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const post = await prisma.blogPost.create({
    data: {
      slug,
      title: body.title,
      titleEs: body.titleEs || null,
      content: body.content || null,
      contentEs: body.contentEs || null,
      excerpt: body.excerpt || null,
      excerptEs: body.excerptEs || null,
      metaTitle: body.metaTitle || null,
      metaDescription: body.metaDescription || null,
      author: body.author || null,
      featuredImage: body.featuredImage || null,
      tags: body.tags || null,
      isPublished: body.isPublished ?? false,
      publishedAt: body.isPublished ? new Date() : null,
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}
