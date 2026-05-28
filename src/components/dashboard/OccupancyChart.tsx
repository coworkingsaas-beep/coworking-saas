"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Dedicated Desks", value: 21, color: "#6366F1" },
  { name: "Hot Desks", value: 7, color: "#C7D2FE" },
  { name: "Cabins", value: 4, color: "#818CF8" },
  { name: "Available", value: 10, color: "#E2E8F0" },
];

export default function OccupancyChart() {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const occupied = data.filter((d) => d.name !== "Available").reduce((sum, d) => sum + d.value, 0);
  const pct = Math.round((occupied / total) * 100);

  return (
    <div
      style={{
        background: "var(--surface)",
        borderRadius: "var(--radius)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
        padding: "24px",
        width: 280,
        flexShrink: 0,
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)" }}>
          Occupancy
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
          Space utilization by type
        </div>
      </div>

      <div style={{ position: "relative", height: 180, marginBottom: 20 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value} seats`]}
              contentStyle={{
                borderRadius: 8,
                border: "none",
                boxShadow: "var(--shadow-md)",
                fontSize: 13,
                fontFamily: "Inter",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>
            {pct}%
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500, marginTop: 3 }}>
            Occupied
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {data.slice(0, 3).map((d) => (
          <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: d.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 12.5, color: "var(--text-secondary)", fontWeight: 500 }}>
                {d.name}
              </span>
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)" }}>
              {Math.round((d.value / (total - 10)) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
