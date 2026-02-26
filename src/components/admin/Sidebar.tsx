"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: "📊" },
  { label: "Bookings", href: "/admin/bookings", icon: "📅" },
  { label: "Schedule", href: "/admin/schedule", icon: "🗓️" },
  { label: "Clock", href: "/admin/clock", icon: "⏰" },
  { label: "Applicants", href: "/admin/applicants", icon: "📋" },
  { label: "Commercial", href: "/admin/commercial", icon: "🏢" },
  { label: "Payments", href: "/admin/payments", icon: "💳" },
  { label: "Revenue", href: "/admin/revenue", icon: "📈" },
  { label: "Staff", href: "/admin/staff", icon: "👥" },
  { label: "Clients", href: "/admin/clients", icon: "🏠" },
  { label: "Inventory", href: "/admin/inventory", icon: "📦" },
  { label: "Payroll", href: "/admin/payroll", icon: "💰" },
  { label: "Services", href: "/admin/services", icon: "✨" },
  { label: "Content", href: "/admin/content", icon: "📝" },
  { label: "SEO Manager", href: "/admin/seo", icon: "🔍" },
  { label: "Settings", href: "/admin/settings", icon: "⚙️" },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed top-0 left-0 w-60 h-screen bg-tobacco border-r-[3px] border-gold flex flex-col z-50 overflow-y-auto transition-transform duration-300 ${
        open ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
    >
      <div className="px-5 py-6 text-center border-b border-gold/20 flex items-center justify-between md:justify-center">
        <div>
          <h2 className="font-display text-gold text-xl tracking-wide">Havana Cleaning</h2>
          <span className="text-[11px] text-sand tracking-[2px] uppercase">Admin Portal</span>
        </div>
        <button onClick={onClose} className="md:hidden text-sand hover:text-white text-2xl leading-none" aria-label="Close menu">
          &times;
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-colors ${
                isActive
                  ? "bg-gold text-tobacco"
                  : "text-sand hover:bg-white/[0.07] hover:text-white"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-4 py-4 border-t border-gold/20">
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
