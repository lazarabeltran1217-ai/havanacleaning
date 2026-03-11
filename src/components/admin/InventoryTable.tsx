"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { InventoryEditButton } from "./InventoryEditButton";
import { useAdminTable, TableSearch, SortHeader, PlainHeader } from "./AdminTable";

type Checkout = {
  id: string;
  quantity: number;
  returnedQty: number;
  employeeName: string;
};

type InventoryItem = {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  unit: string;
  currentStock: number;
  minStock: number;
  costPerUnit: number;
  supplier: string | null;
  assignedToId: string | null;
  assignedToName: string | null;
  checkouts: Checkout[];
};

export function InventoryTable({ items }: { items: InventoryItem[] }) {
  const { search, setSearch, filteredData, sortKey, sortDir, requestSort } =
    useAdminTable(items, {
      searchKeys: ["name", "sku", "category", "supplier"],
      defaultSortKey: "name",
      defaultSortDir: "asc",
    });

  return (
    <>
      <TableSearch
        value={search}
        onChange={setSearch}
        placeholder="Search inventory..."
        resultCount={filteredData.length}
        totalCount={items.length}
      />

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {filteredData.map((item) => {
          const isLow = item.currentStock <= item.minStock;
          const totalCheckedOut = item.checkouts.reduce((sum, c) => sum + (c.quantity - c.returnedQty), 0);
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
                  <span className="text-gray-500">{item.category || "\u2014"}</span>
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
                  <span className="text-gray-500">{item.supplier || "\u2014"}</span>
                </div>
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
        {filteredData.length === 0 && (
          <div className="bg-white rounded-xl border border-[#ece6d9] px-4 py-12 text-center text-gray-400">
            {search ? "No items match your search." : "No inventory items."}
          </div>
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block bg-white rounded-xl border border-[#ece6d9] overflow-hidden">
        <table className="w-full text-left text-[0.85rem]">
          <thead>
            <tr className="bg-ivory/50 border-b border-[#ece6d9]">
              <SortHeader label="Item" sortKey="name" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="SKU" sortKey="sku" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Category" sortKey="category" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Stock" sortKey="currentStock" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <PlainHeader label="Checked Out" />
              <SortHeader label="Min" sortKey="minStock" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Cost/Unit" sortKey="costPerUnit" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Supplier" sortKey="supplier" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <PlainHeader label="Status" />
              <PlainHeader />
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => {
              const isLow = item.currentStock <= item.minStock;
              const totalCheckedOut = item.checkouts.reduce((sum, c) => sum + (c.quantity - c.returnedQty), 0);
              return (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-ivory/30">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 font-mono text-[0.78rem] text-gray-400">{item.sku || "\u2014"}</td>
                  <td className="px-4 py-3 text-gray-500">{item.category || "\u2014"}</td>
                  <td className={`px-4 py-3 font-medium ${isLow ? "text-red" : ""}`}>{item.currentStock} {item.unit}</td>
                  <td className="px-4 py-3">
                    {totalCheckedOut > 0 ? (
                      <div className="group relative">
                        <span className="font-medium text-tobacco">{totalCheckedOut} {item.unit}</span>
                        <div className="absolute left-0 top-full mt-1 bg-tobacco text-white text-[0.72rem] rounded-lg p-3 hidden group-hover:block z-10 min-w-[160px] shadow-lg">
                          {item.checkouts.map((c) => (
                            <div key={c.id} className="flex justify-between gap-4 py-0.5">
                              <span>{c.employeeName}</span>
                              <span className="text-gold">{c.quantity - c.returnedQty} {item.unit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">{"\u2014"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{item.minStock}</td>
                  <td className="px-4 py-3">{formatCurrency(item.costPerUnit)}</td>
                  <td className="px-4 py-3 text-gray-500">{item.supplier || "\u2014"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[0.7rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${isLow ? "bg-red/10 text-red" : "bg-green/10 text-green"}`}>
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
                      <Link href={`/admin/inventory/${item.id}`} className="text-teal text-[0.78rem] font-medium hover:underline">
                        History
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredData.length === 0 && (
              <tr><td colSpan={10} className="px-4 py-12 text-center text-gray-400">
                {search ? "No items match your search." : "No inventory items."}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
