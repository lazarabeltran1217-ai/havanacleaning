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
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 bg-tobacco px-5 py-4 flex items-center justify-between md:hidden">
        <div>
          <div className="font-display text-gold text-lg">Havana Cleaning</div>
          <div className="text-sand text-[11px] tracking-[1.5px] uppercase">Employee Portal</div>
        </div>
      </header>

      {/* Desktop top bar */}
      <div className="hidden md:block">
        <div className="sticky top-0 z-40 bg-white border-b border-[#e5e0d5] px-8 h-14 flex items-center">
          <h1 className="font-display text-xl text-tobacco">Havana Cleaning</h1>
          <span className="ml-3 text-sand text-[11px] tracking-[1.5px] uppercase">Employee Portal</span>
        </div>
      </div>

      {/* Main content */}
      <main className="px-4 md:px-8 py-5">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
