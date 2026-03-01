"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Service {
  id: string;
  name: string;
  icon: string | null;
  basePrice: number;
}

interface Employee {
  id: string;
  name: string;
}

interface Props {
  onCreated?: () => void;
}

export function QuickBookForm({ onCreated }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Form fields
  const [serviceId, setServiceId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("morning");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("Miami");
  const [notes, setNotes] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    // Fetch services and employees when modal opens
    Promise.all([
      fetch("/api/services").then((r) => r.json()),
      fetch("/api/employees").then((r) => r.json()),
    ]).then(([sData, eData]) => {
      setServices(sData.services || []);
      setEmployees(eData.employees || []);
    });

    // Default date to today (Eastern Time)
    const et = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
    setScheduledDate(`${et.getFullYear()}-${String(et.getMonth() + 1).padStart(2, "0")}-${String(et.getDate()).padStart(2, "0")}`);
  }, [open]);

  const resetForm = () => {
    setServiceId("");
    setScheduledDate("");
    setScheduledTime("morning");
    setCustomerName("");
    setCustomerPhone("");
    setStreet("");
    setCity("Miami");
    setNotes("");
    setSelectedEmployees([]);
  };

  const toggleEmployee = (id: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!serviceId || !scheduledDate || !customerName) return;

    setSaving(true);
    const res = await fetch("/api/admin/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId,
        scheduledDate,
        scheduledTime,
        customerName,
        customerPhone: customerPhone || null,
        street: street || null,
        city,
        notes: notes || null,
        assignEmployeeIds: selectedEmployees,
      }),
    });

    if (res.ok) {
      setSaving(false);
      setOpen(false);
      resetForm();
      if (onCreated) onCreated();
      else router.refresh();
    } else {
      setSaving(false);
      alert("Failed to create booking. Please try again.");
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-green text-white rounded-lg text-sm font-medium hover:bg-green/90"
      >
        + New Job
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg mb-4">Schedule a New Job</h3>

            <div className="space-y-3">
              {/* Service */}
              <div>
                <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">
                  Service *
                </label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="">Select a service...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.icon} {s.name} — ${s.basePrice}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">
                    Time
                  </label>
                  <select
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="morning">Morning (8am–12pm)</option>
                    <option value="afternoon">Afternoon (12–5pm)</option>
                    <option value="evening">Evening (5–8pm)</option>
                  </select>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">
                    Customer Name *
                  </label>
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Maria Garcia"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">
                    Phone
                  </label>
                  <input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="(305) 555-1234"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">
                    Street Address
                  </label>
                  <input
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="123 Main St"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">
                    City
                  </label>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-1">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Special instructions..."
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              {/* Assign Employees */}
              {employees.length > 0 && (
                <div>
                  <label className="text-[0.72rem] uppercase tracking-wider text-gray-400 block mb-2">
                    Assign Employees
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {employees.map((emp) => {
                      const selected = selectedEmployees.includes(emp.id);
                      return (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => toggleEmployee(emp.id)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                            selected
                              ? "bg-green text-white border-green"
                              : "bg-white text-gray-600 border-gray-300 hover:border-green"
                          }`}
                        >
                          {selected ? "✓ " : ""}
                          {emp.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => {
                  setOpen(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 border rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || !serviceId || !scheduledDate || !customerName}
                className="flex-1 px-4 py-2 bg-green text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {saving ? "Creating..." : "Create Job"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
