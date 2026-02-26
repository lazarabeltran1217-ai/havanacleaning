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

const API_FIELDS = [
  { key: "api_stripe_secret", label: "Stripe Secret Key", placeholder: "sk_live_..." },
  { key: "api_stripe_publishable", label: "Stripe Publishable Key", placeholder: "pk_live_..." },
  { key: "api_deepseek_key", label: "DeepSeek API Key", placeholder: "sk-..." },
  { key: "api_email_key", label: "Email Service API Key (Resend / SendGrid)", placeholder: "re_..." },
];

export function SettingsForm({ initialSettings }: Props) {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

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

      {/* API KEYS */}
      <div className="bg-white rounded-xl p-6 border border-[#ece6d9]">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-display text-base">API Keys</h3>
          <span className="text-[0.65rem] bg-amber/10 text-amber px-2 py-0.5 rounded-full font-medium uppercase tracking-wider">Sensitive</span>
        </div>
        <p className="text-gray-400 text-[0.78rem] mb-4">
          Add your API keys here. The system will detect and use them automatically.
        </p>
        <div className="space-y-3">
          {API_FIELDS.map((field) => (
            <div key={field.key}>
              <label className={labelClass}>{field.label}</label>
              <div className="relative">
                <input
                  type={showKeys[field.key] ? "text" : "password"}
                  value={settings[field.key] || ""}
                  onChange={(e) => update(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className={`${inputClass} pr-16 font-mono text-[0.8rem]`}
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowKeys((prev) => ({ ...prev, [field.key]: !prev[field.key] }))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[0.72rem] text-gray-400 hover:text-tobacco transition-colors px-2 py-1"
                >
                  {showKeys[field.key] ? "Hide" : "Show"}
                </button>
              </div>
              {settings[field.key] && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 bg-green rounded-full" />
                  <span className="text-green text-[0.7rem]">Connected</span>
                </div>
              )}
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
