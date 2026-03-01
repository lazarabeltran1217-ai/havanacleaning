"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountToolbar } from "@/components/website/AccountToolbar";
import { AccountBottomNav } from "@/components/website/AccountBottomNav";
import type { LucideIcon } from "lucide-react";
import { Home, ClipboardList, MapPin, Settings } from "lucide-react";

const accountTabs: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Overview", href: "/account", icon: Home },
  { label: "My Bookings", href: "/account/bookings", icon: ClipboardList },
  { label: "Addresses", href: "/account/addresses", icon: MapPin },
  { label: "Settings", href: "/account/settings", icon: Settings },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Don't show portal shell on payment pages
  if (pathname.includes("/pay")) {
    return (
      <div className="bg-ivory min-h-screen pt-28 pb-16 px-6 md:px-20">
        <div className="max-w-5xl mx-auto">{children}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory dark:bg-[#1a1410]">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 bg-tobacco/[0.97] dark:bg-[#1a1410]/[0.97] backdrop-blur-sm border-b-2 border-gold px-5 py-3 flex items-center justify-between md:hidden">
        <div>
          <div className="font-display text-2xl font-black text-amber tracking-tight">
            Havana <span className="text-green-light italic">Cleaning</span>
          </div>
          <div className="text-sand text-[11px] tracking-[1.5px] uppercase">My Account</div>
        </div>
        <AccountToolbar />
      </header>

      {/* Desktop top bar */}
      <div className="hidden md:block">
        <div className="sticky top-0 z-40 bg-tobacco/[0.97] dark:bg-[#1a1410]/[0.97] backdrop-blur-sm border-b-2 border-gold px-8 h-14 flex items-center justify-between">
          <div className="flex items-center">
            <span className="font-display text-2xl font-black text-amber tracking-tight">
              Havana <span className="text-green-light italic">Cleaning</span>
            </span>
            <span className="ml-3 text-sand text-[11px] tracking-[1.5px] uppercase">My Account</span>
          </div>
          <AccountToolbar />
        </div>

        {/* Desktop tab nav */}
        <div className="bg-white/80 dark:bg-[#231c16]/80 backdrop-blur-sm border-b border-gray-100 dark:border-[#3a2f25] px-8">
          <div className="max-w-6xl mx-auto flex gap-1">
            {accountTabs.map((tab) => {
              const isActive =
                tab.href === "/account"
                  ? pathname === "/account"
                  : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-2 px-4 py-3 text-[0.82rem] font-medium border-b-2 transition-colors ${
                    isActive
                      ? "border-green text-green dark:text-green-light"
                      : "border-transparent text-gray-400 dark:text-sand/50 hover:text-tobacco dark:hover:text-cream"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="px-4 md:px-8 py-5 pb-24 md:pb-5">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <AccountBottomNav />
    </div>
  );
}
