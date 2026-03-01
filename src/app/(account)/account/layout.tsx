"use client";

import { usePathname } from "next/navigation";
import { AccountToolbar } from "@/components/website/AccountToolbar";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Payment pages get a minimal wrapper
  if (pathname.includes("/pay")) {
    return (
      <div className="bg-ivory min-h-screen pt-28 pb-16 px-6 md:px-20">
        <div className="max-w-5xl mx-auto">{children}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tobacco">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 bg-tobacco/[0.97] backdrop-blur-sm border-b-2 border-gold px-5 py-3 flex items-center justify-between md:hidden">
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
        <div className="sticky top-0 z-40 bg-tobacco/[0.97] backdrop-blur-sm border-b-2 border-gold px-8 h-14 flex items-center justify-between">
          <div className="flex items-center">
            <span className="font-display text-2xl font-black text-amber tracking-tight">
              Havana <span className="text-green-light italic">Cleaning</span>
            </span>
            <span className="ml-3 text-sand text-[11px] tracking-[1.5px] uppercase">My Account</span>
          </div>
          <AccountToolbar />
        </div>
      </div>

      {/* Main content */}
      <main className="px-4 md:px-8 py-5">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
