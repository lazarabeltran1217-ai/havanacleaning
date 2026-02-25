import { BottomNav } from "@/components/employee/BottomNav";

export const metadata = {
  title: "Employee Portal",
};

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ivory max-w-lg mx-auto relative">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-tobacco px-5 py-4 flex items-center justify-between">
        <div>
          <div className="font-display text-gold text-lg">Havana Cleaning</div>
          <div className="text-sand text-[11px] tracking-[1.5px] uppercase">Employee Portal</div>
        </div>
        <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center text-tobacco font-bold text-sm">
          H
        </div>
      </header>

      <main className="pb-24 px-4 py-5">{children}</main>

      <BottomNav />
    </div>
  );
}
