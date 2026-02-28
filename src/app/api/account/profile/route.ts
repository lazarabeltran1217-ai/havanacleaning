import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try with locale first, fall back without it
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, name: true, email: true, phone: true, locale: true, createdAt: true },
      });
    } catch {
      user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, name: true, email: true, phone: true, createdAt: true },
      });
      if (user) (user as Record<string, unknown>).locale = "en";
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error("Profile GET error:", err);
    return NextResponse.json({ user: null });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse body once, keep reference
    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    if (body.name) updateData.name = body.name;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.locale) updateData.locale = body.locale;

    let user;
    try {
      user = await prisma.user.update({
        where: { id: session.user.id },
        data: updateData,
        select: { id: true, name: true, email: true, phone: true, locale: true },
      });
    } catch {
      // locale column might not exist — save without it
      const { locale: _locale, ...safeData } = updateData;
      user = await prisma.user.update({
        where: { id: session.user.id },
        data: safeData,
        select: { id: true, name: true, email: true, phone: true },
      });
      (user as Record<string, unknown>).locale = body.locale || "en";
    }

    const res = NextResponse.json({ user });
    if (body.locale) {
      res.cookies.set("locale", body.locale, { path: "/", maxAge: 365 * 24 * 60 * 60 });
    }
    return res;
  } catch (err) {
    console.error("Profile PATCH error:", err);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
