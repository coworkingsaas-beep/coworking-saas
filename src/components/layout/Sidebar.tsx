"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, CreditCard, Building2,
  CalendarDays, TrendingUp, BarChart3, Settings,
  HelpCircle, Zap, Bell,
} from "lucide-react";
import { useAlerts } from "@/lib/useAlerts";

const navItems = [
  { label: "Dashboard",    href: "/dashboard", icon: LayoutDashboard },
  { label: "Members",      href: "/members",   icon: Users },
  { label: "Payments",     href: "/payments",  icon: CreditCard },
  { label: "Workspaces",   href: "/workspaces",icon: Building2 },
  { label: "Meeting Room", href: "/bookings",  icon: CalendarDays },
  { label: "Leads",        href: "/leads",     icon: TrendingUp },
  { label: "P&L Report",   href: "/pnl",       icon: BarChart3 },
  { label: "Alerts",       href: "/alerts",    icon: Bell, badge: true },
];

const bottomItems = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Support",  href: "/support",  icon: HelpCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { unread } = useAlerts();

  return (
    <aside
      style={{
        width: "var(--sidebar-width)",
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 40,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border-light)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "var(--primary)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={18} color="#fff" fill="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", lineHeight: 1.2 }}>CoSpace Admin</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>Management Suite</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 12px 0", overflowY: "auto" }}>
        {navItems.map(({ label, href, icon: Icon, badge }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          const count = badge ? unread : 0;
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                padding: "9px 12px",
                borderRadius: "var(--radius-sm)",
                marginBottom: 2,
                textDecoration: "none",
                fontWeight: active ? 600 : 500,
                fontSize: 14,
                color: active ? "var(--primary)" : "var(--text-secondary)",
                background: active ? "rgba(99,102,241,0.08)" : "transparent",
                transition: "all 0.15s ease",
                position: "relative",
              }}
              onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "var(--neutral-dark)"; }}
              onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                {active && (
                  <span style={{ position: "absolute", left: 0, top: "20%", height: "60%", width: 3, background: "var(--primary)", borderRadius: "0 4px 4px 0" }} />
                )}
                <Icon size={17} color={active ? "var(--primary)" : "var(--tertiary)"} strokeWidth={active ? 2.2 : 1.8} />
                {label}
              </div>
              {count > 0 && (
                <span style={{ minWidth: 18, height: 18, borderRadius: 999, background: "var(--danger)", color: "#fff", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom nav */}
      <div style={{ padding: "12px 12px 16px", borderTop: "1px solid var(--border-light)", marginTop: 12 }}>
        {bottomItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: "var(--radius-sm)",
                marginBottom: 2,
                textDecoration: "none",
                fontWeight: 500,
                fontSize: 14,
                color: active ? "var(--primary)" : "var(--text-secondary)",
                background: active ? "rgba(99,102,241,0.08)" : "transparent",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "var(--neutral-dark)"; }}
              onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <Icon size={17} color={active ? "var(--primary)" : "var(--tertiary)"} strokeWidth={1.8} />
              {label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
