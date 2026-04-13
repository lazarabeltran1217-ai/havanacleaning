"use client";

import { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Line,
  ComposedChart,
} from "recharts";

interface MonthData {
  month: string;
  revenue: number;
  paid: number;
  bookings: number;
}

interface PLData {
  month: string;
  revenue: number;
  paid: number;
  expenses: number;
  payroll: number;
  profit: number;
}

function ChartWrap({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-[320px] flex items-center justify-center text-gray-300">Loading chart...</div>;
  return <>{children}</>;
}

const currencyFmt = (v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`;

export function RevenueChart({ data }: { data: MonthData[] }) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 border border-[#ece6d9] text-center">
        <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-400 text-[0.9rem]">
          Revenue chart will appear once you have payment data.
        </p>
      </div>
    );
  }

  const maxBookings = Math.max(...data.map((d) => d.bookings), 1);

  return (
    <div className="bg-white rounded-xl p-6 border border-[#ece6d9]">
      <h3 className="font-display text-lg mb-4">Monthly Revenue</h3>
      <ChartWrap>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ece6d9" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#999" }} />
            <YAxis
              yAxisId="dollars"
              tick={{ fontSize: 12, fill: "#999" }}
              tickFormatter={currencyFmt}
            />
            <YAxis
              yAxisId="count"
              orientation="right"
              tick={{ fontSize: 12, fill: "#999" }}
              domain={[0, Math.ceil(maxBookings * 1.5)]}
              allowDecimals={false}
              label={{ value: "Bookings", angle: 90, position: "insideRight", style: { fontSize: 11, fill: "#999" } }}
            />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => {
                const v = Number(value ?? 0);
                if (name === "revenue") return [`$${v.toLocaleString()}`, "Revenue (Booked)"];
                if (name === "paid") return [`$${v.toLocaleString()}`, "Paid (Collected)"];
                return [v, "Bookings"];
              }}
              contentStyle={{ borderRadius: "8px", border: "1px solid #ece6d9", fontSize: "13px" }}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px" }}
              formatter={(v: string) =>
                v === "revenue" ? "Revenue (Booked)" : v === "paid" ? "Paid (Collected)" : "Bookings"
              }
            />
            <Bar yAxisId="dollars" dataKey="revenue" fill="#C9941A" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="dollars" dataKey="paid" fill="#1A7A6E" radius={[4, 4, 0, 0]} />
            <Line yAxisId="count" type="monotone" dataKey="bookings" stroke="#2C1810" strokeWidth={2} dot={{ r: 4, fill: "#2C1810" }} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartWrap>
    </div>
  );
}

export function PLChart({ data }: { data: PLData[] }) {
  if (data.length === 0) return null;

  return (
    <div className="bg-white rounded-xl p-6 border border-[#ece6d9]">
      <h3 className="font-display text-lg mb-4">Profit & Loss Overview</h3>
      <ChartWrap>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ece6d9" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#999" }} />
            <YAxis tick={{ fontSize: 12, fill: "#999" }} tickFormatter={currencyFmt} />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => {
                const v = Number(value ?? 0);
                const labels: Record<string, string> = {
                  paid: "Paid (Collected)",
                  expenses: "Expenses",
                  payroll: "Payroll",
                  profit: "Net Profit",
                };
                return [`$${v.toLocaleString()}`, labels[name] || name];
              }}
              contentStyle={{ borderRadius: "8px", border: "1px solid #ece6d9", fontSize: "13px" }}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px" }}
              formatter={(v: string) => {
                const labels: Record<string, string> = {
                  paid: "Paid",
                  expenses: "Expenses",
                  payroll: "Payroll",
                  profit: "Net Profit",
                };
                return labels[v] || v;
              }}
            />
            <Bar dataKey="paid" fill="#2D6A4F" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" fill="#DC2626" radius={[4, 4, 0, 0]} />
            <Bar dataKey="payroll" fill="#C9941A" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="profit" stroke="#1A7A6E" strokeWidth={2} dot={{ r: 4 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartWrap>
    </div>
  );
}
