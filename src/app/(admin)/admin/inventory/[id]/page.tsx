import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function InventoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const fetchItem = (id: string) =>
    prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        transactions: {
          include: { loggedBy: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });
  let item: Awaited<ReturnType<typeof fetchItem>> = null;
  try {
    item = await fetchItem(id);
  } catch (error) {
    console.error("Failed to fetch inventory item:", error);
  }

  if (!item) notFound();

  const isLow = item.currentStock <= item.minStock;

  const typeColors: Record<string, string> = {
    PURCHASE: "bg-green/10 text-green",
    USAGE: "bg-amber/10 text-amber",
    ADJUSTMENT: "bg-teal/10 text-teal",
    DAMAGED: "bg-red/10 text-red",
  };

  return (
    <div>
      <Link href="/admin/inventory" className="text-teal text-sm hover:underline mb-4 inline-block">
        &larr; Back to Inventory
      </Link>

      {/* Item Header */}
      <div className="bg-white rounded-xl border border-[#ece6d9] p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl">{item.name}</h2>
            <p className="text-gray-400 text-sm mt-1">
              {item.sku && <span className="font-mono">{item.sku} &middot; </span>}
              {item.category || "Uncategorized"} &middot; {item.supplier || "No supplier"}
            </p>
          </div>
          <span
            className={`text-[0.7rem] uppercase tracking-wider px-3 py-1 rounded-full font-medium ${
              isLow ? "bg-red/10 text-red" : "bg-green/10 text-green"
            }`}
          >
            {isLow ? "Low Stock" : "In Stock"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
          <div className="text-center bg-ivory/50 rounded-lg p-3">
            <div className={`text-2xl font-bold ${isLow ? "text-red" : "text-tobacco"}`}>{item.currentStock}</div>
            <div className="text-[0.72rem] text-gray-400 uppercase">{item.unit} in stock</div>
          </div>
          <div className="text-center bg-ivory/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-tobacco">{item.minStock}</div>
            <div className="text-[0.72rem] text-gray-400 uppercase">Min Level</div>
          </div>
          <div className="text-center bg-ivory/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-tobacco">{formatCurrency(item.costPerUnit)}</div>
            <div className="text-[0.72rem] text-gray-400 uppercase">Cost/Unit</div>
          </div>
          <div className="text-center bg-ivory/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-tobacco">{formatCurrency(item.currentStock * item.costPerUnit)}</div>
            <div className="text-[0.72rem] text-gray-400 uppercase">Total Value</div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <h3 className="font-display text-lg mb-3">Transaction History</h3>
      <div className="bg-white rounded-xl border border-[#ece6d9] overflow-hidden">
        <table className="w-full text-left text-[0.85rem]">
          <thead>
            <tr className="bg-ivory/50 border-b border-[#ece6d9]">
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Date</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Type</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Qty</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Before</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">After</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">By</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {item.transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-gray-50 hover:bg-ivory/30">
                <td className="px-4 py-3 text-gray-500">{formatDate(tx.createdAt)}</td>
                <td className="px-4 py-3">
                  <span className={`text-[0.7rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${typeColors[tx.type] || ""}`}>
                    {tx.type}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">
                  {tx.type === "PURCHASE" ? "+" : tx.type === "ADJUSTMENT" ? "=" : "−"}{tx.quantity}
                </td>
                <td className="px-4 py-3 text-gray-400">{tx.previousStock}</td>
                <td className="px-4 py-3 font-medium">{tx.newStock}</td>
                <td className="px-4 py-3 text-gray-500">{tx.loggedBy.name}</td>
                <td className="px-4 py-3 text-gray-400 text-[0.78rem]">{tx.notes || "—"}</td>
              </tr>
            ))}
            {item.transactions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  No transactions recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
