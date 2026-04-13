import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDate, formatCurrency } from "@/lib/utils";
import { HandymanActions } from "@/components/admin/HandymanActions";
import Link from "next/link";
import { Zap } from "lucide-react";

const SERVICE_LABELS: Record<string, string> = {
  minorRepairs: "Minor Repairs",
  furnitureAssembly: "Furniture Assembly",
  tvShelfMounting: "TV & Shelf Mounting",
  doorWindowFixes: "Door & Window Fixes",
  lightFixtureInstall: "Light Fixture Install",
  groutTileRepair: "Grout & Tile Repair",
  paintingTouchUps: "Painting Touch-Ups",
  gutterCleaning: "Gutter Cleaning",
  pressureWashing: "Pressure Washing",
  smartHomeSetup: "Smart Home Setup",
  deckFenceRepair: "Deck & Fence Repair",
  closetShelving: "Closet & Storage Shelving",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-teal/10 text-teal",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  NO_SHOW: "bg-gray-100 text-gray-500",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminHandymanDetailPage({ params }: Props) {
  const { id } = await params;

  const fetchInquiry = (id: string) =>
    prisma.handymanInquiry.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

  const fetchEmployees = () =>
    prisma.user.findMany({
      where: { role: "EMPLOYEE", isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

  let inquiry: Awaited<ReturnType<typeof fetchInquiry>> = null;
  let employees: Awaited<ReturnType<typeof fetchEmployees>> = [];
  try {
    inquiry = await fetchInquiry(id);
    if (!inquiry) notFound();
    employees = await fetchEmployees();
  } catch (error) {
    console.error("Failed to fetch handyman inquiry:", error);
    notFound();
  }

  // Resolve assigned employee names from IDs stored in JSON
  const assignedIds = (Array.isArray(inquiry.assignedEmployees) ? inquiry.assignedEmployees : []) as string[];
  const assignments = assignedIds
    .map((eid) => {
      const emp = employees.find((e) => e.id === eid);
      return emp ? { employeeId: emp.id, employeeName: emp.name } : null;
    })
    .filter(Boolean) as { employeeId: string; employeeName: string }[];

  const cats = (Array.isArray(inquiry.serviceCategories) ? inquiry.serviceCategories : []) as string[];

  return (
    <div>
      <Link href="/admin/handyman" className="inline-flex items-center gap-1.5 text-[0.82rem] text-gray-400 hover:text-green mb-4 transition-colors">
        <span>&larr;</span> Back to Handyman
      </Link>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl">Handyman Inquiry</h2>
          <div className="text-[0.82rem] text-gray-400 tracking-wide">{inquiry.bookingNumber}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-block text-[0.72rem] uppercase tracking-wider px-3 py-1 rounded-full font-medium ${statusColors[inquiry.status] || ""}`}>
              {inquiry.status.replace("_", " ")}
            </span>
            {inquiry.rush && (
              <span className="inline-flex items-center gap-0.5 text-[0.72rem] uppercase tracking-wider px-3 py-1 rounded-full font-medium bg-amber/15 text-amber">
                <Zap className="w-3 h-3" /> Rush
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* DETAILS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 border border-[#ece6d9]">
            <h3 className="font-display text-base mb-4">Inquiry Details</h3>
            <dl className="grid grid-cols-2 gap-4 text-[0.85rem]">
              <div>
                <dt className="text-gray-400 text-[0.75rem] uppercase tracking-wider">Services</dt>
                <dd className="mt-1 flex flex-wrap gap-1">
                  {cats.map((cat) => (
                    <span key={cat} className="text-[0.75rem] bg-ivory border border-[#ece6d9] px-2 py-0.5 rounded-full">
                      {SERVICE_LABELS[cat] || cat}
                    </span>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-gray-400 text-[0.75rem] uppercase tracking-wider">Date / Time</dt>
                <dd className="mt-1">
                  {inquiry.preferredDate ? formatDate(inquiry.preferredDate) : "Not set"}
                  {inquiry.preferredTime && <> &middot; <span className="capitalize">{inquiry.preferredTime}</span></>}
                </dd>
              </div>
              {inquiry.borough && (
                <div>
                  <dt className="text-gray-400 text-[0.75rem] uppercase tracking-wider">Borough</dt>
                  <dd className="mt-1">{inquiry.borough}</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-400 text-[0.75rem] uppercase tracking-wider">Submitted</dt>
                <dd className="mt-1">{formatDate(inquiry.createdAt)}</dd>
              </div>
              {inquiry.estimatedTotal && (
                <div>
                  <dt className="text-gray-400 text-[0.75rem] uppercase tracking-wider">Customer Estimate</dt>
                  <dd className="mt-1 text-green font-semibold">{formatCurrency(inquiry.estimatedTotal)}</dd>
                </div>
              )}
              {inquiry.quotedPrice && (
                <div>
                  <dt className="text-gray-400 text-[0.75rem] uppercase tracking-wider">Adjusted Price</dt>
                  <dd className="mt-1 text-amber font-semibold">{formatCurrency(inquiry.quotedPrice)}</dd>
                </div>
              )}
            </dl>
            {inquiry.projectDescription && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <dt className="text-gray-400 text-[0.75rem] uppercase tracking-wider mb-1">Project Description</dt>
                <dd className="text-[0.85rem]">{inquiry.projectDescription}</dd>
              </div>
            )}
          </div>

          {/* CUSTOMER */}
          <div className="bg-white rounded-xl p-6 border border-[#ece6d9]">
            <h3 className="font-display text-base mb-3">Customer</h3>
            <div className="text-[0.9rem] font-medium">{inquiry.user?.name || inquiry.fullName}</div>
            <div className="text-gray-400 text-[0.82rem]">{inquiry.user?.email || inquiry.email}</div>
            {(inquiry.user?.phone || inquiry.phone) && (
              <div className="text-gray-400 text-[0.82rem]">{inquiry.user?.phone || inquiry.phone}</div>
            )}
            <div className="mt-3 pt-3 border-t border-gray-100 text-[0.85rem]">
              {inquiry.address}
            </div>
          </div>
        </div>

        {/* SIDEBAR ACTIONS */}
        <div>
          <HandymanActions
            inquiryId={inquiry.id}
            currentStatus={inquiry.status}
            currentNotes={inquiry.notes || ""}
            currentQuotedPrice={inquiry.quotedPrice}
            assignments={assignments}
            employees={employees}
            adminReply={inquiry.adminReply}
            adminRepliedAt={inquiry.adminRepliedAt?.toISOString()}
            customerCanEdit={inquiry.customerCanEdit}
            customerReply={inquiry.customerReply}
            customerRepliedAt={inquiry.customerRepliedAt?.toISOString()}
          />
        </div>
      </div>
    </div>
  );
}
