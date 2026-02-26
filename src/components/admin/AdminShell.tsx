"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 min-h-screen bg-ivory md:ml-60">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-[#e5e0d5] px-4 md:px-8 h-14 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-[5px]"
            aria-label="Open menu"
          >
            <span className="block w-5 h-[2px] bg-tobacco" />
            <span className="block w-5 h-[2px] bg-tobacco" />
            <span className="block w-5 h-[2px] bg-tobacco" />
          </button>
          <h1 className="font-display text-lg md:text-xl text-tobacco">Dashboard</h1>
        </div>

        <div className="p-4 md:p-7">{children}</div>
      </main>
    </div>
  );
}
