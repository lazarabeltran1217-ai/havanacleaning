import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — List directory listings
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const listings = await prisma.directoryListing.findMany({
    orderBy: { platform: "asc" },
  });

  return NextResponse.json({ listings });
}

// POST — Add a directory listing
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (!body.platform) {
    return NextResponse.json({ error: "platform is required" }, { status: 400 });
  }

  const listing = await prisma.directoryListing.create({
    data: {
      platform: body.platform,
      listingUrl: body.listingUrl || null,
      status: body.status || "unclaimed",
      napConsistent: body.napConsistent ?? false,
      notes: body.notes || null,
    },
  });

  return NextResponse.json({ listing }, { status: 201 });
}
