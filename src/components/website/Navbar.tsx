"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

export function Navbar() {
  const { data: session } = useSession();
  const t = useTranslations("nav");
  const [mobileOpen, setMobileOpen] = useState(false);

  const accountHref = session
    ? session.user.role === "OWNER"
      ? "/admin"
      : session.user.role === "EMPLOYEE"
        ? "/portal"
        : "/account"
    : "/login";

  return (
    <nav className="fixed top-0 w-full z-50 bg-tobacco/[0.97] backdrop-blur-sm border-b-2 border-gold">
      <div className="flex items-center justify-between px-6 md:px-[60px] py-4">
        <Link href="/" className="font-display text-2xl font-black text-amber tracking-tight">
          Havana <span className="text-green-light italic">Cleaning</span>
        </Link>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden flex flex-col justify-center items-center w-10 h-10 gap-[5px]"
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-[2px] bg-cream transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
          <span className={`block w-6 h-[2px] bg-cream transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-[2px] bg-cream transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
        </button>

        {/* Desktop nav */}
        <ul className="hidden lg:flex items-center gap-7">
          <li>
            <Link href="/services" className="text-cream text-[0.82rem] tracking-[0.1em] uppercase font-medium hover:text-amber transition-colors">
              {t("services")}
            </Link>
          </li>
          <li>
            <Link href="/pricing" className="text-cream text-[0.82rem] tracking-[0.1em] uppercase font-medium hover:text-amber transition-colors">
              {t("pricing")}
            </Link>
          </li>
          <li>
            <Link href="/commercial" className="text-cream text-[0.82rem] tracking-[0.1em] uppercase font-medium hover:text-amber transition-colors">
              {t("commercial")}
            </Link>
          </li>
          <li>
            <Link href="/about" className="text-cream text-[0.82rem] tracking-[0.1em] uppercase font-medium hover:text-amber transition-colors">
              {t("about")}
            </Link>
          </li>
          <li>
            <Link href="/reviews" className="text-cream text-[0.82rem] tracking-[0.1em] uppercase font-medium hover:text-amber transition-colors">
              {t("reviews")}
            </Link>
          </li>
          <li>
            <Link href="/careers" className="bg-green text-white px-5 py-2.5 rounded-[3px] text-[0.82rem] tracking-[0.1em] uppercase font-semibold hover:bg-green-light hover:text-tobacco transition-colors">
              {t("hiring")}
            </Link>
          </li>
          <li>
            <Link href="/book" className="bg-gold text-tobacco px-5 py-2.5 rounded-[3px] text-[0.82rem] tracking-[0.1em] uppercase font-semibold hover:bg-amber transition-colors">
              {t("bookNow")}
            </Link>
          </li>
          <li>
            <Link href={accountHref} className="text-cream text-[0.82rem] tracking-[0.1em] uppercase font-medium hover:text-amber transition-colors">
              {session ? t("myAccount") : t("login")}
            </Link>
          </li>
        </ul>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-tobacco border-t border-white/10 px-6 pb-6 pt-2">
          <ul className="flex flex-col gap-1">
            <li>
              <Link href="/services" onClick={() => setMobileOpen(false)} className="block py-3 text-cream text-[0.9rem] tracking-[0.08em] uppercase font-medium hover:text-amber transition-colors border-b border-white/[0.06]">
                {t("services")}
              </Link>
            </li>
            <li>
              <Link href="/pricing" onClick={() => setMobileOpen(false)} className="block py-3 text-cream text-[0.9rem] tracking-[0.08em] uppercase font-medium hover:text-amber transition-colors border-b border-white/[0.06]">
                {t("pricing")}
              </Link>
            </li>
            <li>
              <Link href="/commercial" onClick={() => setMobileOpen(false)} className="block py-3 text-cream text-[0.9rem] tracking-[0.08em] uppercase font-medium hover:text-amber transition-colors border-b border-white/[0.06]">
                {t("commercial")}
              </Link>
            </li>
            <li>
              <Link href="/about" onClick={() => setMobileOpen(false)} className="block py-3 text-cream text-[0.9rem] tracking-[0.08em] uppercase font-medium hover:text-amber transition-colors border-b border-white/[0.06]">
                {t("about")}
              </Link>
            </li>
            <li>
              <Link href="/reviews" onClick={() => setMobileOpen(false)} className="block py-3 text-cream text-[0.9rem] tracking-[0.08em] uppercase font-medium hover:text-amber transition-colors border-b border-white/[0.06]">
                {t("reviews")}
              </Link>
            </li>
            <li>
              <Link href={accountHref} onClick={() => setMobileOpen(false)} className="block py-3 text-cream text-[0.9rem] tracking-[0.08em] uppercase font-medium hover:text-amber transition-colors border-b border-white/[0.06]">
                {session ? t("myAccount") : t("login")}
              </Link>
            </li>
            <li className="flex gap-3 mt-4">
              <Link href="/careers" onClick={() => setMobileOpen(false)} className="flex-1 text-center bg-green text-white py-3 rounded-[3px] text-[0.85rem] tracking-[0.08em] uppercase font-semibold hover:bg-green-light hover:text-tobacco transition-colors">
                {t("hiring")}
              </Link>
              <Link href="/book" onClick={() => setMobileOpen(false)} className="flex-1 text-center bg-gold text-tobacco py-3 rounded-[3px] text-[0.85rem] tracking-[0.08em] uppercase font-semibold hover:bg-amber transition-colors">
                {t("bookNow")}
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
