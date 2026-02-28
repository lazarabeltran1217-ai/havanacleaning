import { getTranslations } from "next-intl/server";
import PortalToolbar from "./PortalToolbar";

export const metadata = {
  title: "Employee Portal",
};

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("portal");

  return (
    <div className="min-h-screen bg-ivory dark:bg-[#1a1410]">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 bg-tobacco/[0.97] dark:bg-[#1a1410]/[0.97] backdrop-blur-sm border-b-2 border-gold px-5 py-3 flex items-center justify-between md:hidden">
        <div>
          <div className="font-display text-2xl font-black text-amber tracking-tight">
            Havana <span className="text-green-light italic">Cleaning</span>
          </div>
          <div className="text-sand text-[11px] tracking-[1.5px] uppercase">{t("branding")}</div>
        </div>
        <PortalToolbar />
      </header>

      {/* Desktop top bar */}
      <div className="hidden md:block">
        <div className="sticky top-0 z-40 bg-tobacco/[0.97] dark:bg-[#1a1410]/[0.97] backdrop-blur-sm border-b-2 border-gold px-8 h-14 flex items-center justify-between">
          <div className="flex items-center">
            <span className="font-display text-2xl font-black text-amber tracking-tight">
              Havana <span className="text-green-light italic">Cleaning</span>
            </span>
            <span className="ml-3 text-sand text-[11px] tracking-[1.5px] uppercase">{t("branding")}</span>
          </div>
          <PortalToolbar />
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
