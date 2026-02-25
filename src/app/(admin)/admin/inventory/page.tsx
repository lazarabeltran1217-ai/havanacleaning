import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export default async function AdminInventoryPage() {
  const items = await prisma.inventoryItem.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <h2 className="font-display text-xl mb-6">Inventory</h2>

      <div className="bg-white rounded-xl border border-[#ece6d9] overflow-hidden">
        <table className="w-full text-left text-[0.85rem]">
          <thead>
            <tr className="bg-ivory/50 border-b border-[#ece6d9]">
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Item</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">SKU</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Category</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Stock</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Min</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Cost/Unit</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Supplier</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isLow = item.currentStock <= item.minStock;
              return (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-ivory/30">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 font-mono text-[0.78rem] text-gray-400">{item.sku || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{item.category || "—"}</td>
                  <td className={`px-4 py-3 font-medium ${isLow ? "text-red" : ""}`}>{item.currentStock} {item.unit}</td>
                  <td className="px-4 py-3 text-gray-400">{item.minStock}</td>
                  <td className="px-4 py-3">{formatCurrency(item.costPerUnit)}</td>
                  <td className="px-4 py-3 text-gray-500">{item.supplier || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[0.7rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${
                      isLow ? "bg-red/10 text-red" : "bg-green/10 text-green"
                    }`}>
                      {isLow ? "Low Stock" : "OK"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
