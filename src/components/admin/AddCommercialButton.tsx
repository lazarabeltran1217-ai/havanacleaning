"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddCommercialButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    companyName: "", contactName: "", contactEmail: "", contactPhone: "",
    contactTitle: "", industry: "", propertyAddress: "",
    squareFootage: "", budgetRange: "", specialRequirements: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/commercial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, jsToken: "admin-manual" }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setMessage(data.error || "Failed to create");
      return;
    }

    setMessage("Inquiry added!");
    setTimeout(() => {
      setOpen(false);
      setMessage("");
      setForm({ companyName: "", contactName: "", contactEmail: "", contactPhone: "", contactTitle: "", industry: "", propertyAddress: "", squareFootage: "", budgetRange: "", specialRequirements: "" });
      router.refresh();
    }, 800);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="bg-green text-white px-5 py-2 text-[0.82rem] font-semibold rounded-lg hover:bg-green/90 transition-colors">
        + Add Inquiry
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg mb-4">Add Commercial Inquiry</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Company Name *</label>
                <input value={form.companyName} onChange={(e) => update("companyName", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Contact Name *</label>
                  <input value={form.contactName} onChange={(e) => update("contactName", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Title</label>
                  <input value={form.contactTitle} onChange={(e) => update("contactTitle", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Email *</label>
                  <input type="email" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Phone *</label>
                  <input type="tel" value={form.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Industry</label>
                  <select value={form.industry} onChange={(e) => update("industry", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="">Select</option>
                    <option value="Office">Office</option>
                    <option value="Retail">Retail</option>
                    <option value="Medical">Medical</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Warehouse">Warehouse</option>
                    <option value="Construction">Construction</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Square Footage</label>
                  <select value={form.squareFootage} onChange={(e) => update("squareFootage", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="">Select</option>
                    <option value="<1000">&lt; 1,000</option>
                    <option value="1000-2500">1,000 - 2,500</option>
                    <option value="2500-5000">2,500 - 5,000</option>
                    <option value="5000-10000">5,000 - 10,000</option>
                    <option value="10000+">10,000+</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Property Address *</label>
                <input value={form.propertyAddress} onChange={(e) => update("propertyAddress", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Budget Range</label>
                <select value={form.budgetRange} onChange={(e) => update("budgetRange", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="">Select</option>
                  <option value="<$500/mo">&lt; $500/mo</option>
                  <option value="$500-$1000/mo">$500 - $1,000/mo</option>
                  <option value="$1000-$2500/mo">$1,000 - $2,500/mo</option>
                  <option value="$2500-$5000/mo">$2,500 - $5,000/mo</option>
                  <option value="$5000+/mo">$5,000+/mo</option>
                  <option value="Need quote">Need quote</option>
                </select>
              </div>
              <div>
                <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Special Requirements</label>
                <textarea value={form.specialRequirements} onChange={(e) => update("specialRequirements", e.target.value)} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm resize-none" />
              </div>
            </div>

            {message && (
              <div className={`mt-3 text-[0.82rem] px-3 py-2 rounded-lg ${message.includes("Failed") || message.includes("required") || message.includes("business") ? "bg-red/10 text-red" : "bg-green/10 text-green"}`}>
                {message}
              </div>
            )}

            <div className="flex gap-2 mt-5">
              <button onClick={() => setOpen(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.companyName || !form.contactName || !form.contactEmail || !form.contactPhone || !form.propertyAddress} className="flex-1 px-4 py-2 bg-green text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {saving ? "Adding..." : "Add Inquiry"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
