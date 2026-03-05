import { prisma } from "@/lib/prisma";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Zap } from "lucide-react";
import Link from "next/link";

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
  PENDING: "bg-amber/10 text-amber",
  CONFIRMED: "bg-gold/10 text-gold",
  IN_PROGRESS: "bg-teal/10 text-teal",
  COMPLETED: "bg-green/20 text-green",
  CANCELLED: "bg-red/10 text-red",
  NO_SHOW: "bg-gray-100 text-gray-400",
};

export default async function AdminHandymanPage() {
  const fetchInquiries = () =>
    prisma.handymanInquiry.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

  let inquiries: Awaited<ReturnType<typeof fetchInquiries>> = [];
  try {
    inquiries = await fetchInquiries();
  } catch (error) {
    console.error("Failed to fetch handyman inquiries:", error);
  }

  const total = inquiries.length;
  const pendingCount = inquiries.filter((i) => i.status === "PENDING").length;
  const confirmedCount = inquiries.filter((i) => i.status === "CONFIRMED").length;
  const rushCount = inquiries.filter((i) => i.rush).length;

  return (
    <div>
      <h2 className="font-display text-xl mb-6">Handyman Bookings</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Total Inquiries</div>
          <div className="text-2xl font-display text-tobacco">{total}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Pending</div>
          <div className="text-2xl font-display text-amber">{pendingCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Confirmed</div>
          <div className="text-2xl font-display text-green">{confirmedCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Rush</div>
          <div className="text-2xl font-display text-amber flex items-center gap-1">
            <Zap className="w-5 h-5" /> {rushCount}
          </div>
        </div>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {inquiries.map((inq) => {
          const cats = (Array.isArray(inq.serviceCategories) ? inq.serviceCategories : []) as string[];
          return (
            <div key={inq.id} className="bg-white rounded-xl border border-[#ece6d9] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[0.68rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${statusColors[inq.status] || ""}`}>
                  {inq.status.replace("_", " ")}
                </span>
                {inq.rush && (
                  <span className="text-[0.68rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium bg-amber/15 text-amber flex items-center gap-0.5">
                    <Zap className="w-3 h-3" /> Rush
                  </span>
                )}
              </div>
              <div className="text-[0.88rem] font-medium mb-1">{inq.user?.name || inq.fullName}</div>
              <div className="text-gray-400 text-[0.75rem] mb-2">{inq.user?.email || inq.email}</div>

              {/* Service tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {cats.map((cat) => (
                  <span key={cat} className="text-[0.68rem] bg-ivory border border-[#ece6d9] px-2 py-0.5 rounded-full text-tobacco/70">
                    {SERVICE_LABELS[cat] || cat}
                  </span>
                ))}
              </div>

              <div className="space-y-2 text-[0.82rem]">
                {inq.preferredDate && (
                  <div className="flex justify-between">
                    <span className="text-sand">Date</span>
                    <span className="text-right">
                      <div>{formatDate(inq.preferredDate)}</div>
                      {inq.preferredTime && <div className="text-gray-400 text-[0.75rem] capitalize">{inq.preferredTime}</div>}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sand">Address</span>
                  <span className="text-right text-[0.78rem] max-w-[60%] truncate">{inq.address}</span>
                </div>
                {(inq.quotedPrice ?? inq.estimatedTotal) ? (
                  <div className="flex justify-between">
                    <span className="text-sand">Price</span>
                    <span className="text-green font-semibold">
                      {formatCurrency(inq.quotedPrice ?? inq.estimatedTotal!)}
                      {inq.quotedPrice && <span className="text-gray-400 text-[0.68rem] ml-1">(adjusted)</span>}
                    </span>
                  </div>
                ) : null}
                {inq.projectDescription && (
                  <div className="pt-2 border-t border-gray-100 text-[0.78rem] text-tobacco/60 truncate">
                    {inq.projectDescription}
                  </div>
                )}
              </div>
              <Link href={`/admin/handyman/${inq.id}`} prefetch={false} className="mt-3 block text-center text-[0.82rem] font-medium text-green hover:text-green/80 transition-colors">
                View Details &rarr;
              </Link>
            </div>
          );
        })}
        {inquiries.length === 0 && (
          <div className="bg-white rounded-xl border border-[#ece6d9] px-4 py-12 text-center text-gray-400">
            No handyman inquiries yet.
          </div>
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block bg-white rounded-xl border border-[#ece6d9] overflow-hidden">
        <table className="w-full text-left text-[0.85rem]">
          <thead>
            <tr className="bg-ivory/50 border-b border-[#ece6d9]">
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Customer</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Services</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Date</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Status</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Price</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Rush</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Address</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inq) => {
              const cats = (Array.isArray(inq.serviceCategories) ? inq.serviceCategories : []) as string[];
              return (
                <tr key={inq.id} className="border-b border-gray-50 hover:bg-ivory/30">
                  <td className="px-4 py-3">
                    <div>{inq.user?.name || inq.fullName}</div>
                    <div className="text-gray-400 text-[0.75rem]">{inq.user?.email || inq.email}</div>
                    {(inq.user?.phone || inq.phone) && (
                      <div className="text-gray-400 text-[0.72rem]">{inq.user?.phone || inq.phone}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {cats.map((cat) => (
                        <span key={cat} className="text-[0.68rem] bg-ivory border border-[#ece6d9] px-2 py-0.5 rounded-full text-tobacco/70">
                          {SERVICE_LABELS[cat] || cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {inq.preferredDate ? (
                      <>
                        <div>{formatDate(inq.preferredDate)}</div>
                        {inq.preferredTime && <div className="text-gray-400 text-[0.75rem] capitalize">{inq.preferredTime}</div>}
                      </>
                    ) : (
                      <span className="text-gray-300">Not set</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[0.7rem] uppercase tracking-wider px-2.5 py-1 rounded-full font-medium ${statusColors[inq.status] || ""}`}>
                      {inq.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {(inq.quotedPrice ?? inq.estimatedTotal) ? (
                      <span className="text-green font-semibold text-[0.82rem]">
                        {formatCurrency(inq.quotedPrice ?? inq.estimatedTotal!)}
                        {inq.quotedPrice && <span className="text-[0.68rem] text-gray-400 block">adjusted</span>}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {inq.rush ? (
                      <span className="text-amber flex items-center gap-0.5 text-[0.82rem] font-medium">
                        <Zap className="w-3.5 h-3.5" /> Yes
                      </span>
                    ) : (
                      <span className="text-gray-300">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[0.82rem] max-w-[200px] truncate">{inq.address}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/handyman/${inq.id}`} prefetch={false} className="text-green hover:text-green/80 text-[0.82rem] font-medium transition-colors">
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
            {inquiries.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  No handyman inquiries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
