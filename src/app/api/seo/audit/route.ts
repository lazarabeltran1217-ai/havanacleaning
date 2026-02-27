import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runSiteAudit } from "@/lib/seo-audit";
import type { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Vercel Hobby plan max

const BASE_URL = "https://www.havanacleaning.com";

// POST — Run a new site audit
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Create the audit record with "running" status
    const siteAudit = await prisma.siteAudit.create({
      data: { status: "running" },
    });

    let auditResult;
    try {
      auditResult = await runSiteAudit(BASE_URL);
    } catch (err: unknown) {
      // Mark audit as failed if the engine throws
      await prisma.siteAudit.update({
        where: { id: siteAudit.id },
        data: { status: "failed" },
      });

      const message =
        err instanceof Error ? err.message : "Audit engine failed";
      return NextResponse.json(
        { error: message, auditId: siteAudit.id },
        { status: 500 }
      );
    }

    // Batch-create all PageAudit records in one query to avoid exhausting DB pool
    await prisma.pageAudit.createMany({
      data: auditResult.pages.map((page) => ({
        auditId: siteAudit.id,
        pageUrl: page.url,
        statusCode: page.statusCode,
        title: page.title,
        titleLength: page.titleLength,
        description: page.description,
        descLength: page.descriptionLength,
        h1Count: page.h1Count,
        h1Text: page.h1Text,
        headings: page.headings,
        wordCount: page.wordCount,
        imageCount: page.imageCount,
        imagesWithAlt: page.imagesWithAlt,
        internalLinks: page.internalLinks,
        externalLinks: page.externalLinks,
        hasCanonical: page.canonical !== null,
        structuredData: page.structuredDataTypes,
        loadTimeMs: page.loadTimeMs,
        issues: page.issues as unknown as Prisma.InputJsonValue,
        scores: page.scores as unknown as Prisma.InputJsonValue,
      })),
    });

    // Calculate overall score (average of all category averages)
    const { overallScores } = auditResult;
    const overallScore = Math.round(
      (overallScores.technical +
        overallScores.content +
        overallScores.structuredData +
        overallScores.geo +
        overallScores.aeo +
        overallScores.cro) /
        6
    );

    // Update the SiteAudit record with final results
    await prisma.siteAudit.update({
      where: { id: siteAudit.id },
      data: {
        status: "completed",
        totalPages: auditResult.totalPages,
        totalIssues: auditResult.totalIssues,
        overallScore,
        scores: overallScores as unknown as Prisma.InputJsonValue,
        durationMs: auditResult.durationMs,
      },
    });

    return NextResponse.json(
      {
        auditId: siteAudit.id,
        overallScore,
        totalPages: auditResult.totalPages,
        totalIssues: auditResult.totalIssues,
        durationMs: auditResult.durationMs,
        scores: overallScores,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("SEO audit error:", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET — Retrieve audit results
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      // Return specific audit by ID
      const audit = await prisma.siteAudit.findUnique({
        where: { id },
        include: {
          pages: {
            orderBy: { pageUrl: "asc" },
          },
        },
      });

      if (!audit) {
        return NextResponse.json(
          { error: "Audit not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ audit });
    }

    // Return the latest completed audit
    const audit = await prisma.siteAudit.findFirst({
      where: { status: "completed" },
      orderBy: { createdAt: "desc" },
      include: {
        pages: {
          orderBy: { pageUrl: "asc" },
        },
      },
    });

    if (!audit) {
      return NextResponse.json(
        { error: "No completed audits found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ audit });
  } catch (err: unknown) {
    console.error("SEO audit GET error:", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
