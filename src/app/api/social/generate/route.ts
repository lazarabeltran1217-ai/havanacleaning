import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { platform, contentType, topic, tone } = await req.json();

  if (!platform || !contentType) {
    return NextResponse.json(
      { error: "Platform and content type are required" },
      { status: 400 }
    );
  }

  // Get DeepSeek API key
  let apiKey = "";
  try {
    const setting = await prisma.setting.findUnique({ where: { key: "api_deepseek_key" } });
    apiKey = (setting?.value as string) || "";
  } catch { /* DB error */ }

  if (!apiKey) {
    return NextResponse.json(
      { error: "DeepSeek API key not configured. Add it in Settings \u2192 API Keys." },
      { status: 400 }
    );
  }

  // Get company info
  let companyName = "Havana Cleaning";
  try {
    const ns = await prisma.setting.findUnique({ where: { key: "company_name" } });
    if (ns?.value) companyName = ns.value as string;
  } catch { /* defaults */ }

  // Get recent posts to avoid repetition
  let recentTopics = "No recent posts yet";
  try {
    const recent = await prisma.socialPost.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      select: { content: true, contentType: true, aiPromptUsed: true },
    });
    if (recent.length > 0) {
      recentTopics = recent
        .map((p) => p.aiPromptUsed || p.content.substring(0, 80))
        .join("\n- ");
    }
  } catch { /* ignore */ }

  // Platform-specific constraints
  const platformConstraints: Record<string, string> = {
    facebook:
      "Max 500 characters. Engaging, conversational. Include 1-2 emojis. End with a question or CTA. 3-5 hashtags at end.",
    instagram:
      "Max 2200 characters but keep under 300 for engagement. Heavy on hashtags (10-15). Include emojis. Visual-first \u2014 describe the ideal image. End with CTA.",
    google:
      "Max 1500 characters. Professional, local-SEO focused. Mention service area. Include offer or update type. No hashtags.",
    tiktok:
      "Max 150 characters. Punchy, Gen-Z friendly, trending-aware. 3-5 hashtags. Hook in first 5 words.",
  };

  const constraint = platformConstraints[platform] || platformConstraints.facebook;

  const contentTypeDescriptions: Record<string, string> = {
    tip: "A helpful cleaning tip or home care hack that provides real value to homeowners",
    promo: "A promotional post about our services with a special offer or value proposition",
    seasonal: "Seasonal or holiday-themed cleaning content relevant to the current time of year",
    testimonial: "A post sharing customer satisfaction (create a realistic but generic testimonial story)",
    before_after: "A before/after transformation story for a cleaning job (describe the visual transformation)",
    behind_scenes: "A behind-the-scenes look at our team, cleaning process, or day-to-day operations",
    educational: "An educational post about cleaning products, techniques, or home maintenance science",
  };

  const typeDesc = contentTypeDescriptions[contentType] || contentTypeDescriptions.tip;

  const systemPrompt = `You are a social media manager for ${companyName}, a professional cleaning service based in Florida serving clients nationwide. Generate engaging social media content.

## Platform: ${platform.toUpperCase()}
${constraint}

## Content Type: ${contentType}
${typeDesc}

## Brand Voice
- Warm, professional, family-oriented
- Bilingual audience (English + Spanish)
- Emphasize: quality, trust, family-owned, nationwide service
- Website: havanacleaning.com
- Booking: havanacleaning.com/book

## Recent posts (AVOID repeating these topics):
- ${recentTopics}

Return ONLY valid JSON with these exact fields:
{
  "content": "The English post text (ready to copy-paste, include emojis)",
  "contentEs": "The Spanish translation of the post",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
  "imagePrompt": "A detailed description of the ideal image to accompany this post (for creating or sourcing an image)",
  "callToAction": "The CTA text (e.g. Book today at havanacleaning.com/book)"
}`;

  const userPrompt = topic
    ? `Create a ${contentType} post for ${platform} about: "${topic}". Tone: ${tone || "professional and warm"}.`
    : `Create an engaging ${contentType} post for ${platform}. Pick a relevant, timely topic that would resonate with homeowners. Tone: ${tone || "professional and warm"}.`;

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
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 2048,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("DeepSeek API error:", errText);
      return NextResponse.json(
        { error: `DeepSeek API error (${response.status}). Check your API key.` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content;

    if (!rawContent) {
      return NextResponse.json({ error: "No content returned from AI" }, { status: 502 });
    }

    const parsed = JSON.parse(rawContent);

    return NextResponse.json({
      content: parsed.content || "",
      contentEs: parsed.contentEs || "",
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
      imagePrompt: parsed.imagePrompt || "",
      callToAction: parsed.callToAction || "",
    });
  } catch (error) {
    console.error("Social generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate content. Please try again." },
      { status: 500 }
    );
  }
}
