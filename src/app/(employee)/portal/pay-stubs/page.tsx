"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface PayStub {
  id: string;
  periodStart: string;
  periodEnd: string;
  totalHours: number;
  hourlyRate: number;
  grossPay: number;
  deductions: number;
  bonuses: number;
  tips: number;
  mileageReimbursement: number;
  netPay: number;
  paidAt: string;
  paidVia: string | null;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function Row({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={className}>{value}</span>
    </div>
  );
}

export default function PayStubsPage() {
  const [payStubs, setPayStubs] = useState<PayStub[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/portal/pay-stubs")
      .then((r) => r.json())
      .then((d) => {
        setPayStubs(d.payStubs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-gray-400 text-sm text-center py-8">Loading pay stubs...</p>;
  }

  const totalEarned = payStubs.reduce((sum, p) => sum + p.netPay, 0);

  return (
    <div>
      <h2 className="font-display text-xl text-tobacco mb-1">Pay Stubs</h2>
      <p className="text-gray-400 text-sm mb-5">Your finalized payroll records</p>

      {/* Summary Cards */}
      {payStubs.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <div className="text-2xl font-bold text-green">${totalEarned.toFixed(2)}</div>
            <div className="text-gray-400 text-[0.75rem] mt-0.5">Total Earned</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <div className="text-2xl font-bold text-tobacco">{payStubs.length}</div>
            <div className="text-gray-400 text-[0.75rem] mt-0.5">Pay Stubs</div>
          </div>
        </div>
      )}

      {/* Pay Stub List */}
      {payStubs.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
          <p className="text-gray-400 text-sm">No pay stubs yet. They will appear here once payroll is processed.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payStubs.map((stub) => {
            const isExpanded = expandedId === stub.id;
            const periodLabel = `${formatDate(stub.periodStart)} — ${formatDate(stub.periodEnd)}`;

            return (
              <div key={stub.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {/* Collapsed header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : stub.id)}
                  className="w-full px-4 py-4 flex items-center justify-between text-left"
                >
                  <div>
                    <div className="text-[0.85rem] font-medium text-tobacco">{periodLabel}</div>
                    <div className="text-gray-400 text-[0.75rem] mt-0.5">
                      Paid {formatDate(stub.paidAt)}
                      {stub.paidVia && ` via ${stub.paidVia}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-green">${stub.netPay.toFixed(2)}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded breakdown */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-50">
                    <div className="space-y-2 text-[0.82rem] pt-3">
                      <Row label="Hours Worked" value={`${stub.totalHours.toFixed(1)}h`} />
                      <Row label="Hourly Rate" value={`$${stub.hourlyRate.toFixed(2)}/hr`} />
                      <Row label="Gross Pay" value={`$${stub.grossPay.toFixed(2)}`} />
                      {stub.bonuses > 0 && (
                        <Row label="Bonuses" value={`+$${stub.bonuses.toFixed(2)}`} className="text-green" />
                      )}
                      {stub.tips > 0 && (
                        <Row label="Tips" value={`+$${stub.tips.toFixed(2)}`} className="text-green" />
                      )}
                      {stub.mileageReimbursement > 0 && (
                        <Row label="Mileage" value={`+$${stub.mileageReimbursement.toFixed(2)}`} className="text-green" />
                      )}
                      {stub.deductions > 0 && (
                        <Row label="Deductions" value={`-$${stub.deductions.toFixed(2)}`} className="text-red-500" />
                      )}
                      <div className="flex justify-between pt-2 border-t border-gray-100 font-medium">
                        <span className="text-tobacco">Net Pay</span>
                        <span className="font-bold text-green">${stub.netPay.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
