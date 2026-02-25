"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [locale, setLocale] = useState("en");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setLocale(session.user.locale || "en");
    }
    // Fetch full profile for phone
    fetch("/api/account/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setPhone(d.user.phone || "");
          setLocale(d.user.locale || "en");
        }
      })
      .catch(() => {});
  }, [session]);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, locale }),
    });
    setSaving(false);
    if (res.ok) {
      setMessage("Profile updated!");
    } else {
      setMessage("Failed to update.");
    }
  };

  return (
    <div>
      <h2 className="font-display text-xl text-tobacco mb-5">My Profile</h2>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 mb-5">
        {/* Avatar + Email */}
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
          <div className="w-14 h-14 rounded-full bg-green/10 text-green flex items-center justify-center text-2xl font-bold">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-tobacco">{name}</div>
            <div className="text-gray-400 text-sm">{session?.user?.email}</div>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="text-sm font-medium text-gray-600 block mb-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green/30"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="text-sm font-medium text-gray-600 block mb-1">Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green/30"
          />
        </div>

        {/* Language */}
        <div>
          <label className="text-sm font-medium text-gray-600 block mb-1">Language</label>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green/30"
          >
            <option value="en">English</option>
            <option value="es">Espa&ntilde;ol</option>
          </select>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-green text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-green/90 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        {message && (
          <p className={`text-sm text-center ${message.includes("Failed") ? "text-red" : "text-green"}`}>
            {message}
          </p>
        )}
      </div>

      {/* Sign Out */}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="w-full bg-white border border-red/30 text-red py-2.5 rounded-xl text-sm font-semibold hover:bg-red/5 transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
}
