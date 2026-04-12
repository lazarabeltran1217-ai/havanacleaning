"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Send, CheckCircle } from "lucide-react";

const CATEGORIES = [
  { value: "booking", labelKey: "categoryBooking" },
  { value: "payment", labelKey: "categoryPayment" },
  { value: "account", labelKey: "categoryAccount" },
  { value: "general", labelKey: "categoryGeneral" },
] as const;

export function SupportForm() {
  const t = useTranslations("support");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot1, setHoneypot1] = useState("");
  const [honeypot2, setHoneypot2] = useState("");
  const [jsToken, setJsToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setJsToken(`js_${Date.now()}`);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot1 || honeypot2) return;
    if (!name || !email || !subject || !message) {
      setError(t("fillRequired"));
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, category, subject, message, jsToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white border border-green/20 rounded-xl p-10 text-center">
        <CheckCircle className="w-12 h-12 text-green mx-auto mb-4" />
        <h3 className="font-display text-xl mb-2">{t("successTitle")}</h3>
        <p className="text-[#7a6555] text-[0.9rem]">{t("successDesc")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative bg-white border border-tobacco/8 rounded-xl p-6 md:p-8 space-y-5">
      {/* Honeypot fields */}
      <div className="absolute -top-[9999px] -left-[9999px] opacity-0 pointer-events-none" aria-hidden="true">
        <input tabIndex={-1} value={honeypot1} onChange={(e) => setHoneypot1(e.target.value)} />
        <input tabIndex={-1} value={honeypot2} onChange={(e) => setHoneypot2(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-[0.8rem] font-semibold text-tobacco mb-1.5">{t("nameLabel")} *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-tobacco/15 rounded-lg px-4 py-2.5 text-[0.9rem] focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green"
            placeholder={t("namePlaceholder")}
            required
          />
        </div>
        <div>
          <label className="block text-[0.8rem] font-semibold text-tobacco mb-1.5">{t("emailLabel")} *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-tobacco/15 rounded-lg px-4 py-2.5 text-[0.9rem] focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green"
            placeholder={t("emailPlaceholder")}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-[0.8rem] font-semibold text-tobacco mb-1.5">{t("categoryLabel")}</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-tobacco/15 rounded-lg px-4 py-2.5 text-[0.9rem] focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green bg-white"
          >
            <option value="">{t("categorySelect")}</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>{t(cat.labelKey)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[0.8rem] font-semibold text-tobacco mb-1.5">{t("subjectLabel")} *</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border border-tobacco/15 rounded-lg px-4 py-2.5 text-[0.9rem] focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green"
            placeholder={t("subjectPlaceholder")}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-[0.8rem] font-semibold text-tobacco mb-1.5">{t("messageLabel")} *</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="w-full border border-tobacco/15 rounded-lg px-4 py-2.5 text-[0.9rem] focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green resize-none"
          placeholder={t("messagePlaceholder")}
          required
        />
      </div>

      {error && (
        <p className="text-red-600 text-[0.85rem]">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-green text-white py-3 rounded-lg font-semibold text-[0.9rem] hover:bg-green/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Send className="w-4 h-4" />
        {submitting ? t("sending") : t("sendMessage")}
      </button>
    </form>
  );
}
