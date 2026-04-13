"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

const CATEGORIES = [
  "Supplies",
  "Gas/Fuel",
  "Insurance",
  "Marketing",
  "Rent",
  "Equipment",
  "Utilities",
  "Software",
  "Other",
];

interface Expense {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string | null;
  vendor: string | null;
}

const categoryColors: Record<string, string> = {
  Supplies: "bg-blue-50",
  "Gas/Fuel": "bg-amber-50",
  Insurance: "bg-purple-50",
  Marketing: "bg-pink-50",
  Rent: "bg-teal-50",
  Equipment: "bg-emerald-50",
  Utilities: "bg-yellow-50",
  Software: "bg-indigo-50",
  Other: "bg-gray-50",
};

export function ExpenseSection({ expenses }: { expenses: Expense[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    amount: "",
    category: "Supplies",
    vendor: "",
    description: "",
  });

  const handleSubmit = async () => {
    if (!form.date || !form.amount) return;
    setSaving(true);
    await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setShowForm(false);
    setForm({ date: new Date().toISOString().slice(0, 10), amount: "", category: "Supplies", vendor: "", description: "" });
    router.refresh();
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-[#ece6d9]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg">Expenses</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-amber text-white text-sm rounded-lg font-medium hover:bg-amber/90"
        >
          {showForm ? "Cancel" : "+ Add Expense"}
        </button>
      </div>

      {showForm && (
        <div className="mb-5 p-4 bg-ivory/50 rounded-lg border border-[#ece6d9] space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Vendor</label>
              <input
                type="text"
                placeholder="e.g., Home Depot"
                value={form.vendor}
                onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Description</label>
              <input
                type="text"
                placeholder="Optional note"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving || !form.amount || !form.date}
            className="px-5 py-2 bg-green text-white text-sm rounded-lg font-medium hover:bg-green/90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Expense"}
          </button>
        </div>
      )}

      {expenses.length === 0 ? (
        <p className="text-gray-400 text-sm">No expenses recorded yet.</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-[0.82rem]">
              <thead>
                <tr className="text-left text-[0.7rem] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Category</th>
                  <th className="pb-2 font-medium">Vendor</th>
                  <th className="pb-2 font-medium">Description</th>
                  <th className="pb-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id} className={`border-b border-gray-50 last:border-0 ${categoryColors[exp.category] || ""}`}>
                    <td className="py-2.5 text-gray-500">
                      {new Date(exp.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
                    </td>
                    <td className="py-2.5">
                      <span className="text-[0.72rem] bg-white/60 border border-[#ece6d9] px-2 py-0.5 rounded-full text-tobacco/70">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-2.5 text-gray-500">{exp.vendor || "\u2014"}</td>
                    <td className="py-2.5 text-gray-400 text-[0.78rem] truncate max-w-[200px]">{exp.description || "\u2014"}</td>
                    <td className="py-2.5 text-right font-medium text-red-600">{formatCurrency(exp.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {expenses.map((exp) => (
              <div key={exp.id} className={`rounded-lg p-3 ${categoryColors[exp.category] || "bg-gray-50"}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[0.72rem] bg-white/60 border border-[#ece6d9] px-2 py-0.5 rounded-full text-tobacco/70">{exp.category}</span>
                  <span className="font-medium text-red-600 text-[0.85rem]">{formatCurrency(exp.amount)}</span>
                </div>
                <div className="text-gray-500 text-[0.78rem]">
                  {new Date(exp.date).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}
                  {exp.vendor && ` \u00B7 ${exp.vendor}`}
                </div>
                {exp.description && <div className="text-gray-400 text-[0.72rem] mt-0.5">{exp.description}</div>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
