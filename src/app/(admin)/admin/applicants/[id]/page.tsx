import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { ApplicantActions } from "@/components/admin/ApplicantActions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ApplicantDetailPage({ params }: Props) {
  const { id } = await params;

  const fetchApplication = (id: string) =>
    prisma.jobApplication.findUnique({
      where: { id },
      include: { references: true },
    });
  let app: Awaited<ReturnType<typeof fetchApplication>> = null;
  try {
    app = await fetchApplication(id);
  } catch (error) {
    console.error("Failed to fetch application:", error);
  }

  if (!app) notFound();

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-xl p-6 border border-[#ece6d9]">
      <h3 className="font-display text-base mb-4">{title}</h3>
      {children}
    </div>
  );

  const Field = ({ label, value }: { label: string; value: string | null | undefined }) => (
    <div>
      <dt className="text-gray-400 text-[0.72rem] uppercase tracking-wider">{label}</dt>
      <dd className="mt-0.5 text-[0.85rem]">{value || "—"}</dd>
    </div>
  );

  const cleaningTypes = Array.isArray(app.cleaningTypes) ? (app.cleaningTypes as string[]) : [];
  const languages = Array.isArray(app.languages) ? (app.languages as string[]) : [];
  const availableDays = Array.isArray(app.availableDays) ? (app.availableDays as string[]) : [];
  const availableHours = Array.isArray(app.availableHours) ? (app.availableHours as string[]) : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl">{app.firstName} {app.lastName}</h2>
        <span className="text-[0.72rem] uppercase tracking-wider text-gray-400">
          Applied {formatDate(app.createdAt)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Section title="Personal Information">
            <dl className="grid grid-cols-2 gap-4">
              <Field label="Full Name" value={`${app.firstName} ${app.middleName || ""} ${app.lastName}`.trim()} />
              <Field label="Email" value={app.email} />
              <Field label="Phone" value={app.phone} />
              <Field label="Address" value={`${app.street}, ${app.city}, ${app.state} ${app.zip}`} />
            </dl>
          </Section>

          <Section title="Employment Eligibility">
            <dl className="grid grid-cols-2 gap-4">
              <Field label="Authorized to Work" value={app.authorizedToWork ? "Yes" : "No"} />
              <Field label="Requires Sponsorship" value={app.requiresSponsorship ? "Yes" : "No"} />
              <Field label="Felony Conviction" value={app.felonyConviction ? "Yes" : "No"} />
              {app.felonyConviction && <Field label="Explanation" value={app.felonyExplanation} />}
              <Field label="Driver's License" value={app.hasDriversLicense ? "Yes" : "No"} />
              <Field label="Transportation" value={app.hasTransportation ? "Yes" : "No"} />
            </dl>
          </Section>

          <Section title="Experience & Skills">
            <dl className="grid grid-cols-2 gap-4">
              <Field label="Years Experience" value={app.yearsExperience} />
              <Field label="Eco-Friendly Experience" value={app.ecoExperience ? "Yes" : "No"} />
              <Field label="Cleaning Types" value={cleaningTypes.join(", ") || "None selected"} />
              <Field label="Languages" value={languages.join(", ") || "—"} />
              <Field label="Special Skills" value={app.specialSkills} />
            </dl>
          </Section>

          <Section title="Availability">
            <dl className="grid grid-cols-2 gap-4">
              <Field label="Employment Type" value={app.employmentType} />
              <Field label="Desired Rate" value={app.desiredRate} />
              <Field label="Available Days" value={availableDays.join(", ") || "—"} />
              <Field label="Available Hours" value={availableHours.join(", ") || "—"} />
            </dl>
          </Section>

          <Section title="References">
            {app.references.length === 0 ? (
              <p className="text-gray-400 text-[0.85rem]">No references provided.</p>
            ) : (
              <div className="space-y-3">
                {app.references.map((ref) => (
                  <div key={ref.id} className="border border-gray-100 rounded-lg p-3">
                    <div className="font-medium text-[0.85rem]">{ref.name}</div>
                    <div className="text-gray-400 text-[0.78rem]">
                      {ref.phone} &middot; {ref.relationship}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Agreements">
            <dl className="space-y-2">
              <Field label="Electronic Signature" value={app.electronicSignature} />
              <Field label="Background Check Consent" value={app.consentBackgroundCheck ? "Agreed" : "Not agreed"} />
              <Field label="Drug Screen Consent" value={app.consentDrugScreen ? "Agreed" : "Not agreed"} />
            </dl>
          </Section>
        </div>

        <div>
          <ApplicantActions applicationId={app.id} currentStatus={app.status} reviewNotes={app.reviewNotes || ""} />
        </div>
      </div>
    </div>
  );
}
