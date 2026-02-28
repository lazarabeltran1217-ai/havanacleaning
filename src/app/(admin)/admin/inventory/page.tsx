import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { InventoryActions } from "@/components/admin/InventoryActions";
import { InventoryEditButton } from "@/components/admin/InventoryEditButton";

export default async function AdminInventoryPage() {
  const fetchItems = () =>
    prisma.inventoryItem.findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
      include: {
        assignedTo: { select: { id: true, name: true } },
        checkouts: {
          where: { returnedAt: null },
          select: {
            id: true,
            quantity: true,
            returnedQty: true,
            employee: { select: { name: true } },
          },
        },
      },
    });
  let items: Awaited<ReturnType<typeof fetchItems>> = [];
  try {
    items = await fetchItems();
  } catch (error) {
    console.error("Failed to fetch inventory:", error);
  }

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

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {items.map((item) => {
          const isLow = item.currentStock <= item.minStock;
          const activeCheckouts = item.checkouts;
          const totalCheckedOut = activeCheckouts.reduce((sum, c) => sum + (c.quantity - c.returnedQty), 0);
          return (
            <div key={item.id} className="bg-white rounded-xl border border-[#ece6d9] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">{item.name}</span>
                <span className={`text-[0.68rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${isLow ? "bg-red/10 text-red" : "bg-green/10 text-green"}`}>
                  {isLow ? "Low Stock" : "OK"}
                </span>
              </div>
              <div className="space-y-2 text-[0.82rem]">
                {item.sku && (
                  <div className="flex justify-between">
                    <span className="text-sand">SKU</span>
                    <span className="font-mono text-[0.78rem] text-gray-400">{item.sku}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sand">Category</span>
                  <span className="text-gray-500">{item.category || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sand">Stock</span>
                  <span className={`font-medium ${isLow ? "text-red" : ""}`}>{item.currentStock} {item.unit}</span>
                </div>
                {totalCheckedOut > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sand">Checked Out</span>
                    <span className="font-medium text-tobacco">{totalCheckedOut} {item.unit}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sand">Min Stock</span>
                  <span className="text-gray-400">{item.minStock}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sand">Cost/Unit</span>
                  <span>{formatCurrency(item.costPerUnit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sand">Supplier</span>
                  <span className="text-gray-500">{item.supplier || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sand">Assigned</span>
                  <span>
                    {item.assignedTo ? (
                      <span className="text-[0.78rem] font-medium text-teal">{item.assignedTo.name}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </span>
                </div>
                {activeCheckouts.length > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-sand text-[0.75rem]">With Employees:</span>
                    <div className="mt-1 space-y-1">
                      {activeCheckouts.map((c) => (
                        <div key={c.id} className="flex justify-between text-[0.78rem]">
                          <span className="text-teal font-medium">{c.employee.name}</span>
                          <span className="text-gray-500">{c.quantity - c.returnedQty} {item.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-3">
                  <InventoryEditButton item={{
                    id: item.id,
                    name: item.name,
                    sku: item.sku,
                    category: item.category,
                    unit: item.unit,
                    minStock: item.minStock,
                    costPerUnit: item.costPerUnit,
                    supplier: item.supplier,
                    assignedToId: item.assignedToId,
                  }} />
                  <Link href={`/admin/inventory/${item.id}`} className="text-teal text-[0.78rem] font-medium hover:underline">
                    History
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="bg-white rounded-xl border border-[#ece6d9] px-4 py-12 text-center text-gray-400">No inventory items.</div>
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block bg-white rounded-xl border border-[#ece6d9] overflow-hidden">
        <table className="w-full text-left text-[0.85rem]">
          <thead>
            <tr className="bg-ivory/50 border-b border-[#ece6d9]">
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Item</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">SKU</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Category</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Stock</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Checked Out</th>
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
              const activeCheckouts = item.checkouts;
              const totalCheckedOut = activeCheckouts.reduce((sum, c) => sum + (c.quantity - c.returnedQty), 0);
              return (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-ivory/30">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 font-mono text-[0.78rem] text-gray-400">{item.sku || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{item.category || "—"}</td>
                  <td className={`px-4 py-3 font-medium ${isLow ? "text-red" : ""}`}>
                    {item.currentStock} {item.unit}
                  </td>
                  <td className="px-4 py-3">
                    {totalCheckedOut > 0 ? (
                      <div className="group relative">
                        <span className="font-medium text-tobacco">{totalCheckedOut} {item.unit}</span>
                        <div className="absolute left-0 top-full mt-1 bg-tobacco text-white text-[0.72rem] rounded-lg p-3 hidden group-hover:block z-10 min-w-[160px] shadow-lg">
                          {activeCheckouts.map((c) => (
                            <div key={c.id} className="flex justify-between gap-4 py-0.5">
                              <span>{c.employee.name}</span>
                              <span className="text-gold">{c.quantity - c.returnedQty} {item.unit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
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
                        assignedToId: item.assignedToId,
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
