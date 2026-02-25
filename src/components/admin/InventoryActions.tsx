"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props {
  items: { id: string; name: string }[];
}

interface BookingOption {
  id: string;
  bookingNumber: string;
  scheduledDate: string;
  service: { name: string; icon: string | null };
  customer: { name: string };
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
  const [txType, setTxType] = useState("USAGE");
  const [txQuantity, setTxQuantity] = useState("");
  const [txNotes, setTxNotes] = useState("");
  const [txBookingId, setTxBookingId] = useState("");
  const [bookings, setBookings] = useState<BookingOption[]>([]);

  // Fetch upcoming bookings when transaction modal opens
  useEffect(() => {
    if (!showTransaction) return;
    fetch("/api/bookings?status=CONFIRMED")
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings || []))
      .catch(() => {});
  }, [showTransaction]);

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
        bookingId: txBookingId || null,
      }),
    });
    setSaving(false);
    setShowTransaction(false);
    setTxItemId(""); setTxType("USAGE"); setTxQuantity(""); setTxNotes(""); setTxBookingId("");
    router.refresh();
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setShowTransaction(true)}
        className="px-4 py-2 bg-teal text-white text-sm rounded-lg font-medium hover:bg-teal/90"
      >
        Assign to Job
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

      {/* Assign to Job / Log Transaction Modal */}
      {showTransaction && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowTransaction(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg mb-4">Assign Items to Job</h3>
            <div className="space-y-3">
              {/* Item selector */}
              <div>
                <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Item *</label>
                <select value={txItemId} onChange={(e) => setTxItemId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="">Select item...</option>
                  {items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>

              {/* Booking/Job selector */}
              <div>
                <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Assign to Job</label>
                <select value={txBookingId} onChange={(e) => setTxBookingId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="">No job (general stock change)</option>
                  {bookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bookingNumber} — {b.service.icon} {b.service.name} — {b.customer.name} ({formatDate(b.scheduledDate)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Transaction type */}
              <div>
                <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Type</label>
                <select value={txType} onChange={(e) => setTxType(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="USAGE">Usage (deduct from stock)</option>
                  <option value="PURCHASE">Purchase (add to stock)</option>
                  <option value="DAMAGED">Damaged (deduct from stock)</option>
                  <option value="ADJUSTMENT">Adjustment (set stock level)</option>
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">
                  {txType === "ADJUSTMENT" ? "New Stock Level *" : "Quantity *"}
                </label>
                <input
                  type="number"
                  value={txQuantity}
                  onChange={(e) => setTxQuantity(e.target.value)}
                  placeholder={txType === "ADJUSTMENT" ? "e.g. 20" : "e.g. 3"}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Notes</label>
                <input
                  placeholder="Optional"
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowTransaction(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={handleTransaction} disabled={saving || !txItemId || !txQuantity} className="flex-1 px-4 py-2 bg-teal text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {saving ? "Saving..." : txBookingId ? "Assign to Job" : "Log Transaction"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
