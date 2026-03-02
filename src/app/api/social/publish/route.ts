import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId, platform } = await req.json();

  if (!postId || !platform) {
    return NextResponse.json({ error: "postId and platform are required" }, { status: 400 });
  }

  const post = await prisma.socialPost.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const fullText = post.content + (
    Array.isArray(post.hashtags) && (post.hashtags as string[]).length > 0
      ? "\n\n" + (post.hashtags as string[]).join(" ")
      : ""
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results: Record<string, any> = (post.publishResults as Record<string, any>) || {};

  if (platform === "facebook") {
    const result = await publishToFacebook(fullText);
    results.facebook = result;

    if (result.success) {
      await prisma.socialPost.update({
        where: { id: postId },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
          publishResults: results,
        },
      });
      return NextResponse.json({ success: true, platform: "facebook", result });
    } else {
      await prisma.socialPost.update({
        where: { id: postId },
        data: { failureReason: result.error, publishResults: results },
      });
      return NextResponse.json({ success: false, error: result.error }, { status: 502 });
    }
  }

  if (platform === "instagram") {
    const result = await publishToInstagram(fullText, post.imageUrl);
    results.instagram = result;

    if (result.success) {
      await prisma.socialPost.update({
        where: { id: postId },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
          publishResults: results,
        },
      });
      return NextResponse.json({ success: true, platform: "instagram", result });
    } else {
      await prisma.socialPost.update({
        where: { id: postId },
        data: { failureReason: result.error, publishResults: results },
      });
      return NextResponse.json({ success: false, error: result.error }, { status: 502 });
    }
  }

  // For unsupported platforms, return content for manual posting
  return NextResponse.json({
    success: false,
    manual: true,
    content: fullText,
    contentEs: post.contentEs,
    message: `Auto-publishing not available for ${platform}. Copy the content and post manually.`,
  });
}

// ─── Facebook Graph API ───

async function publishToFacebook(message: string) {
  try {
    const [pageIdSetting, tokenSetting] = await Promise.all([
      prisma.setting.findUnique({ where: { key: "social_facebook_page_id" } }),
      prisma.setting.findUnique({ where: { key: "social_facebook_page_token" } }),
    ]);

    const pageId = (pageIdSetting?.value as string) || "";
    const token = (tokenSetting?.value as string) || "";

    if (!pageId || !token) {
      return {
        success: false,
        error: "Facebook Page ID or Access Token not configured. Add them in Settings.",
      };
    }

    const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        access_token: token,
      }),
    });

    const data = await res.json();

    if (data.error) {
      return { success: false, error: data.error.message || "Facebook API error" };
    }

    return { success: true, postId: data.id, url: `https://facebook.com/${data.id}` };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Facebook publish failed" };
  }
}

// ─── Instagram Content Publishing API ───

async function publishToInstagram(caption: string, imageUrl: string | null) {
  try {
    const [igIdSetting, tokenSetting] = await Promise.all([
      prisma.setting.findUnique({ where: { key: "social_instagram_business_id" } }),
      prisma.setting.findUnique({ where: { key: "social_facebook_page_token" } }),
    ]);

    const igBusinessId = (igIdSetting?.value as string) || "";
    const token = (tokenSetting?.value as string) || ""; // Uses Facebook Page token

    if (!igBusinessId || !token) {
      return {
        success: false,
        error: "Instagram Business ID not configured. Add it in Settings.",
      };
    }

    if (!imageUrl) {
      return {
        success: false,
        error: "Instagram requires an image URL. Upload an image first.",
      };
    }

    // Step 1: Create media container
    const containerRes = await fetch(
      `https://graph.facebook.com/v19.0/${igBusinessId}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: imageUrl,
          caption,
          access_token: token,
        }),
      }
    );

    const containerData = await containerRes.json();
    if (containerData.error) {
      return { success: false, error: containerData.error.message || "Instagram container error" };
    }

    const creationId = containerData.id;

    // Step 2: Publish the container
    const publishRes = await fetch(
      `https://graph.facebook.com/v19.0/${igBusinessId}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: token,
        }),
      }
    );

    const publishData = await publishRes.json();
    if (publishData.error) {
      return { success: false, error: publishData.error.message || "Instagram publish error" };
    }

    return {
      success: true,
      postId: publishData.id,
      url: `https://instagram.com/p/${publishData.id}`,
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Instagram publish failed" };
  }
}
