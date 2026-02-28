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
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
}
