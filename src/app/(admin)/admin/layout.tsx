import { Sidebar } from "@/components/admin/Sidebar";

export const metadata = {
  title: "Admin Dashboard",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-60 flex-1 min-h-screen bg-ivory">
        <div className="sticky top-0 z-40 bg-white border-b border-[#e5e0d5] px-8 h-14 flex items-center">
          <h1 className="font-display text-xl text-tobacco">Dashboard</h1>
        </div>
        <div className="p-7">{children}</div>
      </main>
    </div>
  );
}
