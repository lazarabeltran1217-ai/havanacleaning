"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useTranslations } from "next-intl";

export default function PortalToolbar() {
  const t = useTranslations("portal");
  const [isDark, setIsDark] = useState(false);
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    // Read theme from localStorage
    const saved = localStorage.getItem("portal-theme");
    if (saved === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
    // Read locale from cookie
    const match = document.cookie.match(/(?:^|; )locale=([^;]*)/);
    if (match) setLocale(match[1]);
  }, []);

  const toggleDarkMode = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("portal-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("portal-theme", "light");
    }
  };

  const switchLocale = (newLocale: string) => {
    setLocale(newLocale);
    // Set cookie directly so next-intl picks it up
    document.cookie = `locale=${newLocale}; path=/; max-age=${365 * 24 * 60 * 60}`;
    // Also try saving to DB (fire and forget)
    fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: newLocale }),
    }).catch(() => {});
    // Reload to apply new locale
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-2">
      {/* Language toggle */}
      <div className="flex items-center rounded-lg border border-gold/30 overflow-hidden">
        <button
          onClick={() => locale !== "en" && switchLocale("en")}
          className={`flex items-center gap-1 px-2.5 py-1.5 text-[0.7rem] font-semibold transition-colors ${
            locale === "en"
              ? "bg-gold/20 text-amber"
              : "text-sand/70 hover:text-sand"
          }`}
        >
          EN
        </button>
        <button
          onClick={() => locale !== "es" && switchLocale("es")}
          className={`flex items-center gap-1 px-2.5 py-1.5 text-[0.7rem] font-semibold transition-colors ${
            locale === "es"
              ? "bg-gold/20 text-amber"
              : "text-sand/70 hover:text-sand"
          }`}
        >
          ES
        </button>
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggleDarkMode}
        className="p-1.5 rounded-lg border border-gold/30 text-sand/70 hover:text-amber transition-colors"
        title={isDark ? t("profile_light") : t("profile_dark")}
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
    </div>
  );
}
