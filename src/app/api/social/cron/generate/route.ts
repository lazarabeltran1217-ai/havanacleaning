import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSeasonalSuggestion, getContentTypeForDay } from "@/lib/social-calendar";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel sends this header)
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if auto-generate is enabled
  try {
    const autoGenSetting = await prisma.setting.findUnique({
      where: { key: "social_auto_generate" },
    });
    if ((autoGenSetting?.value as string) !== "true") {
      return NextResponse.json({ message: "Auto-generation disabled" });
    }
  } catch {
    return NextResponse.json({ message: "Could not read settings" });
  }

  // Get posting time preference
  let postTime = "10:00";
  try {
    const ts = await prisma.setting.findUnique({ where: { key: "social_post_time" } });
    if (ts?.value) postTime = ts.value as string;
  } catch { /* defaults */ }

  const [hours, minutes] = postTime.split(":").map(Number);

  // Tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(hours, minutes, 0, 0);

  // Check if posts already exist for tomorrow
  const startOfDay = new Date(tomorrow);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(tomorrow);
  endOfDay.setHours(23, 59, 59, 999);

  const existing = await prisma.socialPost.count({
    where: { scheduledFor: { gte: startOfDay, lte: endOfDay } },
  });

  if (existing >= 2) {
    return NextResponse.json({ message: "Posts already scheduled for tomorrow", existing });
  }

  // Get DeepSeek API key
  let apiKey = "";
  try {
    const setting = await prisma.setting.findUnique({ where: { key: "api_deepseek_key" } });
    apiKey = (setting?.value as string) || "";
  } catch { /* ignore */ }

  if (!apiKey) {
    return NextResponse.json({ error: "DeepSeek API key not configured" }, { status: 400 });
  }

  let companyName = "Havana Cleaning";
  try {
    const ns = await prisma.setting.findUnique({ where: { key: "company_name" } });
    if (ns?.value) companyName = ns.value as string;
  } catch { /* defaults */ }

  // Get seasonal suggestion
  const seasonal = getSeasonalSuggestion(tomorrow);
  const contentType = getContentTypeForDay(tomorrow);

  // Generate for Facebook
  const platforms = ["facebook", "instagram"];
  const created: string[] = [];

  for (const platform of platforms) {
    try {
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
              content: `You are a social media manager for ${companyName}, a professional cleaning service. Generate a ${contentType} post for ${platform}. Topic hint: "${seasonal.topic}". Brand voice: warm, professional, family-owned. Website: havanacleaning.com. Booking: havanacleaning.com/book. Return JSON: {"content":"English text with emojis","contentEs":"Spanish translation","hashtags":["#tag"],"imagePrompt":"image description","callToAction":"CTA text"}`,
            },
            {
              role: "user",
              content: `Create an engaging ${contentType} post for ${platform} inspired by: "${seasonal.topic}". Make it unique and engaging.`,
            },
          ],
          temperature: 0.85,
          max_tokens: 1024,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) continue;

      const data = await response.json();
      const raw = data.choices?.[0]?.message?.content;
      if (!raw) continue;

      const parsed = JSON.parse(raw);

      await prisma.socialPost.create({
        data: {
          platforms: [platform],
          contentType,
          content: parsed.content || "",
          contentEs: parsed.contentEs || null,
          hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : seasonal.hashtags,
          imagePrompt: parsed.imagePrompt || null,
          callToAction: parsed.callToAction || null,
          status: "SCHEDULED",
          scheduledFor: tomorrow,
          aiModel: "deepseek-chat",
          aiPromptUsed: `Auto: ${contentType} - ${seasonal.topic}`,
        },
      });

      created.push(`${platform}: ${contentType}`);

      // Delay between calls
      await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      console.error(`Cron generate error for ${platform}:`, err);
    }
  }

  return NextResponse.json({ generated: created.length, posts: created });
}
