import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if auto-publish is enabled
  try {
    const autoPublishSetting = await prisma.setting.findUnique({
      where: { key: "social_auto_publish" },
    });
    if ((autoPublishSetting?.value as string) !== "true") {
      return NextResponse.json({ message: "Auto-publish disabled" });
    }
  } catch {
    return NextResponse.json({ message: "Could not read settings" });
  }

  // Find scheduled posts that should be published now
  const now = new Date();
  const pendingPosts = await prisma.socialPost.findMany({
    where: {
      status: "SCHEDULED",
      scheduledFor: { lte: now },
    },
    take: 10,
  });

  if (pendingPosts.length === 0) {
    return NextResponse.json({ message: "No posts to publish", count: 0 });
  }

  // Get Facebook credentials
  const [pageIdSetting, tokenSetting] = await Promise.all([
    prisma.setting.findUnique({ where: { key: "social_facebook_page_id" } }),
    prisma.setting.findUnique({ where: { key: "social_facebook_page_token" } }),
  ]);

  const fbPageId = (pageIdSetting?.value as string) || "";
  const fbToken = (tokenSetting?.value as string) || "";

  const results: { id: string; status: string; error?: string }[] = [];

  for (const post of pendingPosts) {
    const platforms = Array.isArray(post.platforms) ? (post.platforms as string[]) : [];
    const fullText = post.content + (
      Array.isArray(post.hashtags) && (post.hashtags as string[]).length > 0
        ? "\n\n" + (post.hashtags as string[]).join(" ")
        : ""
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const publishResults: Record<string, any> = {};
    let anySuccess = false;

    // Publish to Facebook
    if (platforms.includes("facebook") && fbPageId && fbToken) {
      try {
        const res = await fetch(`https://graph.facebook.com/v19.0/${fbPageId}/feed`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: fullText, access_token: fbToken }),
        });

        const data = await res.json();
        if (data.error) {
          publishResults.facebook = { success: false, error: data.error.message };
        } else {
          publishResults.facebook = { success: true, postId: data.id };
          anySuccess = true;
        }
      } catch (err) {
        publishResults.facebook = {
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        };
      }
    }

    // Update post status
    await prisma.socialPost.update({
      where: { id: post.id },
      data: {
        status: anySuccess ? "PUBLISHED" : (Object.keys(publishResults).length > 0 ? "FAILED" : "SCHEDULED"),
        publishedAt: anySuccess ? new Date() : null,
        publishResults,
        failureReason: anySuccess ? null : JSON.stringify(publishResults),
      },
    });

    results.push({
      id: post.id,
      status: anySuccess ? "PUBLISHED" : "FAILED",
      error: anySuccess ? undefined : JSON.stringify(publishResults),
    });
  }

  return NextResponse.json({ processed: results.length, results });
}
