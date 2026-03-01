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

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-tobacco/10 rounded-lg p-8 space-y-4"
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
    </section>
  );
}
