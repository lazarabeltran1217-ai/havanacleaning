"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function AccountToolbar() {
  const [isDark, setIsDark] = useState(false);
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("account-theme");
    if (saved === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
    const match = document.cookie.match(/(?:^|; )locale=([^;]*)/);
    if (match) setLocale(match[1]);
  }, []);

  const toggleDarkMode = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("account-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("account-theme", "light");
    }
  };

  const switchLocale = (newLocale: string) => {
    setLocale(newLocale);
    document.cookie = `locale=${newLocale}; path=/; max-age=${365 * 24 * 60 * 60}`;
    fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: newLocale }),
    }).catch(() => {});
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center rounded-lg border border-gold/30 overflow-hidden">
        <button
          onClick={() => locale !== "en" && switchLocale("en")}
          className={`px-2.5 py-1.5 text-[0.7rem] font-semibold transition-colors ${
            locale === "en" ? "bg-gold/20 text-amber" : "text-sand/70 hover:text-sand"
          }`}
        >
          EN
        </button>
        <button
          onClick={() => locale !== "es" && switchLocale("es")}
          className={`px-2.5 py-1.5 text-[0.7rem] font-semibold transition-colors ${
            locale === "es" ? "bg-gold/20 text-amber" : "text-sand/70 hover:text-sand"
          }`}
        >
          ES
        </button>
      </div>

      <button
        onClick={toggleDarkMode}
        className="p-1.5 rounded-lg border border-gold/30 text-sand/70 hover:text-amber transition-colors"
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="p-1.5 rounded-lg border border-gold/30 text-sand/70 hover:text-red transition-colors"
        title="Sign Out"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
