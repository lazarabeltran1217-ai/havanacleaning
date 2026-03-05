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

        <div className="bg-cream rounded-lg p-8 shadow-xl">
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl })}
            className="w-full flex items-center justify-center gap-3 bg-white border-[1.5px] border-tobacco/[0.12] text-tobacco py-3.5 rounded-md font-medium text-[0.9rem] hover:bg-ivory transition-colors mb-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-tobacco/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-cream px-3 text-tobacco/40 tracking-wider">or sign in with email</span>
            </div>
          </div>

        <form onSubmit={handleSubmit}>
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
        </div>

        <p className="text-center text-sand/60 text-sm mt-6">
          <Link href="/" className="hover:text-cream transition-colors">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
