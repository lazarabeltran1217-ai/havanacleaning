import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        locale: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch {
    // Fallback: locale column might not exist in DB yet
    try {
      const user = await prisma.$queryRawUnsafe<
        { id: string; name: string; email: string; phone: string | null; createdAt: Date }[]
      >(
        `SELECT "id", "name", "email", "phone", "createdAt" FROM "User" WHERE "id" = $1`,
        session.user.id
      );
      if (user[0]) {
        return NextResponse.json({ user: { ...user[0], locale: "en" } });
      }
      return NextResponse.json({ user: null });
    } catch (e2) {
      console.error("Profile GET error:", e2);
      return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
    }
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    if (body.name) updateData.name = body.name;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.locale) updateData.locale = body.locale;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: { id: true, name: true, email: true, phone: true, locale: true },
    });

    const res = NextResponse.json({ user });
    if (body.locale) {
      res.cookies.set("locale", body.locale, { path: "/", maxAge: 365 * 24 * 60 * 60 });
    }
    return res;
  } catch {
    // Fallback: locale column might not exist — save what we can
    try {
      const body = await req.json().catch(() => null);
      if (!body) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
      }

      const sets: string[] = [];
      const vals: unknown[] = [];
      let idx = 1;

      if (body.name) { sets.push(`"name" = $${idx++}`); vals.push(body.name); }
      if (body.phone !== undefined) { sets.push(`"phone" = $${idx++}`); vals.push(body.phone); }

      if (sets.length > 0) {
        vals.push(session.user.id);
        await prisma.$queryRawUnsafe(
          `UPDATE "User" SET ${sets.join(", ")} WHERE "id" = $${idx}`,
          ...vals
        );
      }

      // Still set the locale cookie even if we can't save it to DB
      const res = NextResponse.json({ user: { name: body.name, locale: body.locale || "en" } });
      if (body.locale) {
        res.cookies.set("locale", body.locale, { path: "/", maxAge: 365 * 24 * 60 * 60 });
      }
      return res;
    } catch (e2) {
      console.error("Profile PATCH error:", e2);
      return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
    }
  }
}
