import { prisma } from "@/lib/prisma";
import { AddApplicationButton } from "@/components/admin/AddApplicationButton";
import { ApplicantsTable } from "@/components/admin/ApplicantsTable";

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

  const totalApps = applications.length;
  const newCount = applications.filter((a) => a.status === "NEW").length;
  const inPipeline = applications.filter((a) =>
    ["UNDER_REVIEW", "PHONE_SCREEN", "INTERVIEW", "BACKGROUND_CHECK"].includes(a.status)
  ).length;
  const hiredCount = applications.filter((a) => a.status === "HIRED").length;

  const serialized = applications.map((app) => ({
    id: app.id,
    firstName: app.firstName,
    lastName: app.lastName,
    email: app.email,
    phone: app.phone,
    yearsExperience: app.yearsExperience,
    employmentType: app.employmentType,
    status: app.status,
    createdAt: app.createdAt.toISOString(),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl">Job Applications</h2>
        <AddApplicationButton />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Total Applications</div>
          <div className="text-2xl font-display text-tobacco">{totalApps}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">New</div>
          <div className="text-2xl font-display text-amber">{newCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">In Pipeline</div>
          <div className="text-2xl font-display text-teal">{inPipeline}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Hired</div>
          <div className="text-2xl font-display text-green">{hiredCount}</div>
        </div>
      </div>

      <ApplicantsTable applications={serialized} />
    </div>
  );
}
