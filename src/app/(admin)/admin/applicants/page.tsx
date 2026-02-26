import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { AddApplicationButton } from "@/components/admin/AddApplicationButton";

export default async function AdminApplicantsPage() {
  const fetchApplications = () =>
    prisma.jobApplication.findMany({
      include: { references: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  let applications: Awaited<ReturnType<typeof fetchApplications>> = [];
  try {
    applications = await fetchApplications();
  } catch (error) {
    console.error("Failed to fetch applications:", error);
  }

  const statusColors: Record<string, string> = {
    NEW: "bg-amber/10 text-amber",
    UNDER_REVIEW: "bg-teal/10 text-teal",
    PHONE_SCREEN: "bg-blue-50 text-blue-600",
    INTERVIEW: "bg-green/10 text-green",
    BACKGROUND_CHECK: "bg-purple-50 text-purple-600",
    HIRED: "bg-green/20 text-green",
    REJECTED: "bg-red/10 text-red",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl">Job Applications</h2>
        <AddApplicationButton />
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {applications.map((app) => (
          <div key={app.id} className="bg-white rounded-xl border border-[#ece6d9] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">{app.firstName} {app.lastName}</span>
              <span className={`text-[0.68rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${statusColors[app.status] || ""}`}>
                {app.status.replace(/_/g, " ")}
              </span>
            </div>
            <div className="space-y-2 text-[0.82rem]">
              <div className="flex justify-between">
                <span className="text-sand">Email</span>
                <span className="text-gray-500">{app.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Phone</span>
                <span className="text-gray-400">{app.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Experience</span>
                <span>{app.yearsExperience || "N/A"} yrs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Type</span>
                <span className="text-gray-500">{app.employmentType || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Applied</span>
                <span className="text-gray-500">{formatDate(app.createdAt)}</span>
              </div>
              <div className="pt-2 border-t border-gray-100 flex justify-end">
                <Link href={`/admin/applicants/${app.id}`} className="text-green text-[0.78rem] font-medium hover:underline">Review →</Link>
              </div>
            </div>
          </div>
        ))}
        {applications.length === 0 && (
          <div className="bg-white rounded-xl border border-[#ece6d9] px-4 py-12 text-center text-gray-400">No applications yet.</div>
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block bg-white rounded-xl border border-[#ece6d9] overflow-hidden">
        <table className="w-full text-left text-[0.85rem]">
          <thead>
            <tr className="bg-ivory/50 border-b border-[#ece6d9]">
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Name</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Contact</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Experience</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Type</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Applied</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="border-b border-gray-50 hover:bg-ivory/30">
                <td className="px-4 py-3 font-medium">{app.firstName} {app.lastName}</td>
                <td className="px-4 py-3">
                  <div className="text-gray-500">{app.email}</div>
                  <div className="text-gray-400 text-[0.78rem]">{app.phone}</div>
                </td>
                <td className="px-4 py-3">{app.yearsExperience || "N/A"} yrs</td>
                <td className="px-4 py-3 text-gray-500">{app.employmentType || "—"}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(app.createdAt)}</td>
                <td className="px-4 py-3">
                  <span className={`text-[0.68rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${statusColors[app.status] || ""}`}>
                    {app.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/applicants/${app.id}`} className="text-green text-[0.78rem] hover:underline">Review</Link>
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">No applications yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
