"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-tobacco flex items-center justify-center px-4 pt-20">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #C9941A 0, #C9941A 1px, transparent 0, transparent 50%)",
          backgroundSize: "20px 20px",
        }}
      />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-3xl font-black text-amber">
            Havana <span className="text-green-light italic">Cleaning</span>
          </Link>
          <p className="text-sand mt-3 text-sm">Reset your password</p>
        </div>

        {sent ? (
          <div className="bg-cream rounded-lg p-8 shadow-xl text-center">
            <div className="w-14 h-14 bg-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="font-display text-xl text-tobacco mb-2">Check Your Email</h2>
            <p className="text-[0.85rem] text-[#7a6555] mb-6">
              If an account exists for <strong>{email}</strong>, we&apos;ve sent a
              password reset link. Check your inbox and spam folder.
            </p>
            <Link
              href="/login"
              className="inline-block text-green text-[0.85rem] font-medium hover:text-green/80 transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-cream rounded-lg p-8 shadow-xl">
            <p className="text-[0.85rem] text-[#7a6555] mb-6">
              Enter your email address and we&apos;ll send you a link to reset your
              password.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-6">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-[0.75rem] tracking-[0.1em] uppercase text-[#7a6555] mb-2 font-medium">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@havanacleaning.com"
                required
                className="w-full px-4 py-3 border-[1.5px] border-tobacco/[0.18] rounded-md text-tobacco bg-white focus:border-green outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-tobacco py-4 rounded-[3px] font-semibold text-[0.9rem] tracking-[0.08em] uppercase hover:bg-amber transition-colors disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <p className="text-center text-sand/60 text-sm mt-6">
          <Link href="/login" className="hover:text-cream transition-colors">
            ← Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
