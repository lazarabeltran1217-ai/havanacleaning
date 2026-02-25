"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  items: { id: string; name: string }[];
}

export function InventoryActions({ items }: Props) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [showTransaction, setShowTransaction] = useState(false);
  const [saving, setSaving] = useState(false);

  // Add item form
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("each");
  const [currentStock, setCurrentStock] = useState("");
  const [minStock, setMinStock] = useState("5");
  const [costPerUnit, setCostPerUnit] = useState("");
  const [supplier, setSupplier] = useState("");

  // Transaction form
  const [txItemId, setTxItemId] = useState("");
  const [txType, setTxType] = useState("PURCHASE");
  const [txQuantity, setTxQuantity] = useState("");
  const [txNotes, setTxNotes] = useState("");

  const handleAddItem = async () => {
    if (!name) return;
    setSaving(true);
    await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, sku, category, unit,
        currentStock: Number(currentStock) || 0,
        minStock: Number(minStock) || 5,
        costPerUnit: Number(costPerUnit) || 0,
        supplier,
      }),
    });
    setSaving(false);
    setShowAdd(false);
    setName(""); setSku(""); setCategory(""); setUnit("each");
    setCurrentStock(""); setMinStock("5"); setCostPerUnit(""); setSupplier("");
    router.refresh();
  };

  const handleTransaction = async () => {
    if (!txItemId || !txQuantity) return;
    setSaving(true);
    await fetch("/api/inventory/transaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inventoryItemId: txItemId,
        type: txType,
        quantity: Number(txQuantity),
        notes: txNotes || null,
      }),
    });
    setSaving(false);
    setShowTransaction(false);
    setTxItemId(""); setTxType("PURCHASE"); setTxQuantity(""); setTxNotes("");
    router.refresh();
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setShowTransaction(true)}
        className="px-4 py-2 bg-teal text-white text-sm rounded-lg font-medium hover:bg-teal/90"
      >
        Log Transaction
      </button>
      <button
        onClick={() => setShowAdd(true)}
        className="px-4 py-2 bg-green text-white text-sm rounded-lg font-medium hover:bg-green/90"
      >
        + Add Item
      </button>

      {/* Add Item Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg mb-4">Add Inventory Item</h3>
            <div className="space-y-3">
              <input placeholder="Item Name *" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
                <input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input placeholder="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
                <input placeholder="Stock" type="number" value={currentStock} onChange={(e) => setCurrentStock(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
                <input placeholder="Min Stock" type="number" value={minStock} onChange={(e) => setMinStock(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Cost/Unit" type="number" step="0.01" value={costPerUnit} onChange={(e) => setCostPerUnit(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
                <input placeholder="Supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={handleAddItem} disabled={saving || !name} className="flex-1 px-4 py-2 bg-green text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {saving ? "Adding..." : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Transaction Modal */}
      {showTransaction && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowTransaction(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg mb-4">Log Inventory Transaction</h3>
            <div className="space-y-3">
              <select value={txItemId} onChange={(e) => setTxItemId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">Select Item *</option>
                {items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
              <select value={txType} onChange={(e) => setTxType(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="PURCHASE">Purchase (add stock)</option>
                <option value="USAGE">Usage (deduct stock)</option>
                <option value="DAMAGED">Damaged (deduct stock)</option>
                <option value="ADJUSTMENT">Adjustment (set stock to value)</option>
              </select>
              <input
                placeholder={txType === "ADJUSTMENT" ? "New stock level *" : "Quantity *"}
                type="number"
                value={txQuantity}
                onChange={(e) => setTxQuantity(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
              <input placeholder="Notes (optional)" value={txNotes} onChange={(e) => setTxNotes(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowTransaction(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={handleTransaction} disabled={saving || !txItemId || !txQuantity} className="flex-1 px-4 py-2 bg-teal text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {saving ? "Logging..." : "Log Transaction"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
