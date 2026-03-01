"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";

const CARD =
  "bg-white dark:bg-[#231c16] rounded-2xl border border-gray-100 dark:border-[#3a2f25] shadow-sm";
const INPUT_CLS =
  "w-full px-3 py-2.5 border border-gray-200 dark:border-[#3a2f25] rounded-lg text-[0.85rem] bg-white dark:bg-[#1a1410] dark:text-cream focus:outline-none focus:ring-2 focus:ring-green/30";
const LABEL_CLS =
  "block text-[0.72rem] font-medium text-gray-500 dark:text-sand/60 uppercase tracking-wider mb-1";

interface Address {
  id: string;
  label: string;
  street: string;
  unit: string | null;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export function AddressManager({
  initialAddresses,
}: {
  initialAddresses: Address[];
}) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("Home");
  const [street, setStreet] = useState("");
  const [unit, setUnit] = useState("");
  const [city, setCity] = useState("Miami");
  const [zipCode, setZipCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, street, unit, city, state: "FL", zipCode }),
    });

    const data = await res.json();
    if (res.ok) {
      setAddresses((prev) => [data.address, ...prev]);
      setShowForm(false);
      setStreet("");
      setUnit("");
      setZipCode("");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setShowForm(!showForm)}
        className="bg-green text-white px-5 py-2.5 text-[0.82rem] font-semibold rounded-lg hover:bg-green/90 transition-colors"
      >
        {showForm ? "Cancel" : "+ Add Address"}
      </button>

      {showForm && (
        <form onSubmit={handleAdd} className={`${CARD} p-5 space-y-3`}>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className={LABEL_CLS}>Label</label>
              <select
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className={INPUT_CLS}
              >
                <option>Home</option>
                <option>Work</option>
                <option>Other</option>
              </select>
            </div>
            <div className="col-span-3">
              <label className={LABEL_CLS}>Street Address</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                required
                className={INPUT_CLS}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className={LABEL_CLS}>Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className={INPUT_CLS}
              />
            </div>
            <div className="col-span-2">
              <label className={LABEL_CLS}>City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>ZIP</label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                required
                className={INPUT_CLS}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-green text-white px-6 py-2.5 text-[0.82rem] font-semibold rounded-lg hover:bg-green/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Saving..." : "Save Address"}
          </button>
        </form>
      )}

      {addresses.length === 0 && !showForm ? (
        <div
          className={`${CARD} p-8 text-center text-gray-400 dark:text-sand/70 text-[0.9rem]`}
        >
          No saved addresses yet.
        </div>
      ) : (
        addresses.map((addr) => (
          <div
            key={addr.id}
            className={`${CARD} p-4 flex items-center gap-3`}
          >
            <MapPin className="w-5 h-5 text-green shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-[0.9rem] text-tobacco dark:text-cream">
                  {addr.label}
                </span>
                {addr.isDefault && (
                  <span className="text-[0.65rem] bg-green/10 text-green px-2 py-0.5 rounded-full uppercase tracking-wider font-medium">
                    Default
                  </span>
                )}
              </div>
              <div className="text-gray-500 dark:text-sand/60 text-[0.82rem] mt-0.5">
                {addr.street}
                {addr.unit && `, ${addr.unit}`}, {addr.city}, {addr.state}{" "}
                {addr.zipCode}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
