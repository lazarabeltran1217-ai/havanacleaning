"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ServiceData {
  id: string;
  name: string;
  nameEs: string | null;
  description: string | null;
  descriptionEs: string | null;
  icon: string | null;
  basePrice: number;
  estimatedHours: number;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
}

export function ServiceEditButton({ service }: { service: ServiceData }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(service.name);
  const [nameEs, setNameEs] = useState(service.nameEs || "");
  const [description, setDescription] = useState(service.description || "");
  const [descriptionEs, setDescriptionEs] = useState(service.descriptionEs || "");
  const [icon, setIcon] = useState(service.icon || "");
  const [basePrice, setBasePrice] = useState(String(service.basePrice));
  const [estimatedHours, setEstimatedHours] = useState(String(service.estimatedHours));
  const [isActive, setIsActive] = useState(service.isActive);
  const [isFeatured, setIsFeatured] = useState(service.isFeatured);
  const [sortOrder, setSortOrder] = useState(String(service.sortOrder));

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/services/${service.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        nameEs: nameEs || null,
        description,
        descriptionEs: descriptionEs || null,
        icon: icon || null,
        basePrice: Number(basePrice) || 0,
        estimatedHours: Number(estimatedHours) || 0,
        isActive,
        isFeatured,
        sortOrder: Number(sortOrder) || 0,
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
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg mb-4">Edit Service</h3>

            <div className="space-y-3">
              <div>
                <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Name (English)</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Name (Spanish)</label>
                <input value={nameEs} onChange={(e) => setNameEs(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Optional" />
              </div>
              <div>
                <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Description (English)</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Description (Spanish)</label>
                <textarea value={descriptionEs} onChange={(e) => setDescriptionEs(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Optional" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Icon</label>
                  <input value={icon} onChange={(e) => setIcon(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm text-center text-2xl" />
                </div>
                <div>
                  <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Base Price ($)</label>
                  <input type="number" step="0.01" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Est. Hours</label>
                  <input type="number" step="0.5" value={estimatedHours} onChange={(e) => setEstimatedHours(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Sort Order</label>
                  <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 accent-green" />
                  <span className="text-sm">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 accent-gold" />
                  <span className="text-sm">Featured</span>
                </label>
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
