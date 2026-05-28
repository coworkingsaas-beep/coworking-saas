"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronDown } from "lucide-react";

const data = [
  { month: "Jan", revenue: 28000 },
  { month: "Feb", revenue: 32000 },
  { month: "Mar", revenue: 29500 },
  { month: "Apr", revenue: 38000 },
  { month: "May", revenue: 35000 },
  { month: "Jun", revenue: 42000 },
  { month: "Jul", revenue: 39000 },
  { month: "Aug", revenue: 48000 },
  { month: "Sep", revenue: 52000 },
  { month: "Oct", revenue: 61000 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "var(--secondary)",
          color: "#fff",
          padding: "8px 14px",
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 2 }}>{label}</div>
        <div>${payload[0].value.toLocaleString()}.00</div>
      </div>
    );
  }
  return null;
};

export default function RevenueChart() {
  return (
    <div
      style={{
        background: "var(--surface)",
        borderRadius: "var(--radius)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
        padding: "24px 24px 16px",
        flex: 1,
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)" }}>
            Revenue Trends
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
            Real-time revenue accumulation
          </div>
        </div>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "6px 12px",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            background: "var(--neutral)",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text-secondary)",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Last 10 Months
          <ChevronDown size={14} />
        </button>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "var(--text-muted)", fontFamily: "Inter" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "var(--text-muted)", fontFamily: "Inter" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v / 1000}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--border)", strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#6366F1"
            strokeWidth={2.5}
            fill="url(#revenueGrad)"
            dot={false}
            activeDot={{ r: 5, fill: "#6366F1", stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
