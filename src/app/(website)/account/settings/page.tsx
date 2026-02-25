"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function AccountSettingsPage() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [locale, setLocale] = useState("en");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/account/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setName(data.user.name || "");
          setPhone(data.user.phone || "");
          setLocale(data.user.locale || "en");
        }
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, locale }),
    });

    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (!session) return null;

  return (
    <div>
      <h2 className="font-display text-xl mb-6">Account Settings</h2>
      <form
        onSubmit={handleSave}
        className="bg-white border border-tobacco/10 rounded-lg p-6 space-y-4 max-w-lg"
      >
        <div>
          <label className="block text-[0.78rem] uppercase tracking-wider text-sand mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-tobacco/15 rounded-md px-4 py-3 text-[0.9rem]"
          />
        </div>

        <div>
          <label className="block text-[0.78rem] uppercase tracking-wider text-sand mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={session.user.email}
            disabled
            className="w-full border border-tobacco/15 rounded-md px-4 py-3 text-[0.9rem] bg-ivory text-sand"
          />
        </div>

        <div>
          <label className="block text-[0.78rem] uppercase tracking-wider text-sand mb-1.5">
            Phone
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-tobacco/15 rounded-md px-4 py-3 text-[0.9rem]"
          />
        </div>

        <div>
          <label className="block text-[0.78rem] uppercase tracking-wider text-sand mb-1.5">
            Language
          </label>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="w-full border border-tobacco/15 rounded-md px-4 py-3 text-[0.9rem]"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-green text-white px-6 py-2.5 text-[0.85rem] font-semibold rounded-[3px] hover:bg-green/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          {saved && (
            <span className="text-green text-[0.85rem]">
              Changes saved!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
