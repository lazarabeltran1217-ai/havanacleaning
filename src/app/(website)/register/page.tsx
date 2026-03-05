"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/account/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Auto sign-in after registration
      await signIn("credentials", {
        email,
        password,
        callbackUrl,
      });
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <section className="bg-ivory min-h-screen pt-36 pb-20 px-6 flex items-start justify-center">
      <div className="w-full max-w-md">
        <h1 className="font-display text-3xl text-center mb-2">
          Create Account
        </h1>
        <p className="text-center text-sand text-[0.9rem] mb-8">
          Join Havana Cleaning to book services and manage your home.
        </p>

        <div className="bg-white border border-tobacco/10 rounded-lg p-8 space-y-4">
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl })}
            className="w-full flex items-center justify-center gap-3 bg-ivory border border-tobacco/10 text-tobacco py-3.5 rounded-md font-medium text-[0.9rem] hover:bg-cream transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-tobacco/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-tobacco/40 tracking-wider">or create with email</span>
            </div>
          </div>

        <form
          onSubmit={handleSubmit}
        >
          <div>
            <label className="block text-[0.78rem] uppercase tracking-wider text-sand mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-tobacco/15 rounded-md px-4 py-3 text-[0.9rem]"
            />
          </div>

          <div>
            <label className="block text-[0.78rem] uppercase tracking-wider text-sand mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-tobacco/15 rounded-md px-4 py-3 text-[0.9rem]"
            />
          </div>

          <div>
            <label className="block text-[0.78rem] uppercase tracking-wider text-sand mb-1.5">
              Phone (optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(305) 555-0000"
              className="w-full border border-tobacco/15 rounded-md px-4 py-3 text-[0.9rem]"
            />
          </div>

          <div>
            <label className="block text-[0.78rem] uppercase tracking-wider text-sand mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border border-tobacco/15 rounded-md px-4 py-3 text-[0.9rem]"
            />
          </div>

          <div>
            <label className="block text-[0.78rem] uppercase tracking-wider text-sand mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full border border-tobacco/15 rounded-md px-4 py-3 text-[0.9rem]"
            />
          </div>

          {error && (
            <div className="text-red text-[0.85rem] bg-red/10 border border-red/20 px-4 py-2 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green text-white py-3.5 text-[0.9rem] font-semibold tracking-[0.06em] uppercase rounded-[3px] hover:bg-green/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <p className="text-center text-[0.85rem] text-sand">
            Already have an account?{" "}
            <Link href={`/login${callbackUrl !== "/account" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`} className="text-green hover:underline">
              Sign In
            </Link>
          </p>
        </form>
        </div>
      </div>
    </section>
  );
}
