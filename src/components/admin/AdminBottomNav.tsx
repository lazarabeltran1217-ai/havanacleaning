"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, CalendarCheck, Calendar, Users, Menu } from "lucide-react";

const tabs: { label: string; href: string; icon: LucideIcon; elevated?: boolean }[] = [
  { label: "Home", href: "/admin", icon: LayoutDashboard },
  { label: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
  { label: "Schedule", href: "/admin/schedule", icon: Calendar, elevated: true },
  { label: "Staff", href: "/admin/staff", icon: Users },
];

export function AdminBottomNav({ onMenuOpen }: { onMenuOpen: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-bottom md:hidden">
      <div className="flex justify-around items-end px-2 pt-2 pb-3 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(tab.href);
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
        {/* More menu button to open sidebar */}
        <button
          onClick={onMenuOpen}
          className="flex flex-col items-center gap-0.5 text-[11px] font-medium text-gray-400"
        >
          <Menu className="w-5 h-5" />
          <span>More</span>
        </button>
      </div>
    </nav>
  );
}
