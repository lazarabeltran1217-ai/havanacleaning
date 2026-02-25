"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddApplicationButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    street: "", city: "Miami", state: "FL", zip: "",
    yearsExperience: "", employmentType: "Full-Time", desiredRate: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        authorizedToWork: true,
        consentBackgroundCheck: true,
        consentDrugScreen: true,
        electronicSignature: `${form.firstName} ${form.lastName}`,
        jsToken: "admin-manual",
      }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setMessage(data.error || "Failed to create");
      return;
    }

    setMessage("Application added!");
    setTimeout(() => {
      setOpen(false);
      setMessage("");
      setForm({ firstName: "", lastName: "", email: "", phone: "", street: "", city: "Miami", state: "FL", zip: "", yearsExperience: "", employmentType: "Full-Time", desiredRate: "" });
      router.refresh();
    }, 800);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="bg-green text-white px-5 py-2 text-[0.82rem] font-semibold rounded-lg hover:bg-green/90 transition-colors">
        + Add Application
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg mb-4">Add Application</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">First Name *</label>
                  <input value={form.firstName} onChange={(e) => update("firstName", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Last Name *</label>
                  <input value={form.lastName} onChange={(e) => update("lastName", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Email *</label>
                  <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Phone *</label>
                  <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Street Address *</label>
                <input value={form.street} onChange={(e) => update("street", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">City</label>
                  <input value={form.city} onChange={(e) => update("city", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">State</label>
                  <input value={form.state} onChange={(e) => update("state", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Zip *</label>
                  <input value={form.zip} onChange={(e) => update("zip", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Experience</label>
                  <select value={form.yearsExperience} onChange={(e) => update("yearsExperience", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="">Select</option>
                    <option value="0">None</option>
                    <option value="<1">&lt; 1 year</option>
                    <option value="1-2">1-2 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5+">5+ years</option>
                  </select>
                </div>
                <div>
                  <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Type</label>
                  <select value={form.employmentType} onChange={(e) => update("employmentType", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
                <div>
                  <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Desired Rate</label>
                  <input value={form.desiredRate} onChange={(e) => update("desiredRate", e.target.value)} placeholder="$20/hr" className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
            </div>

            {message && (
              <div className={`mt-3 text-[0.82rem] px-3 py-2 rounded-lg ${message.includes("Failed") || message.includes("required") ? "bg-red/10 text-red" : "bg-green/10 text-green"}`}>
                {message}
              </div>
            )}

            <div className="flex gap-2 mt-5">
              <button onClick={() => setOpen(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.firstName || !form.lastName || !form.email || !form.phone} className="flex-1 px-4 py-2 bg-green text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {saving ? "Adding..." : "Add Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
