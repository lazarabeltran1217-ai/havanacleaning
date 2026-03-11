"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface EmployeeData {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  hourlyRate: number | null;
  isActive: boolean;
  stripeConnectAccountId: string | null;
  stripeConnectOnboarded: boolean;
}

export function StaffEditButton({ employee }: { employee: EmployeeData }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState("");

  const [name, setName] = useState(employee.name || "");
  const [phone, setPhone] = useState(employee.phone || "");
  const [hourlyRate, setHourlyRate] = useState(String(employee.hourlyRate || ""));
  const [isActive, setIsActive] = useState(employee.isActive);
  const [password, setPassword] = useState("");
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeOnboarded, setStripeOnboarded] = useState(employee.stripeConnectOnboarded);
  const [stripeAccountId, setStripeAccountId] = useState(employee.stripeConnectAccountId);

  const handleStripeSetup = async () => {
    setStripeLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: employee.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Failed to create Stripe account");
        return;
      }
      setStripeAccountId(data.accountId);
      window.open(data.url, "_blank");
    } catch {
      setMessage("Failed to setup Stripe");
    } finally {
      setStripeLoading(false);
    }
  };

  const handleStripeRefresh = async () => {
    if (!stripeAccountId) return;
    setStripeLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/stripe/connect/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: stripeAccountId }),
      });
      const data = await res.json();
      if (res.ok) window.open(data.url, "_blank");
      else setMessage(data.error || "Failed to generate link");
    } catch {
      setMessage("Failed to refresh link");
    } finally {
      setStripeLoading(false);
    }
  };

  const handleStripeCheckStatus = async () => {
    if (!stripeAccountId) return;
    setStripeLoading(true);
    try {
      const res = await fetch(`/api/stripe/connect/status?accountId=${stripeAccountId}`);
      const data = await res.json();
      if (data.onboarded) {
        setStripeOnboarded(true);
        setMessage("Stripe payout ready!");
        router.refresh();
      } else {
        setMessage("Onboarding not yet complete");
      }
    } catch {
      setMessage("Failed to check status");
    } finally {
      setStripeLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    const res = await fetch(`/api/employees/${employee.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone: phone || null,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        isActive,
        ...(password && { password }),
      }),
    });

    setSaving(false);

    if (!res.ok) {
      setMessage("Failed to save");
      return;
    }

    setMessage("Saved!");
    setPassword("");
    setTimeout(() => {
      setOpen(false);
      setMessage("");
      router.refresh();
    }, 800);
  };

  const handleDelete = async () => {
    setDeleting(true);
    setMessage("");
    const res = await fetch(`/api/employees/${employee.id}`, { method: "DELETE" });
    setDeleting(false);

    if (!res.ok) {
      const data = await res.json();
      setMessage(data.error || "Failed to delete");
      setConfirmDelete(false);
      return;
    }

    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-green text-[0.78rem] hover:underline"
      >
        Edit
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg mb-4">Edit Employee</h3>

            <div className="space-y-3">
              <div>
                <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Email</label>
                <input value={employee.email} disabled className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 text-gray-400" />
              </div>
              <div>
                <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Phone</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Hourly Rate ($)</label>
                  <input type="number" step="0.5" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">Status</label>
                <select
                  value={isActive ? "active" : "inactive"}
                  onChange={(e) => setIsActive(e.target.value === "active")}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Stripe Connect Payout Section */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-2">Stripe Payout</label>
              {stripeOnboarded ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.78rem] font-medium bg-green/10 text-green">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Payout Ready
                  </span>
                </div>
              ) : stripeAccountId ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[0.78rem] font-medium bg-amber/10 text-amber">
                    Pending
                  </span>
                  <button
                    onClick={handleStripeRefresh}
                    disabled={stripeLoading}
                    className="text-[0.78rem] text-teal hover:underline disabled:opacity-50"
                  >
                    {stripeLoading ? "..." : "Resend Link"}
                  </button>
                  <button
                    onClick={handleStripeCheckStatus}
                    disabled={stripeLoading}
                    className="text-[0.78rem] text-gray-400 hover:underline disabled:opacity-50"
                  >
                    Check Status
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleStripeSetup}
                  disabled={stripeLoading}
                  className="px-4 py-2 bg-teal/10 text-teal rounded-lg text-sm font-medium hover:bg-teal/20 disabled:opacity-50"
                >
                  {stripeLoading ? "Setting up..." : "Setup Stripe Payout"}
                </button>
              )}
            </div>

            {message && (
              <div className={`mt-3 text-[0.82rem] px-3 py-2 rounded-lg ${
                message.includes("Failed") || message.includes("not yet") ? "bg-red/10 text-red" : "bg-green/10 text-green"
              }`}>
                {message}
              </div>
            )}

            {confirmDelete ? (
              <div className="mt-5 border border-red/30 rounded-lg p-3 bg-red/5">
                <p className="text-[0.82rem] text-red font-medium mb-3">
                  Delete {employee.name}? This cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmDelete(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm">
                    Cancel
                  </button>
                  <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50" style={{ backgroundColor: "#C0392B" }}>
                    {deleting ? "Deleting..." : "Yes, Delete"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 mt-5">
                <button onClick={() => setConfirmDelete(true)} className="px-4 py-2 border border-red/30 text-red rounded-lg text-sm hover:bg-red/5">
                  Delete
                </button>
                <button onClick={() => setOpen(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm">Cancel</button>
                <button onClick={handleSave} disabled={saving || !name} className="flex-1 px-4 py-2 bg-green text-white rounded-lg text-sm font-medium disabled:opacity-50">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
