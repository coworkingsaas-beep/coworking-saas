"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, CalendarDays, User, CreditCard, LogOut, Zap, Bell } from "lucide-react";
import { supabase } from "@/lib/supabase";

const nav = [
  { label: "Dashboard",    href: "/user/dashboard", icon: LayoutDashboard },
  { label: "My Bookings",  href: "/user/bookings",  icon: CalendarDays },
  { label: "My Profile",   href: "/user/profile",   icon: User },
  { label: "Payments",     href: "/user/payments",  icon: CreditCard },
];

export default function UserSidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside style={{ width: "var(--sidebar-width,240px)", background: "var(--surface)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", height: "100vh", position: "fixed", top: 0, left: 0, zIndex: 40 }}>
      {/* Logo */}
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border-light)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "var(--primary)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={18} color="#fff" fill="#fff"/>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", lineHeight: 1.2 }}>CoSpace</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>Member Portal</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 12px 0", overflowY: "auto" }}>
        {nav.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: "var(--radius-sm)", marginBottom: 2, textDecoration: "none", fontWeight: active ? 600 : 500, fontSize: 14, color: active ? "var(--primary)" : "var(--text-secondary)", background: active ? "rgba(99,102,241,0.08)" : "transparent", transition: "all 0.15s", position: "relative" }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "var(--neutral-dark)"; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
              {active && <span style={{ position: "absolute", left: 0, top: "20%", height: "60%", width: 3, background: "var(--primary)", borderRadius: "0 4px 4px 0" }}/>}
              <Icon size={17} color={active ? "var(--primary)" : "var(--tertiary)"} strokeWidth={active ? 2.2 : 1.8}/>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Notification bell */}
      <div style={{ padding: "0 12px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: "var(--radius-sm)", cursor: "pointer", transition: "background 0.15s" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--neutral-dark)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
          <Bell size={17} color="var(--tertiary)" strokeWidth={1.8}/>
          <span style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 500 }}>Notifications</span>
        </div>
      </div>

      {/* Logout */}
      <div style={{ padding: "0 12px 16px", borderTop: "1px solid var(--border-light)", paddingTop: 12, marginTop: 0 }}>
        <button onClick={logout} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: "var(--radius-sm)", border: "none", background: "transparent", cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#EF4444", fontFamily: "inherit", transition: "background 0.15s" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#FEF2F2"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
          <LogOut size={17} strokeWidth={1.8}/> Log Out
        </button>
      </div>
    </aside>
  );
}
