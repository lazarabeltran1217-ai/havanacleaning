import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { hash } from "bcryptjs";

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();

  if (!token || !password) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  // Verify the JWT token
  try {
    const { payload } = await jwtVerify(token, secret);

    if (payload.purpose !== "password-reset" || !payload.userId) {
      return NextResponse.json({ error: "Invalid reset link" }, { status: 400 });
    }

    const userId = payload.userId as string;

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: "Invalid reset link" }, { status: 400 });
    }

    // Hash and update the password
    const hashedPassword = await hash(password, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "This reset link has expired. Please request a new one." },
      { status: 400 }
    );
  }
}
