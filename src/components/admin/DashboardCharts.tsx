"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

/* ── Hydration-safe chart wrapper ── */

function ChartWrap({ children, height }: { children: React.ReactNode; height: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div style={{ width: "100%", height, minWidth: 0 }}>
      {mounted ? (
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      ) : (
        <div style={{ width: "100%", height }} />
      )}
    </div>
  );
}

/* ── Types ── */

interface MonthlyData {
  month: string;
  revenue: number;
  bookings: number;
}

interface StatusData {
  status: string;
  count: number;
}

interface ServiceData {
  service: string;
  revenue: number;
}

interface Props {
  monthlyRevenue: MonthlyData[];
  bookingsByStatus: StatusData[];
  revenueByService: ServiceData[];
}

/* ── Colors ── */

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: "#2D6A4F",
  COMPLETED: "#0D9488",
  PENDING: "#C9941A",
  IN_PROGRESS: "#3B82F6",
  CANCELLED: "#DC2626",
  NO_SHOW: "#9CA3AF",
};

const SERVICE_COLORS = ["#2D6A4F", "#C9941A", "#0D9488", "#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B"];

/* ── Revenue Trend ── */

function RevenueOverview({ data }: { data: MonthlyData[] }) {
  if (data.length === 0) return null;
  return (
    <div className="bg-white rounded-xl p-5 border border-[#ece6d9]">
      <h3 className="font-display text-base mb-4">Revenue Trend</h3>
      <ChartWrap height={260}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ece6d9" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#999" }} />
          <YAxis
            yAxisId="revenue"
            tick={{ fontSize: 12, fill: "#999" }}
            tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
          />
          <YAxis yAxisId="bookings" orientation="right" tick={{ fontSize: 12, fill: "#999" }} />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) => [
              name === "revenue" ? `$${Number(value ?? 0).toLocaleString()}` : Number(value ?? 0),
              name === "revenue" ? "Revenue" : "Bookings",
            ]}
            contentStyle={{ borderRadius: "8px", border: "1px solid #ece6d9", fontSize: "13px" }}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px" }}
            formatter={(v: string) => (v === "revenue" ? "Revenue" : "Bookings")}
          />
          <Bar yAxisId="revenue" dataKey="revenue" fill="#2D6A4F" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="bookings" dataKey="bookings" fill="#C9941A" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartWrap>
    </div>
  );
}

/* ── Bookings by Status ── */

function BookingStatusChart({ data }: { data: StatusData[] }) {
  if (data.length === 0) return null;
  const formatted = data.map((d) => ({
    name: d.status.charAt(0) + d.status.slice(1).toLowerCase().replace("_", " "),
    value: d.count,
    color: STATUS_COLORS[d.status] || "#9CA3AF",
  }));
  return (
    <div className="bg-white rounded-xl p-5 border border-[#ece6d9]">
      <h3 className="font-display text-base mb-4">Bookings by Status</h3>
      <ChartWrap height={240}>
        <PieChart>
          <Pie
            data={formatted}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
          >
            {formatted.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #ece6d9", fontSize: "13px" }}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px" }}
            layout="vertical"
            align="right"
            verticalAlign="middle"
          />
        </PieChart>
      </ChartWrap>
    </div>
  );
}

/* ── Revenue by Service ── */

function ServiceRevenueChart({ data }: { data: ServiceData[] }) {
  if (data.length === 0) return null;
  return (
    <div className="bg-white rounded-xl p-5 border border-[#ece6d9]">
      <h3 className="font-display text-base mb-4">Revenue by Service</h3>
      <ChartWrap height={240}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ece6d9" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 12, fill: "#999" }}
            tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
          />
          <YAxis
            type="category"
            dataKey="service"
            tick={{ fontSize: 12, fill: "#666" }}
            width={120}
          />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [`$${Number(value ?? 0).toLocaleString()}`, "Revenue"]}
            contentStyle={{ borderRadius: "8px", border: "1px solid #ece6d9", fontSize: "13px" }}
          />
          <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={SERVICE_COLORS[i % SERVICE_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ChartWrap>
    </div>
  );
}

/* ── Exported composite ── */

export function DashboardCharts({ monthlyRevenue, bookingsByStatus, revenueByService }: Props) {
  const hasData = monthlyRevenue.length > 0 || bookingsByStatus.length > 0 || revenueByService.length > 0;
  if (!hasData) return null;

  return (
    <div className="space-y-5">
      <RevenueOverview data={monthlyRevenue} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <BookingStatusChart data={bookingsByStatus} />
        <ServiceRevenueChart data={revenueByService} />
      </div>
    </div>
  );
}
