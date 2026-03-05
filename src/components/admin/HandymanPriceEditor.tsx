"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface HandymanPrice {
  id: string;
  key: string;
  basePrice: number;
  isActive: boolean;
}

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

export function HandymanPriceEditor({ prices }: { prices: HandymanPrice[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [saving, setSaving] = useState(false);

  async function savePrice(id: string) {
    setSaving(true);
    await fetch(`/api/handyman-services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ basePrice: parseFloat(editPrice) }),
    });
    setSaving(false);
    setEditingId(null);
    router.refresh();
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch(`/api/handyman-services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-2">
      {prices.map((p) => (
        <div key={p.id} className="flex items-center justify-between bg-white rounded-xl border border-[#ece6d9] px-5 py-3">
          <div className="flex items-center gap-3">
            <span className={`text-[0.88rem] font-medium ${p.isActive ? "text-tobacco" : "text-gray-400"}`}>
              {SERVICE_LABELS[p.key] || p.key}
            </span>
            {!p.isActive && (
              <span className="text-[0.68rem] text-red uppercase tracking-wider">Inactive</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {editingId === p.id ? (
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-[0.85rem]">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-[0.85rem] text-right"
                  autoFocus
                />
                <button
                  onClick={() => savePrice(p.id)}
                  disabled={saving}
                  className="text-green text-[0.78rem] font-semibold hover:underline disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-gray-400 text-[0.78rem] hover:underline"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <span className="text-lg font-semibold text-green">${p.basePrice}</span>
                <button
                  onClick={() => { setEditingId(p.id); setEditPrice(p.basePrice.toString()); }}
                  className="text-gold text-[0.78rem] font-semibold hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleActive(p.id, p.isActive)}
                  className={`text-[0.78rem] font-semibold hover:underline ${p.isActive ? "text-red-400" : "text-green"}`}
                >
                  {p.isActive ? "Disable" : "Enable"}
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
