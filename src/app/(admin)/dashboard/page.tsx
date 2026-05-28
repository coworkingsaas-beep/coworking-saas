"use client";

import dynamic from "next/dynamic";

const RevenueChart = dynamic(() => import("@/components/dashboard/RevenueChart"), { ssr: false });
const OccupancyChart = dynamic(() => import("@/components/dashboard/OccupancyChart"), { ssr: false });
const RecentActivity = dynamic(() => import("@/components/dashboard/RecentActivity"), { ssr: false });
const BookingPreview = dynamic(() => import("@/components/dashboard/BookingPreview"), { ssr: false });

import {
  Users,
  UserCheck,
  Building2,
  CreditCard,
  TrendingUp,
  CalendarDays,
  AlertCircle,
  BarChart3,
  Plus,
  FileText,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";

const stats = [
  {
    label: "Total Active Members",
    value: "124",
    icon: Users,
    iconColor: "#6366F1",
    iconBg: "#EDE9FE",
    trend: "+4%",
    trendColor: "var(--success)",
  },
  {
    label: "Available Seats",
    value: "10",
    icon: Building2,
    iconColor: "#3B82F6",
    iconBg: "#DBEAFE",
    badge: "Stable",
    badgeColor: "var(--text-muted)",
  },
  {
    label: "Occupied Seats",
    value: "22",
    icon: UserCheck,
    iconColor: "#F59E0B",
    iconBg: "#FEF3C7",
    badge: "66% Cap",
    badgeColor: "#F59E0B",
  },
  {
    label: "Payment Due",
    value: "₹1,200",
    icon: AlertCircle,
    iconColor: "#EF4444",
    iconBg: "#FEE2E2",
    badge: "3 Overdue",
    badgeColor: "var(--danger)",
  },
  {
    label: "Monthly Revenue",
    value: "₹45k",
    icon: TrendingUp,
    iconColor: "#10B981",
    iconBg: "#D1FAE5",
    trend: "+12%",
    trendColor: "var(--success)",
  },
  {
    label: "Rooms Booked Today",
    value: "8",
    icon: CalendarDays,
    iconColor: "#8B5CF6",
    iconBg: "#EDE9FE",
    badge: undefined,
    badgeColor: undefined,
  },
  {
    label: "New Leads This Week",
    value: "15",
    icon: BarChart3,
    iconColor: "#F59E0B",
    iconBg: "#FEF3C7",
    badge: "High Lead",
    badgeColor: "#F59E0B",
  },
  {
    label: "Upcoming Bookings",
    value: "22",
    icon: CreditCard,
    iconColor: "#6366F1",
    iconBg: "#EDE9FE",
    badge: undefined,
    badgeColor: undefined,
  },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  return (
    <div>
      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 28,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 30,
              fontWeight: 800,
              color: "var(--text-primary)",
              lineHeight: 1.2,
              marginBottom: 6,
            }}
          >
            {getGreeting()}, Admin 👋
          </h1>
          <p style={{ fontSize: 14.5, color: "var(--text-muted)", fontWeight: 400 }}>
            Here is what's happening across CoSpace today.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 18px",
              border: "1.5px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              background: "var(--surface)",
              fontSize: 13.5,
              fontWeight: 600,
              color: "var(--text-primary)",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "border-color 0.15s ease",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.borderColor = "var(--primary)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.borderColor = "var(--border)")
            }
          >
            <FileText size={15} />
            Create Invoice
          </button>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 18px",
              border: "none",
              borderRadius: "var(--radius-sm)",
              background: "var(--primary)",
              fontSize: 13.5,
              fontWeight: 600,
              color: "#fff",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "var(--primary-dark)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "var(--primary)")
            }
          >
            <Plus size={16} strokeWidth={2.5} />
            Add Booking
          </button>
        </div>
      </div>

      {/* Stat cards — row 1 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 16,
        }}
      >
        {stats.slice(0, 4).map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      {/* Stat cards — row 2 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {stats.slice(4).map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      {/* Charts row */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 20,
          alignItems: "stretch",
          minWidth: 0,
        }}
      >
        <RevenueChart />
        <OccupancyChart />
      </div>

      {/* Bottom row */}
      <div style={{ display: "flex", gap: 16, minWidth: 0 }}>
        <RecentActivity />
        <BookingPreview />
      </div>
    </div>
  );
}
