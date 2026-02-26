"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Home, ClipboardList, Timer, CalendarDays, DollarSign } from "lucide-react";

const tabs: { label: string; href: string; icon: LucideIcon; elevated?: boolean }[] = [
  { label: "Today", href: "/portal", icon: Home },
  { label: "Jobs", href: "/portal/jobs", icon: ClipboardList },
  { label: "Clock", href: "/portal/clock", icon: Timer, elevated: true },
  { label: "Schedule", href: "/portal/schedule", icon: CalendarDays },
  { label: "Hours", href: "/portal/hours", icon: DollarSign },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-bottom md:hidden">
      <div className="flex justify-around items-end px-2 pt-2 pb-3 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 text-[11px] font-medium ${
                tab.elevated ? "-mt-5" : ""
              } ${isActive ? "text-green" : "text-gray-400"}`}
            >
              {tab.elevated ? (
                <span className="w-14 h-14 rounded-full bg-green text-white flex items-center justify-center shadow-lg border-4 border-white">
                  <tab.icon className="w-6 h-6" />
                </span>
              ) : (
                <tab.icon className="w-5 h-5" />
              )}
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
