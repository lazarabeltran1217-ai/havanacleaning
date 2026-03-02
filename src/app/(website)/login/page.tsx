"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    // Fetch session to get role for redirect
    const res = await fetch("/api/auth/session");
    const session = await res.json();

    if (session?.user?.role === "OWNER") {
      router.push("/admin");
    } else if (session?.user?.role === "EMPLOYEE") {
      router.push("/portal");
    } else {
      // Customers go to their portal by default
      const dest = callbackUrl === "/" || callbackUrl === "/login" ? "/account" : callbackUrl;
      router.push(dest);
    }
  }

  return (
    <div className="min-h-screen bg-tobacco flex items-center justify-center px-4 pt-20">
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "repeating-linear-gradient(45deg, #C9941A 0, #C9941A 1px, transparent 0, transparent 50%)",
        backgroundSize: "20px 20px",
      }} />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-3xl font-black text-amber">
            Havana <span className="text-green-light italic">Cleaning</span>
          </Link>
          <p className="text-sand mt-3 text-sm">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-cream rounded-lg p-8 shadow-xl">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-6">
              {error}
            </div>
          )}

          <div className="mb-5">
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

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[0.75rem] tracking-[0.1em] uppercase text-[#7a6555] font-medium">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[0.75rem] text-green hover:text-green/80 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sand/60 text-sm mt-6">
          <Link href="/" className="hover:text-cream transition-colors">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
