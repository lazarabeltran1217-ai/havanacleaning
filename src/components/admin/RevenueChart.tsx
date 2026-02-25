"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface MonthData {
  month: string;
  revenue: number;
  bookings: number;
}

interface Props {
  data: MonthData[];
}

export function RevenueChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 border border-[#ece6d9] text-center">
        <div className="text-4xl mb-4">📈</div>
        <p className="text-gray-400 text-[0.9rem]">
          Revenue chart will appear once you have payment data.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-[#ece6d9]">
      <h3 className="font-display text-lg mb-4">Monthly Revenue</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ece6d9" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#999" }} />
          <YAxis
            tick={{ fontSize: 12, fill: "#999" }}
            tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
          />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) => [
              name === "revenue" ? `$${Number(value ?? 0).toLocaleString()}` : Number(value ?? 0),
              name === "revenue" ? "Revenue" : "Bookings",
            ]}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #ece6d9",
              fontSize: "13px",
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px" }}
            formatter={(v: string) => (v === "revenue" ? "Revenue" : "Bookings")}
          />
          <Bar dataKey="revenue" fill="#2D6A4F" radius={[4, 4, 0, 0]} />
          <Bar dataKey="bookings" fill="#C9941A" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
