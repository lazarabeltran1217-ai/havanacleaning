"use client";

import { useState } from "react";

interface Props {
  initialSettings: Record<string, string>;
}

const COMPANY_FIELDS = [
  { key: "company_name", label: "Company Name" },
  { key: "company_phone", label: "Phone" },
  { key: "company_email", label: "Email" },
  { key: "company_address", label: "Address" },
  { key: "business_hours", label: "Business Hours" },
  { key: "tax_rate", label: "Tax Rate (decimal, e.g. 0.07)" },
];

const SOCIAL_FIELDS = [
  { key: "social_facebook", label: "Facebook URL" },
  { key: "social_instagram", label: "Instagram URL" },
  { key: "social_tiktok", label: "TikTok URL" },
  { key: "social_yelp", label: "Yelp URL" },
  { key: "social_google", label: "Google Business URL" },
  { key: "social_nextdoor", label: "Nextdoor URL" },
];

export function SettingsForm({ initialSettings }: Props) {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setLoading(true);
    setSaved(false);

    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
    });

    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[0.85rem]";
  const labelClass = "block text-[0.72rem] uppercase tracking-wider text-gray-400 mb-1.5";

  return (
    <div className="space-y-6 max-w-2xl">
      {/* COMPANY INFO */}
      <div className="bg-white rounded-xl p-6 border border-[#ece6d9]">
        <h3 className="font-display text-base mb-4">Company Information</h3>
        <div className="space-y-3">
          {COMPANY_FIELDS.map((field) => (
            <div key={field.key}>
              <label className={labelClass}>{field.label}</label>
              <input
                type="text"
                value={settings[field.key] || ""}
                onChange={(e) => update(field.key, e.target.value)}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      </div>

      {/* SOCIAL MEDIA */}
      <div className="bg-white rounded-xl p-6 border border-[#ece6d9]">
        <h3 className="font-display text-base mb-4">Social Media Profiles</h3>
        <div className="space-y-3">
          {SOCIAL_FIELDS.map((field) => (
            <div key={field.key}>
              <label className={labelClass}>{field.label}</label>
              <input
                type="url"
                value={settings[field.key] || ""}
                onChange={(e) => update(field.key, e.target.value)}
                placeholder="https://..."
                className={inputClass}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-green text-white px-8 py-2.5 text-[0.85rem] font-semibold rounded-lg hover:bg-green/90 disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving..." : "Save All Settings"}
        </button>
        {saved && <span className="text-green text-[0.85rem]">Settings saved!</span>}
      </div>
    </div>
  );
}
