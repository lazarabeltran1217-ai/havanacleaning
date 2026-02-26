import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const content = await prisma.content.findMany({ orderBy: { key: "asc" } });
  return NextResponse.json(content);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { items } = await req.json();

  for (const item of items) {
    await prisma.content.upsert({
      where: { key: item.key },
      update: { dataEn: item.dataEn, dataEs: item.dataEs ?? undefined, published: item.published ?? true },
      create: { key: item.key, dataEn: item.dataEn, dataEs: item.dataEs ?? {}, published: item.published ?? true },
    });
  }

  return NextResponse.json({ success: true });
}
