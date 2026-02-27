import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getSearchPerformance,
  getTopPages,
  getTopQueries,
  isConnected,
} from "@/lib/search-console";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type") ?? "performance";
  const days = Math.min(Math.max(Number(searchParams.get("days")) || 28, 1), 365);

  // Quick check: is GSC configured at all?
  const connected = await isConnected();
  if (!connected) {
    return NextResponse.json(
      {
        error:
          "Google Search Console is not configured. Add your service account key and site URL in SEO settings.",
      },
      { status: 400 },
    );
  }

  try {
    switch (type) {
      case "performance": {
        const data = await getSearchPerformance(days);
        return NextResponse.json(data);
      }
      case "pages": {
        const data = await getTopPages(days);
        return NextResponse.json({ pages: data });
      }
      case "queries": {
        const data = await getTopQueries(days);
        return NextResponse.json({ queries: data });
      }
      default:
        return NextResponse.json(
          { error: `Unknown type "${type}". Use "performance", "pages", or "queries".` },
          { status: 400 },
        );
    }
  } catch (err) {
    console.error("[search-console] API error:", err);
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
