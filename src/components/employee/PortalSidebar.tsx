"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { LucideIcon } from "lucide-react";
import { Home, ClipboardList, Timer, CalendarDays, DollarSign, FileText, User } from "lucide-react";

const navItems: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Today", href: "/portal", icon: Home },
  { label: "Jobs", href: "/portal/jobs", icon: ClipboardList },
  { label: "Clock In/Out", href: "/portal/clock", icon: Timer },
  { label: "Schedule", href: "/portal/schedule", icon: CalendarDays },
  { label: "Hours & Pay", href: "/portal/hours", icon: DollarSign },
  { label: "Pay Stubs", href: "/portal/pay-stubs", icon: FileText },
  { label: "Profile", href: "/portal/profile", icon: User },
];

export function PortalSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed top-0 left-0 w-56 h-screen bg-tobacco border-r-[3px] border-green flex-col z-50">
      <div className="px-5 py-6 text-center border-b border-green/20">
        <h2 className="font-display text-gold text-xl tracking-wide">Havana Cleaning</h2>
        <span className="text-[11px] text-sand tracking-[2px] uppercase">Employee Portal</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-colors ${
                isActive
                  ? "bg-green text-white"
                  : "text-sand hover:bg-white/[0.07] hover:text-white"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-4 py-4 border-t border-green/20">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full text-left text-sand text-[13px] hover:text-white transition-colors"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
