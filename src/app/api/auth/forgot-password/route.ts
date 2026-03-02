import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Always return success to prevent email enumeration
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true, name: true, email: true, isActive: true },
  });

  if (user && user.isActive) {
    // Generate a signed JWT token (1-hour expiry)
    const token = await new SignJWT({ userId: user.id, purpose: "password-reset" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(secret);

    const baseUrl =
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    const resetUrl = `${baseUrl}/forgot-password/reset?token=${token}`;

    // Send email via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Havana Cleaning <noreply@havanacleaning.com>",
            to: [user.email],
            subject: "Reset Your Password — Havana Cleaning",
            html: `
              <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
                <h1 style="color: #2C1810; font-size: 24px; margin-bottom: 8px;">Havana Cleaning</h1>
                <p style="color: #7a6555; font-size: 14px; margin-bottom: 24px;">Password Reset Request</p>
                <p style="color: #2C1810; font-size: 15px; line-height: 1.6;">
                  Hi ${user.name || "there"},
                </p>
                <p style="color: #2C1810; font-size: 15px; line-height: 1.6;">
                  We received a request to reset your password. Click the button below to create a new one. This link expires in 1 hour.
                </p>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${resetUrl}" style="background-color: #C9941A; color: #2C1810; padding: 14px 32px; text-decoration: none; font-weight: 600; font-size: 14px; letter-spacing: 0.05em; text-transform: uppercase; border-radius: 3px;">
                    Reset Password
                  </a>
                </div>
                <p style="color: #7a6555; font-size: 13px; line-height: 1.6;">
                  If you didn't request this, you can safely ignore this email. Your password won't be changed.
                </p>
                <hr style="border: none; border-top: 1px solid #ece6d9; margin: 24px 0;" />
                <p style="color: #a89682; font-size: 12px;">
                  Havana Cleaning &middot; Miami, FL
                </p>
              </div>
            `,
          }),
        });
      } catch (err) {
        console.error("Failed to send reset email:", err);
      }
    } else {
      // No email service configured — log the link for development
      console.log(`[PASSWORD RESET] ${user.email}: ${resetUrl}`);
    }
  }

  // Always return success (don't reveal if email exists)
  return NextResponse.json({ success: true });
}
