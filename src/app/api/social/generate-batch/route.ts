import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CONTENT_TYPES = ["tip", "promo", "seasonal", "testimonial", "before_after", "behind_scenes", "educational"];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { platforms, count, startDate } = await req.json();
  const targetPlatforms = platforms || ["facebook", "instagram"];
  const postCount = Math.min(count || 7, 14); // max 14 at once

  // Get DeepSeek API key
  let apiKey = "";
  try {
    const setting = await prisma.setting.findUnique({ where: { key: "api_deepseek_key" } });
    apiKey = (setting?.value as string) || "";
  } catch { /* DB error */ }

  if (!apiKey) {
    return NextResponse.json(
      { error: "DeepSeek API key not configured. Add it in Settings." },
      { status: 400 }
    );
  }

  let companyName = "Havana Cleaning";
  try {
    const ns = await prisma.setting.findUnique({ where: { key: "company_name" } });
    if (ns?.value) companyName = ns.value as string;
  } catch { /* defaults */ }

  // Get posting time preference
  let postTime = "10:00";
  try {
    const ts = await prisma.setting.findUnique({ where: { key: "social_post_time" } });
    if (ts?.value) postTime = ts.value as string;
  } catch { /* defaults */ }

  const [hours, minutes] = postTime.split(":").map(Number);
  const start = startDate ? new Date(startDate) : new Date();
  start.setDate(start.getDate() + 1); // start from tomorrow

  const created: string[] = [];
  const failed: string[] = [];

  for (let i = 0; i < postCount; i++) {
    const contentType = CONTENT_TYPES[i % CONTENT_TYPES.length];
    const scheduledDate = new Date(start);
    scheduledDate.setDate(scheduledDate.getDate() + i);
    scheduledDate.setHours(hours, minutes, 0, 0);

    const primaryPlatform = targetPlatforms[i % targetPlatforms.length];

    try {
      // Call DeepSeek
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: `You are a social media manager for ${companyName}, a professional cleaning service. Generate a ${contentType} post for ${primaryPlatform}. Brand voice: warm, professional, family-oriented. Website: havanacleaning.com. Booking: havanacleaning.com/book. Return JSON: {"content":"English text","contentEs":"Spanish text","hashtags":["#tag"],"imagePrompt":"image description","callToAction":"CTA text"}`,
            },
            {
              role: "user",
              content: `Create an engaging ${contentType} post for ${primaryPlatform}. Make it unique and timely. This is post ${i + 1} of ${postCount} for a weekly content calendar.`,
            },
          ],
          temperature: 0.85,
          max_tokens: 1024,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        failed.push(`Post ${i + 1}: API error ${response.status}`);
        continue;
      }

      const data = await response.json();
      const raw = data.choices?.[0]?.message?.content;
      if (!raw) {
        failed.push(`Post ${i + 1}: No content returned`);
        continue;
      }

      const parsed = JSON.parse(raw);

      await prisma.socialPost.create({
        data: {
          platforms: targetPlatforms,
          contentType,
          content: parsed.content || "",
          contentEs: parsed.contentEs || null,
          hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : null,
          imagePrompt: parsed.imagePrompt || null,
          callToAction: parsed.callToAction || null,
          status: "SCHEDULED",
          scheduledFor: scheduledDate,
          aiModel: "deepseek-chat",
          aiPromptUsed: `Batch: ${contentType} for ${primaryPlatform}`,
        },
      });

      created.push(`Post ${i + 1}: ${contentType} for ${scheduledDate.toLocaleDateString()}`);

      // Small delay between API calls to avoid rate limits
      if (i < postCount - 1) {
        await new Promise((r) => setTimeout(r, 1500));
      }
    } catch (err) {
      failed.push(`Post ${i + 1}: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  return NextResponse.json({ created, failed, total: created.length });
}
