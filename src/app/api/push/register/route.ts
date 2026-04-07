import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token, platform } = await req.json();
  if (!token || !platform) {
    return NextResponse.json(
      { error: "token and platform required" },
      { status: 400 }
    );
  }

  await prisma.deviceToken.upsert({
    where: { token },
    update: {
      userId: session.user.id,
      platform,
      isActive: true,
    },
    create: {
      userId: session.user.id,
      token,
      platform,
      isActive: true,
    },
  });

  return NextResponse.json({ ok: true });
}
