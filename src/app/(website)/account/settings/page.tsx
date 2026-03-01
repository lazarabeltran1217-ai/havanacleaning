"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Settings } from "lucide-react";

const CARD =
  "bg-white dark:bg-[#231c16] rounded-2xl border border-gray-100 dark:border-[#3a2f25] shadow-sm p-5";
const INPUT_CLS =
  "w-full px-3 py-2.5 border border-gray-200 dark:border-[#3a2f25] rounded-lg text-[0.88rem] bg-white dark:bg-[#1a1410] dark:text-cream focus:outline-none focus:ring-2 focus:ring-green/30";
const LABEL_CLS =
  "block text-[0.72rem] font-medium text-gray-500 dark:text-sand/60 uppercase tracking-wider mb-1";

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
      <h2 className="font-display text-xl text-tobacco dark:text-cream mb-5 flex items-center gap-2">
        <Settings className="w-5 h-5 text-green" /> Account Settings
      </h2>

      <form onSubmit={handleSave} className={`${CARD} space-y-4 max-w-lg`}>
        <div>
          <label className={LABEL_CLS}>Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={INPUT_CLS}
          />
        </div>

        <div>
          <label className={LABEL_CLS}>Email</label>
          <input
            type="email"
            value={session.user.email}
            disabled
            className={`${INPUT_CLS} opacity-60 cursor-not-allowed`}
          />
        </div>

        <div>
          <label className={LABEL_CLS}>Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={INPUT_CLS}
          />
        </div>

        <div>
          <label className={LABEL_CLS}>Language</label>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className={INPUT_CLS}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-green text-white px-6 py-2.5 text-[0.85rem] font-semibold rounded-lg hover:bg-green/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          {saved && (
            <span className="text-green text-[0.85rem]">Changes saved!</span>
          )}
        </div>
      </form>
    </div>
  );
}
