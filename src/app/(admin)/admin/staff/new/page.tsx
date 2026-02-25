"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewEmployeePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "",
    hourlyRate: "20", hireDate: new Date().toISOString().split("T")[0],
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        hourlyRate: parseFloat(form.hourlyRate),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create employee");
      setLoading(false);
      return;
    }

    router.push("/admin/staff");
    router.refresh();
  }

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[0.85rem]";
  const labelClass = "block text-[0.75rem] uppercase tracking-wider text-gray-400 mb-1.5";

  return (
    <div className="max-w-lg">
      <h2 className="font-display text-xl mb-6">Add Employee</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border border-[#ece6d9] space-y-4">
        <div>
          <label className={labelClass}>Full Name *</label>
          <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Email *</label>
          <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Password *</label>
          <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} required minLength={6} className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Hourly Rate ($)</label>
            <input type="number" step="0.5" value={form.hourlyRate} onChange={(e) => update("hourlyRate", e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Hire Date</label>
          <input type="date" value={form.hireDate} onChange={(e) => update("hireDate", e.target.value)} className={inputClass} />
        </div>

        {error && <div className="text-red text-[0.82rem] bg-red/10 px-3 py-2 rounded">{error}</div>}

        <button type="submit" disabled={loading} className="w-full bg-green text-white py-2.5 text-[0.85rem] font-semibold rounded-lg hover:bg-green/90 disabled:opacity-50 transition-colors">
          {loading ? "Creating..." : "Create Employee"}
        </button>
      </form>
    </div>
  );
}
