"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, MessageSquare, HelpCircle, Search, LogOut, X, CheckCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAlerts } from "@/lib/useAlerts";
import Link from "next/link";

const ALERT_COLORS: Record<string, { bg: string; color: string; icon: string }> = {
  birthday: { bg: "#FEF3C7", color: "#92400E", icon: "🎂" },
  renewal:  { bg: "#DBEAFE", color: "#1D4ED8", icon: "🔄" },
  overdue:  { bg: "#FEE2E2", color: "#991B1B", icon: "⚠️" },
  signup:   { bg: "#EDE9FE", color: "#5B21B6", icon: "👤" },
  system:   { bg: "#F1F5F9", color: "#475569", icon: "🔔" },
};

export default function Header() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName,  setUserName]  = useState<string | null>(null);
  const [bellOpen,  setBellOpen]  = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const { alerts, unread, markRead, markAllRead } = useAlerts();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email ?? null);
        setUserName(user.user_metadata?.name ?? user.email?.split("@")[0] ?? "Admin");
      }
    });
  }, []);

  // Close bell dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const recent = alerts.slice(0, 8);

  return (
    <header
      style={{
        height: "var(--header-height)",
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        padding: "0 28px",
        gap: 16,
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Search */}
      <div style={{ flex: 1, maxWidth: 480, position: "relative" }}>
        <Search size={15} color="var(--tertiary)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
        <input
          type="text"
          placeholder="Search for members, bookings, or spaces..."
          style={{ width: "100%", padding: "9px 12px 9px 36px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 13.5, color: "var(--text-primary)", background: "var(--neutral)", outline: "none", fontFamily: "inherit", transition: "border-color 0.15s ease" }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
          onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border)")}
        />
      </div>

      <div style={{ flex: 1 }} />

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {/* Bell with dropdown */}
        <div ref={bellRef} style={{ position: "relative" }}>
          <button
            onClick={() => { setBellOpen((o) => !o); if (!bellOpen && unread > 0) {} }}
            style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", position: "relative", transition: "background 0.15s ease", color: "var(--text-secondary)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--neutral-dark)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
          >
            <Bell size={18} strokeWidth={1.8} />
            {unread > 0 && (
              <span style={{ position: "absolute", top: 5, right: 5, minWidth: 16, height: 16, background: "var(--danger)", borderRadius: 999, border: "1.5px solid var(--surface)", fontSize: 10, fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {bellOpen && (
            <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 380, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", boxShadow: "0 20px 48px rgba(0,0,0,0.14)", zIndex: 200, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Notifications</div>
                  {unread > 0 && <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{unread} unread</div>}
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {unread > 0 && (
                    <button onClick={markAllRead} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", fontSize: 11.5, fontWeight: 600, color: "var(--primary)", background: "rgba(99,102,241,0.08)", border: "none", borderRadius: 6, cursor: "pointer", fontFamily: "inherit" }}>
                      <CheckCheck size={11} /> Mark all read
                    </button>
                  )}
                  <Link href="/alerts" onClick={() => setBellOpen(false)} style={{ fontSize: 11.5, fontWeight: 600, color: "var(--primary)", textDecoration: "none" }}>See all</Link>
                </div>
              </div>
              <div style={{ maxHeight: 380, overflowY: "auto" }}>
                {recent.length === 0 ? (
                  <div style={{ padding: "32px 18px", textAlign: "center", color: "var(--text-muted)", fontSize: 13.5 }}>🎉 All caught up!</div>
                ) : recent.map((a) => {
                  const cfg = ALERT_COLORS[a.type] ?? ALERT_COLORS.system;
                  return (
                    <div key={a.id}
                      onClick={() => markRead(a.id)}
                      style={{ padding: "12px 18px", borderBottom: "1px solid var(--border-light)", display: "flex", gap: 12, alignItems: "flex-start", background: a.is_read ? "var(--surface)" : "rgba(99,102,241,0.035)", cursor: "pointer", transition: "background 0.15s" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--neutral)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = a.is_read ? "var(--surface)" : "rgba(99,102,241,0.035)")}
                    >
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{cfg.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: a.is_read ? 500 : 700, color: "var(--text-primary)", marginBottom: 2 }}>{a.title}</div>
                        <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.4 }}>{a.body}</div>
                        {a.due_date && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{new Date(a.due_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>}
                      </div>
                      {!a.is_read && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--primary)", flexShrink: 0, marginTop: 4 }} />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {[
          { Icon: MessageSquare },
          { Icon: HelpCircle },
        ].map(({ Icon }, i) => (
          <button key={i} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", transition: "background 0.15s ease", color: "var(--text-secondary)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--neutral-dark)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
          >
            <Icon size={18} strokeWidth={1.8} />
          </button>
        ))}
      </div>

      <div style={{ width: 1, height: 28, background: "var(--border)" }} />

      {/* User + Logout */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3, textAlign: "right" }}>{userName ?? "Admin"}</div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", textAlign: "right", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userEmail ?? "Space Manager"}</div>
        </div>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
          {(userName ?? "A")[0].toUpperCase()}
        </div>
        <button onClick={logout} title="Log out"
          style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: "pointer", transition: "all 0.15s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#FEE2E2"; (e.currentTarget as HTMLElement).style.borderColor = "#EF4444"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}>
          <LogOut size={15} color="#EF4444" />
        </button>
      </div>
    </header>
  );
}
