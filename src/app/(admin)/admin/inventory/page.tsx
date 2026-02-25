import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { InventoryActions } from "@/components/admin/InventoryActions";
import { InventoryEditButton } from "@/components/admin/InventoryEditButton";

export default async function AdminInventoryPage() {
  const items = await prisma.inventoryItem.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const lowStockCount = items.filter((i) => i.currentStock <= i.minStock).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl">Inventory</h2>
          {lowStockCount > 0 && (
            <p className="text-red text-sm mt-1">
              {lowStockCount} item{lowStockCount > 1 ? "s" : ""} below minimum stock
            </p>
          )}
        </div>
        <InventoryActions items={items.map((i) => ({ id: i.id, name: i.name }))} />
      </div>

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
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium"></th>
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
                  <td className={`px-4 py-3 font-medium ${isLow ? "text-red" : ""}`}>
                    {item.currentStock} {item.unit}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{item.minStock}</td>
                  <td className="px-4 py-3">{formatCurrency(item.costPerUnit)}</td>
                  <td className="px-4 py-3 text-gray-500">{item.supplier || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[0.7rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${
                        isLow ? "bg-red/10 text-red" : "bg-green/10 text-green"
                      }`}
                    >
                      {isLow ? "Low Stock" : "OK"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <InventoryEditButton item={{
                        id: item.id,
                        name: item.name,
                        sku: item.sku,
                        category: item.category,
                        unit: item.unit,
                        minStock: item.minStock,
                        costPerUnit: item.costPerUnit,
                        supplier: item.supplier,
                      }} />
                      <Link
                        href={`/admin/inventory/${item.id}`}
                        className="text-teal text-[0.78rem] font-medium hover:underline"
                      >
                        History
                      </Link>
                    </div>
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
