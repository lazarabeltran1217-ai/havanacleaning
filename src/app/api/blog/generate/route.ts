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
  try {
    const nameSetting = await prisma.setting.findUnique({ where: { key: "company_name" } });
    if (nameSetting?.value) companyName = nameSetting.value as string;
  } catch {
    // Use defaults
  }

  const systemPrompt = `You are an expert SEO content writer for ${companyName}, a professional cleaning service headquartered in Florida and serving clients nationwide. You write blog posts that are:

- **SEO-optimized**: Natural keyword placement, proper heading hierarchy (H2, H3), 1200-1800 words
- **GEO-optimized**: References to Florida and specific neighborhoods where we operate, with tips applicable to homeowners nationwide
- **AEO-optimized** (Answer Engine Optimization): Include FAQ sections, direct answers to common questions, structured content that voice assistants and AI can extract
- **CRO-optimized** (Conversion Rate Optimization): Include natural calls-to-action, mention booking online at /book and checking pricing at /pricing

## IMPORTANT: Links
You MUST include markdown links throughout the content:

**Internal links** (use 3-5 of these naturally in the content):
- [book a cleaning](/book) or [schedule your cleaning](/book)
- [our services](/services)
- [pricing](/pricing)
- [service areas](/areas)
- [FAQ](/faq)
- [commercial cleaning](/commercial)
- [careers](/careers)

**External links** (include 2-3 authoritative sources for credibility):
- Link to relevant sources like EPA, CDC, or well-known cleaning/home publications
- Example: [according to the EPA](https://www.epa.gov/indoor-air-quality-iaq)
- Always use real, authoritative URLs

**Backlinks/CTAs** (include 2-3 natural call-to-action links):
- Weave in links to /book and /pricing naturally within the text
- Example: "Ready for a spotless home? [Book online today](/book) and see the difference."

## Formatting
Use proper markdown:
- ## for H2 headings, ### for H3 headings
- **bold** for key terms and emphasis
- - or 1. for lists
- [link text](url) for all links
- Separate paragraphs with blank lines

Write in a warm, professional, approachable tone. The audience is homeowners and renters nationwide, with a focus on Florida.

Return your response as JSON with these exact fields:
{
  "content": "The full blog post in markdown with links, headings, bold, lists",
  "excerpt": "A compelling 1-2 sentence excerpt for blog listings (max 160 chars)",
  "metaTitle": "SEO-optimized page title (max 60 chars, include primary keyword)",
  "metaDescription": "SEO meta description (max 155 chars, include CTA)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;

  const userPrompt = `Write a comprehensive, SEO-friendly blog post with the title: "${title}"

Make sure to:
1. Start with an engaging introduction that hooks the reader
2. Use ## H2 and ### H3 headings to structure the content
3. Include 3-5 internal links to site pages (/book, /services, /pricing, /areas, /faq, /commercial)
4. Include 2-3 external links to authoritative sources (EPA, CDC, reputable publications)
5. Include a FAQ section with 3-5 questions and answers
6. End with a clear call-to-action linking to [Book with ${companyName}](/book)
7. Reference Florida locations and general home care tips naturally throughout
8. Use **bold** for key terms, proper markdown lists, and link formatting
9. Include practical, actionable tips the reader can use

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
