import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { settings } = await req.json();
    const entries = Object.entries(settings).filter(
      ([, v]) => v !== undefined && v !== null,
    );

    for (const [key, value] of entries) {
      // Prisma Json field: store every value as a plain JSON string
      const jsonValue = typeof value === "string" ? value : String(value);
      await prisma.setting.upsert({
        where: { key },
        update: { value: jsonValue },
        create: { key, value: jsonValue },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[settings] Save error:", err);
    const message = err instanceof Error ? err.message : "Failed to save settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
