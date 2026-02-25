import { BottomNav } from "@/components/employee/BottomNav";
import { PortalSidebar } from "@/components/employee/PortalSidebar";

export const metadata = {
  title: "Employee Portal",
};

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ivory">
      {/* Desktop sidebar */}
      <PortalSidebar />

      {/* Mobile top bar — hidden on desktop */}
      <header className="sticky top-0 z-40 bg-tobacco px-5 py-4 flex items-center justify-between md:hidden">
        <div>
          <div className="font-display text-gold text-lg">Havana Cleaning</div>
          <div className="text-sand text-[11px] tracking-[1.5px] uppercase">Employee Portal</div>
        </div>
        <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center text-tobacco font-bold text-sm">
          H
        </div>
      </header>

      {/* Desktop top bar */}
      <div className="hidden md:block md:ml-56">
        <div className="sticky top-0 z-40 bg-white border-b border-[#e5e0d5] px-8 h-14 flex items-center">
          <h1 className="font-display text-xl text-tobacco">Employee Portal</h1>
        </div>
      </div>

      {/* Main content */}
      <main className="pb-24 md:pb-8 px-4 md:px-8 py-5 md:ml-56">
        <div className="max-w-4xl">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav — hidden on desktop */}
      <BottomNav />
    </div>
  );
}
