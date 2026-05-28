"use client";

import { CreditCard, UserPlus, UserX, Calendar, TrendingUp } from "lucide-react";

const activities = [
  {
    icon: CreditCard,
    iconColor: "#10B981",
    iconBg: "#D1FAE5",
    title: "Payment Received",
    subtitle: "Rohit Sharma — ₹8,500",
    time: "2 mins ago",
  },
  {
    icon: UserPlus,
    iconColor: "#6366F1",
    iconBg: "#EDE9FE",
    title: "New Member Added",
    subtitle: "Priya Patel — Dedicated Desk",
    time: "18 mins ago",
  },
  {
    icon: Calendar,
    iconColor: "#3B82F6",
    iconBg: "#DBEAFE",
    title: "Meeting Room Booked",
    subtitle: "Cabin B — 3:00 PM–5:00 PM",
    time: "34 mins ago",
  },
  {
    icon: TrendingUp,
    iconColor: "#F59E0B",
    iconBg: "#FEF3C7",
    title: "Lead Converted",
    subtitle: "Ankit Mehta — Hot Desk",
    time: "1 hr ago",
  },
  {
    icon: UserX,
    iconColor: "#EF4444",
    iconBg: "#FEE2E2",
    title: "Member Discontinued",
    subtitle: "Kavya Singh — Exit processed",
    time: "3 hrs ago",
  },
];

export default function RecentActivity() {
  return (
    <div
      style={{
        background: "var(--surface)",
        borderRadius: "var(--radius)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
        padding: "24px",
        flex: 1,
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)" }}>
          Recent Activity
        </div>
        <button
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--primary)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          View All
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {activities.map((a, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: 12 }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: a.iconBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <a.icon size={17} color={a.iconColor} strokeWidth={1.8} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>
                {a.title}
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: "var(--text-muted)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {a.subtitle}
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", flexShrink: 0, fontWeight: 500 }}>
              {a.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
