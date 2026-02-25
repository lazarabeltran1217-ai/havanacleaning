"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

export function Navbar() {
  const { data: session } = useSession();
  const t = useTranslations("nav");

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

        <ul className="hidden lg:flex items-center gap-7">
          <li>
            <Link href="/#services" className="text-cream text-[0.82rem] tracking-[0.1em] uppercase font-medium hover:text-amber transition-colors">
              {t("services")}
            </Link>
          </li>
          <li>
            <Link href="/#pricing" className="text-cream text-[0.82rem] tracking-[0.1em] uppercase font-medium hover:text-amber transition-colors">
              {t("pricing")}
            </Link>
          </li>
          <li>
            <Link href="/#commercial" className="text-cream text-[0.82rem] tracking-[0.1em] uppercase font-medium hover:text-amber transition-colors">
              {t("commercial")}
            </Link>
          </li>
          <li>
            <Link href="/#about" className="text-cream text-[0.82rem] tracking-[0.1em] uppercase font-medium hover:text-amber transition-colors">
              {t("about")}
            </Link>
          </li>
          <li>
            <Link href="/#testimonials" className="text-cream text-[0.82rem] tracking-[0.1em] uppercase font-medium hover:text-amber transition-colors">
              {t("reviews")}
            </Link>
          </li>
          <li>
            <Link href="/careers" className="bg-green text-white px-5 py-2.5 rounded-[3px] text-[0.82rem] tracking-[0.1em] uppercase font-semibold hover:bg-green-light hover:text-tobacco transition-colors">
              {t("hiring")}
            </Link>
          </li>
          <li>
            <Link href="/#booking" className="bg-gold text-tobacco px-5 py-2.5 rounded-[3px] text-[0.82rem] tracking-[0.1em] uppercase font-semibold hover:bg-amber transition-colors">
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
    </nav>
  );
}
