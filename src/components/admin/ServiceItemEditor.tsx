"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ItemIcon } from "@/lib/item-icons";
import { Trash2, Plus, Pencil, X, Check } from "lucide-react";

interface ServiceItem {
  id: string;
  name: string;
  nameEs: string | null;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface Props {
  serviceId: string;
  items: ServiceItem[];
  includedItems: number;
  extraItemPrice: number;
}

const ICON_OPTIONS = [
  "ChefHat", "Bath", "Sofa", "BedDouble", "Utensils", "DoorOpen", "Shirt",
  "Fan", "Columns", "Archive", "Warehouse", "Square", "Minus", "Trash2", "Sparkles",
];

export function ServiceItemEditor({ serviceId, items, includedItems, extraItemPrice }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editNameEs, setEditNameEs] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [saving, setSaving] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNameEs, setNewNameEs] = useState("");
  const [newIcon, setNewIcon] = useState("Sparkles");

  const [editIncluded, setEditIncluded] = useState(includedItems);
  const [editExtra, setEditExtra] = useState(extraItemPrice);
  const [showConfig, setShowConfig] = useState(false);

  async function saveConfig() {
    setSaving(true);
    await fetch("/api/admin/service-items", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId, includedItems: editIncluded, extraItemPrice: editExtra }),
    });
    setSaving(false);
    setShowConfig(false);
    router.refresh();
  }

  async function saveItem(id: string) {
    setSaving(true);
    await fetch("/api/admin/service-items", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name: editName, nameEs: editNameEs || null, icon: editIcon }),
    });
    setSaving(false);
    setEditingId(null);
    router.refresh();
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch("/api/admin/service-items", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    router.refresh();
  }

  async function deleteItem(id: string) {
    if (!confirm("Delete this item?")) return;
    await fetch("/api/admin/service-items", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  async function addItem() {
    if (!newName.trim()) return;
    setSaving(true);
    await fetch("/api/admin/service-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId,
        name: newName.trim(),
        nameEs: newNameEs.trim() || null,
        icon: newIcon,
        sortOrder: items.length,
      }),
    });
    setSaving(false);
    setShowAdd(false);
    setNewName("");
    setNewNameEs("");
    setNewIcon("Sparkles");
    router.refresh();
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[0.72rem] uppercase tracking-wider text-gray-400">
          Included Areas ({includedItems} included, +${extraItemPrice}/extra)
        </h4>
        <div className="flex gap-2">
          <button
            onClick={() => { setEditIncluded(includedItems); setEditExtra(extraItemPrice); setShowConfig(!showConfig); }}
            className="text-[0.72rem] text-gold hover:underline"
          >
            {showConfig ? "Cancel" : "Config"}
          </button>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="text-[0.72rem] text-green hover:underline flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
      </div>

      {/* Config panel */}
      {showConfig && (
        <div className="flex items-center gap-3 mb-3 p-3 bg-ivory rounded-lg border border-tobacco/10">
          <div>
            <label className="text-[0.65rem] text-gray-400 block">Included</label>
            <input
              type="number"
              min={0}
              value={editIncluded}
              onChange={(e) => setEditIncluded(Number(e.target.value))}
              className="w-20 border border-tobacco/15 rounded px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="text-[0.65rem] text-gray-400 block">Extra $</label>
            <input
              type="number"
              min={0}
              step={5}
              value={editExtra}
              onChange={(e) => setEditExtra(Number(e.target.value))}
              className="w-20 border border-tobacco/15 rounded px-2 py-1 text-sm"
            />
          </div>
          <button
            onClick={saveConfig}
            disabled={saving}
            className="bg-green text-white px-3 py-1.5 rounded text-[0.78rem] font-medium mt-3 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      )}

      {/* Add new item */}
      {showAdd && (
        <div className="flex items-end gap-2 mb-3 p-3 bg-ivory rounded-lg border border-tobacco/10">
          <div className="flex-1">
            <label className="text-[0.65rem] text-gray-400 block">Name</label>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Item name" className="w-full border border-tobacco/15 rounded px-2 py-1 text-sm" />
          </div>
          <div className="flex-1">
            <label className="text-[0.65rem] text-gray-400 block">Name (ES)</label>
            <input value={newNameEs} onChange={(e) => setNewNameEs(e.target.value)} placeholder="Nombre" className="w-full border border-tobacco/15 rounded px-2 py-1 text-sm" />
          </div>
          <div className="w-28">
            <label className="text-[0.65rem] text-gray-400 block">Icon</label>
            <select value={newIcon} onChange={(e) => setNewIcon(e.target.value)} className="w-full border border-tobacco/15 rounded px-2 py-1 text-sm">
              {ICON_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <button onClick={addItem} disabled={saving} className="bg-green text-white px-3 py-1.5 rounded text-[0.78rem] font-medium disabled:opacity-50">
            Add
          </button>
        </div>
      )}

      {/* Items list */}
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <div key={item.id} className={`inline-flex items-center gap-2 text-[0.78rem] px-3 py-1.5 rounded-full border ${item.isActive ? "bg-ivory border-tobacco/10" : "bg-gray-100 border-gray-200 opacity-50"}`}>
            {editingId === item.id ? (
              <>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-32 border border-tobacco/15 rounded px-1.5 py-0.5 text-[0.75rem]" />
                <select value={editIcon} onChange={(e) => setEditIcon(e.target.value)} className="w-20 border border-tobacco/15 rounded px-1 py-0.5 text-[0.7rem]">
                  {ICON_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
                <button onClick={() => saveItem(item.id)} disabled={saving} className="text-green hover:text-green/80">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <>
                <ItemIcon icon={item.icon} className="w-4 h-4 text-tobacco/50" />
                <span>{item.name}</span>
                <button onClick={() => { setEditingId(item.id); setEditName(item.name); setEditNameEs(item.nameEs || ""); setEditIcon(item.icon || "Sparkles"); }}
                  className="text-gray-400 hover:text-gold">
                  <Pencil className="w-3 h-3" />
                </button>
                <button onClick={() => toggleActive(item.id, item.isActive)}
                  className={`text-[0.65rem] ${item.isActive ? "text-green" : "text-red-400"}`}>
                  {item.isActive ? "ON" : "OFF"}
                </button>
                <button onClick={() => deleteItem(item.id)} className="text-gray-400 hover:text-red-500">
                  <Trash2 className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <span className="text-gray-400 text-[0.78rem]">No items configured</span>
        )}
      </div>
    </div>
  );
}
