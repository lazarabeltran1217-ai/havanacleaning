"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
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
        <div className="relative z-10 w-full max-w-md text-center">
          <div className="bg-cream rounded-lg p-8 shadow-xl">
            <h2 className="font-display text-xl text-tobacco mb-3">Invalid Link</h2>
            <p className="text-[0.85rem] text-[#7a6555] mb-6">
              This password reset link is invalid or has expired.
            </p>
            <Link
              href="/forgot-password"
              className="inline-block bg-gold text-tobacco px-8 py-3 rounded-[3px] font-semibold text-[0.85rem] tracking-[0.06em] uppercase hover:bg-amber transition-colors"
            >
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
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
          <p className="text-sand mt-3 text-sm">Create a new password</p>
        </div>

        {success ? (
          <div className="bg-cream rounded-lg p-8 shadow-xl text-center">
            <div className="w-14 h-14 bg-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-display text-xl text-tobacco mb-2">Password Updated</h2>
            <p className="text-[0.85rem] text-[#7a6555] mb-6">
              Your password has been reset successfully. You can now sign in with
              your new password.
            </p>
            <Link
              href="/login"
              className="inline-block bg-gold text-tobacco px-8 py-3 rounded-[3px] font-semibold text-[0.85rem] tracking-[0.06em] uppercase hover:bg-amber transition-colors"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-cream rounded-lg p-8 shadow-xl">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-6">
                {error}
              </div>
            )}

            <div className="mb-5">
              <label className="block text-[0.75rem] tracking-[0.1em] uppercase text-[#7a6555] mb-2 font-medium">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                minLength={6}
                required
                className="w-full px-4 py-3 border-[1.5px] border-tobacco/[0.18] rounded-md text-tobacco bg-white focus:border-green outline-none transition-colors"
              />
            </div>

            <div className="mb-6">
              <label className="block text-[0.75rem] tracking-[0.1em] uppercase text-[#7a6555] mb-2 font-medium">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 border-[1.5px] border-tobacco/[0.18] rounded-md text-tobacco bg-white focus:border-green outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-tobacco py-4 rounded-[3px] font-semibold text-[0.9rem] tracking-[0.08em] uppercase hover:bg-amber transition-colors disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
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
