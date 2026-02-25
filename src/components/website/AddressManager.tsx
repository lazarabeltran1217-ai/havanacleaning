"use client";

import { useState } from "react";

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
        className="bg-green text-white px-5 py-2 text-[0.82rem] font-semibold rounded-[3px] hover:bg-green/90 transition-colors"
      >
        {showForm ? "Cancel" : "+ Add Address"}
      </button>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="bg-white border border-tobacco/10 rounded-lg p-6 space-y-3"
        >
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-[0.75rem] uppercase tracking-wider text-sand mb-1">
                Label
              </label>
              <select
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full border border-tobacco/15 rounded-md px-3 py-2.5 text-[0.85rem]"
              >
                <option>Home</option>
                <option>Work</option>
                <option>Other</option>
              </select>
            </div>
            <div className="col-span-3">
              <label className="block text-[0.75rem] uppercase tracking-wider text-sand mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                required
                className="w-full border border-tobacco/15 rounded-md px-3 py-2.5 text-[0.85rem]"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-[0.75rem] uppercase tracking-wider text-sand mb-1">
                Unit
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full border border-tobacco/15 rounded-md px-3 py-2.5 text-[0.85rem]"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[0.75rem] uppercase tracking-wider text-sand mb-1">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-tobacco/15 rounded-md px-3 py-2.5 text-[0.85rem]"
              />
            </div>
            <div>
              <label className="block text-[0.75rem] uppercase tracking-wider text-sand mb-1">
                ZIP
              </label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                required
                className="w-full border border-tobacco/15 rounded-md px-3 py-2.5 text-[0.85rem]"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-gold text-tobacco px-6 py-2 text-[0.82rem] font-semibold rounded-[3px] hover:bg-amber disabled:opacity-50 transition-colors"
          >
            {loading ? "Saving..." : "Save Address"}
          </button>
        </form>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="bg-white border border-tobacco/10 rounded-lg p-8 text-center text-sand text-[0.9rem]">
          No saved addresses yet.
        </div>
      ) : (
        addresses.map((addr) => (
          <div
            key={addr.id}
            className="bg-white border border-tobacco/10 rounded-lg p-5 flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-[0.9rem]">{addr.label}</span>
                {addr.isDefault && (
                  <span className="text-[0.7rem] bg-green/10 text-green px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Default
                  </span>
                )}
              </div>
              <div className="text-sand text-[0.82rem] mt-0.5">
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
