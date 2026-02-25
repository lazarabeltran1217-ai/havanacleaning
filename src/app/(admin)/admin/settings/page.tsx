import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const settings = await prisma.setting.findMany({
    orderBy: { key: "asc" },
  });

  const settingsMap: Record<string, string> = {};
  for (const s of settings) {
    settingsMap[s.key] = typeof s.value === "string" ? s.value : JSON.stringify(s.value);
  }

  return (
    <div>
      <h2 className="font-display text-xl mb-6">Business Settings</h2>
      <SettingsForm initialSettings={settingsMap} />
    </div>
  );
}
