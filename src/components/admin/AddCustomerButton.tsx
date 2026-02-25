"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddCustomerButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/account/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setMessage(data.error || "Failed to create");
      return;
    }

    setMessage("Customer created!");
    setTimeout(() => {
      setOpen(false);
      setMessage("");
      setForm({ name: "", email: "", phone: "", password: "" });
      router.refresh();
    }, 800);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="bg-green text-white px-5 py-2 text-[0.82rem] font-semibold rounded-lg hover:bg-green/90 transition-colors">
        + Add Customer
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg mb-4">Add Customer</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Name *</label>
                <input value={form.name} onChange={(e) => update("name", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Email *</label>
                <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Password *</label>
                <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} minLength={6} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Min 6 characters" />
              </div>
            </div>

            {message && (
              <div className={`mt-3 text-[0.82rem] px-3 py-2 rounded-lg ${message.includes("Failed") || message.includes("already") || message.includes("required") ? "bg-red/10 text-red" : "bg-green/10 text-green"}`}>
                {message}
              </div>
            )}

            <div className="flex gap-2 mt-5">
              <button onClick={() => setOpen(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.email || !form.password} className="flex-1 px-4 py-2 bg-green text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {saving ? "Creating..." : "Create Customer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
