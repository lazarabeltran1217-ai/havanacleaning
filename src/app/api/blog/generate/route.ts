import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title } = await req.json();
  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  // Get DeepSeek API key from settings
  let apiKey = "";
  try {
    const setting = await prisma.setting.findUnique({ where: { key: "api_deepseek_key" } });
    apiKey = (setting?.value as string) || "";
  } catch {
    // DB error
  }

  if (!apiKey) {
    return NextResponse.json(
      { error: "DeepSeek API key not configured. Add it in Settings → API Keys." },
      { status: 400 }
    );
  }

  // Get business info for context
  let companyName = "Havana Cleaning";
  let companyPhone = "(305) 555-CLEAN";
  try {
    const [nameSetting, phoneSetting] = await Promise.all([
      prisma.setting.findUnique({ where: { key: "company_name" } }),
      prisma.setting.findUnique({ where: { key: "company_phone" } }),
    ]);
    if (nameSetting?.value) companyName = nameSetting.value as string;
    if (phoneSetting?.value) companyPhone = phoneSetting.value as string;
  } catch {
    // Use defaults
  }

  const systemPrompt = `You are an expert SEO content writer for ${companyName}, a professional cleaning service in Miami-Dade County, Florida. You write blog posts that are:

- **SEO-optimized**: Natural keyword placement, proper heading hierarchy (H2, H3), internal linking opportunities, 1200-1800 words
- **GEO-optimized**: References to Miami, Miami-Dade County, South Florida, and specific neighborhoods (Brickell, Coral Gables, Doral, Kendall, etc.)
- **AEO-optimized** (Answer Engine Optimization): Include FAQ sections, direct answers to common questions, structured content that voice assistants and AI can extract
- **CRO-optimized** (Conversion Rate Optimization): Include natural calls-to-action, mention booking online, reference the company phone number ${companyPhone}

Write in a warm, professional, approachable tone. The audience is Miami homeowners and renters.

Return your response as JSON with these exact fields:
{
  "content": "The full blog post content (plain text with line breaks, use ## for H2 and ### for H3 headings)",
  "excerpt": "A compelling 1-2 sentence excerpt for blog listings (max 160 chars)",
  "metaTitle": "SEO-optimized page title (max 60 chars, include primary keyword)",
  "metaDescription": "SEO meta description (max 155 chars, include CTA)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;

  const userPrompt = `Write a comprehensive, SEO-friendly blog post with the title: "${title}"

Make sure to:
1. Start with an engaging introduction that hooks the reader
2. Use H2 and H3 headings to structure the content
3. Include a FAQ section with 3-5 questions and answers
4. End with a clear call-to-action to book with ${companyName}
5. Reference Miami/South Florida locations naturally throughout
6. Include practical, actionable tips the reader can use

Return ONLY valid JSON, no markdown code fences.`;

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
        temperature: 0.7,
        max_tokens: 4096,
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

    // Parse the JSON response
    const parsed = JSON.parse(rawContent);

    return NextResponse.json({
      content: parsed.content || "",
      excerpt: parsed.excerpt || "",
      metaTitle: parsed.metaTitle || title,
      metaDescription: parsed.metaDescription || "",
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    });
  } catch (error) {
    console.error("Blog generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate blog content. Please try again." },
      { status: 500 }
    );
  }
}
