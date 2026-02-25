"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ItemData {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  unit: string;
  minStock: number;
  costPerUnit: number;
  supplier: string | null;
}

export function InventoryEditButton({ item }: { item: ItemData }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(item.name);
  const [sku, setSku] = useState(item.sku || "");
  const [category, setCategory] = useState(item.category || "");
  const [unit, setUnit] = useState(item.unit);
  const [minStock, setMinStock] = useState(String(item.minStock));
  const [costPerUnit, setCostPerUnit] = useState(String(item.costPerUnit));
  const [supplier, setSupplier] = useState(item.supplier || "");

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/inventory/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        sku: sku || null,
        category: category || null,
        unit,
        minStock: Number(minStock) || 0,
        costPerUnit: Number(costPerUnit) || 0,
        supplier: supplier || null,
      }),
    });
    setSaving(false);
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-teal text-[0.78rem] font-medium hover:underline"
      >
        Edit
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg mb-4">Edit Item</h3>

            <div className="space-y-3">
              <div>
                <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Item Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">SKU</label>
                  <input value={sku} onChange={(e) => setSku(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Category</label>
                  <input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Unit</label>
                  <input value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Min Stock</label>
                  <input type="number" value={minStock} onChange={(e) => setMinStock(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Cost/Unit</label>
                  <input type="number" step="0.01" value={costPerUnit} onChange={(e) => setCostPerUnit(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Supplier</label>
                <input value={supplier} onChange={(e) => setSupplier(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={() => setOpen(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving || !name} className="flex-1 px-4 py-2 bg-green text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
