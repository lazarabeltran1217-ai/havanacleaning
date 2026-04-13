"use client";

import Link from "next/link";
import { Zap, CheckCircle, Clock } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useAdminTable, TableSearch, SortHeader, PlainHeader } from "./AdminTable";

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

const rowColors: Record<string, string> = {
  PENDING: "bg-yellow-50",
  CONFIRMED: "bg-blue-50",
  IN_PROGRESS: "bg-teal-50",
  COMPLETED: "bg-green-50",
  CANCELLED: "bg-red-50",
  NO_SHOW: "bg-gray-50",
};

type HandymanInquiry = {
  id: string;
  bookingNumber: string;
  status: string;
  rush: boolean;
  preferredDate: string | null;
  preferredTime: string | null;
  address: string;
  projectDescription: string | null;
  quotedPrice: number | null;
  estimatedTotal: number | null;
  serviceCategories: string[];
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  isPaid: boolean;
  isClockedIn?: boolean;
  price: number | null;
};

export function HandymanTable({ inquiries }: { inquiries: HandymanInquiry[] }) {
  const { search, setSearch, filteredData, sortKey, sortDir, requestSort } =
    useAdminTable(inquiries, {
      searchKeys: ["bookingNumber", "customerName", "customerEmail", "status", "address"],
      defaultSortKey: "preferredDate",
      defaultSortDir: "desc",
    });

  return (
    <>
      <TableSearch
        value={search}
        onChange={setSearch}
        placeholder="Search handyman bookings..."
        resultCount={filteredData.length}
        totalCount={inquiries.length}
      />

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {filteredData.map((inq) => (
          <div key={inq.id} className={`rounded-xl border border-[#ece6d9] p-4 ${rowColors[inq.status] || "bg-white"}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[0.8rem] tracking-wide font-medium">{inq.bookingNumber}</span>
              <div className="flex items-center gap-1.5">
                {inq.isClockedIn && (
                  <span className="inline-flex items-center gap-0.5 text-[0.68rem] text-teal font-medium">
                    <Clock className="w-3 h-3" /> Clocked In
                  </span>
                )}
                {inq.isPaid && (
                  <span className="text-[0.68rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium bg-green/10 text-green flex items-center gap-0.5">
                    <CheckCircle className="w-3 h-3" /> Paid
                  </span>
                )}
                <span className="text-[0.68rem] uppercase tracking-wider font-medium text-tobacco/70">
                  {inq.status.replace("_", " ")}
                </span>
                {inq.rush && (
                  <span className="text-[0.68rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium bg-amber/15 text-amber flex items-center gap-0.5">
                    <Zap className="w-3 h-3" /> Rush
                  </span>
                )}
              </div>
            </div>
            <div className="text-[0.88rem] font-medium mb-1">{inq.customerName}</div>
            <div className="text-gray-400 text-[0.75rem] mb-2">{inq.customerEmail}</div>
            <div className="flex flex-wrap gap-1 mb-3">
              {inq.serviceCategories.map((cat) => (
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
              {inq.price != null && (
                <div className="flex justify-between">
                  <span className="text-sand">Price</span>
                  <span className="text-green font-semibold">
                    {formatCurrency(inq.price)}
                    {inq.quotedPrice && <span className="text-gray-400 text-[0.68rem] ml-1">(adjusted)</span>}
                  </span>
                </div>
              )}
              {inq.projectDescription && (
                <div className="pt-2 border-t border-gray-100 text-[0.78rem] text-tobacco/60 truncate">
                  {inq.projectDescription}
                </div>
              )}
            </div>
            <Link href={`/admin/handyman/${inq.id}`} prefetch={false} className="mt-3 block text-center text-[0.82rem] font-medium text-green hover:text-green/80 transition-colors">
              View Details
            </Link>
          </div>
        ))}
        {filteredData.length === 0 && (
          <div className="bg-white rounded-xl border border-[#ece6d9] px-4 py-12 text-center text-gray-400">
            {search ? "No bookings match your search." : "No handyman inquiries yet."}
          </div>
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block bg-white rounded-xl border border-[#ece6d9] overflow-hidden">
        <table className="w-full text-left text-[0.85rem]">
          <thead>
            <tr className="bg-ivory/50 border-b border-[#ece6d9]">
              <SortHeader label="Booking #" sortKey="bookingNumber" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Customer" sortKey="customerName" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <PlainHeader label="Services" />
              <SortHeader label="Date" sortKey="preferredDate" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Status" sortKey="status" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Price" sortKey="price" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <PlainHeader label="Paid" />
              <PlainHeader label="Rush" />
              <PlainHeader />
            </tr>
          </thead>
          <tbody>
            {filteredData.map((inq) => (
              <tr key={inq.id} className={`border-b border-gray-50 ${rowColors[inq.status] || ""} hover:brightness-95`}>
                <td className="px-4 py-3 text-[0.8rem] tracking-wide">{inq.bookingNumber}</td>
                <td className="px-4 py-3">
                  <div>{inq.customerName}</div>
                  <div className="text-gray-400 text-[0.75rem]">{inq.customerEmail}</div>
                  {inq.customerPhone && <div className="text-gray-400 text-[0.72rem]">{inq.customerPhone}</div>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {inq.serviceCategories.map((cat) => (
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
                <td className="px-4 py-3 text-[0.82rem]">
                  <div className="capitalize">{inq.status.replace(/_/g, " ").toLowerCase()}</div>
                  {inq.isClockedIn && (
                    <span className="inline-flex items-center gap-0.5 text-[0.68rem] text-teal font-medium mt-0.5">
                      <Clock className="w-3 h-3" /> Clocked In
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {inq.price != null ? (
                    <span className="text-green font-semibold text-[0.82rem]">
                      {formatCurrency(inq.price)}
                      {inq.quotedPrice && <span className="text-[0.68rem] text-gray-400 block">adjusted</span>}
                    </span>
                  ) : (
                    <span className="text-gray-300">{"\u2014"}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {inq.isPaid ? (
                    <span className="text-green flex items-center gap-0.5 text-[0.78rem] font-medium">
                      <CheckCircle className="w-3.5 h-3.5" /> Paid
                    </span>
                  ) : (
                    <span className="text-gray-300 text-[0.78rem]">Unpaid</span>
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
                <td className="px-4 py-3">
                  <Link href={`/admin/handyman/${inq.id}`} prefetch={false} className="text-green hover:text-green/80 text-[0.82rem] font-medium transition-colors">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                  {search ? "No bookings match your search." : "No handyman inquiries yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
