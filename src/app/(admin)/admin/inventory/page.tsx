import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { InventoryActions } from "@/components/admin/InventoryActions";
import { InventoryTable } from "@/components/admin/InventoryTable";

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
  const totalItems = items.length;
  const totalValue = items.reduce((sum, i) => sum + i.currentStock * i.costPerUnit, 0);
  const categories = new Set(items.map((i) => i.category).filter(Boolean)).size;

  const serialized = items.map((item) => ({
    id: item.id,
    name: item.name,
    sku: item.sku,
    category: item.category,
    unit: item.unit,
    currentStock: item.currentStock,
    minStock: item.minStock,
    costPerUnit: item.costPerUnit,
    supplier: item.supplier,
    assignedToId: item.assignedToId,
    assignedToName: item.assignedTo?.name ?? null,
    checkouts: item.checkouts.map((c) => ({
      id: c.id,
      quantity: c.quantity,
      returnedQty: c.returnedQty,
      employeeName: c.employee.name ?? "",
    })),
  }));

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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Total Items</div>
          <div className="text-2xl font-display text-tobacco">{totalItems}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Low Stock</div>
          <div className={`text-2xl font-display ${lowStockCount > 0 ? "text-red" : "text-green"}`}>{lowStockCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Total Value</div>
          <div className="text-2xl font-display text-green">{formatCurrency(totalValue)}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Categories</div>
          <div className="text-2xl font-display text-tobacco">{categories}</div>
        </div>
      </div>

      <InventoryTable items={serialized} />
    </div>
  );
}
