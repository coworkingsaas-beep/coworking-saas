"use client";

import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  badge?: string;
  badgeColor?: string;
  trend?: string;
  trendColor?: string;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  badge,
  badgeColor = "var(--text-muted)",
  trend,
  trendColor = "var(--success)",
}: StatCardProps) {
  return (
    <div
      style={{
        background: "var(--surface)",
        borderRadius: "var(--radius)",
        padding: "20px 22px",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={20} color={iconColor} strokeWidth={1.8} />
        </div>
        {(badge || trend) && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: badgeColor || trendColor,
            }}
          >
            {badge || trend}
          </span>
        )}
      </div>

      {/* Value */}
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 4,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
