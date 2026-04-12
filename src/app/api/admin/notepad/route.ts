import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const NOTEPAD_KEY = "admin_notepad";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const setting = await prisma.setting.findUnique({ where: { key: NOTEPAD_KEY } });
  if (!setting) {
    return NextResponse.json({ notes: "", checklist: [] });
  }

  try {
    const data = typeof setting.value === "string" ? JSON.parse(setting.value as string) : setting.value;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ notes: "", checklist: [] });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const data = JSON.stringify({
    notes: body.notes ?? "",
    checklist: body.checklist ?? [],
  });

  await prisma.setting.upsert({
    where: { key: NOTEPAD_KEY },
    update: { value: data },
    create: { key: NOTEPAD_KEY, value: data },
  });

  return NextResponse.json({ success: true });
}
