"use client";
import { useState } from "react";
import { Bell, RefreshCw, CheckCheck, Trash2, Filter, Calendar, AlertTriangle, Gift, UserPlus, Loader2 } from "lucide-react";
import { useAlerts, type AlertType } from "@/lib/useAlerts";

// ── Config ────────────────────────────────────────────────────────────────────
const TYPE_CFG: Record<AlertType, { label: string; bg: string; color: string; icon: React.ElementType }> = {
  birthday: { label: "Birthday",  bg: "#FEF3C7", color: "#92400E", icon: Gift },
  renewal:  { label: "Renewal",   bg: "#DBEAFE", color: "#1D4ED8", icon: Calendar },
  overdue:  { label: "Overdue",   bg: "#FEE2E2", color: "#991B1B", icon: AlertTriangle },
  signup:   { label: "Sign-up",   bg: "#EDE9FE", color: "#5B21B6", icon: UserPlus },
  system:   { label: "System",    bg: "#F1F5F9", color: "#475569", icon: Bell },
};

const EMOJI: Record<AlertType, string> = {
  birthday: "🎂", renewal: "🔄", overdue: "⚠️", signup: "👤", system: "🔔",
};

const FILTERS = ["All", "Birthday", "Renewal", "Overdue", "Sign-up", "Unread"];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AlertsPage() {
  const { alerts, unread, loading, refresh, markRead, markAllRead, deleteAlert } = useAlerts();
  const [typeFilter, setTypeFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const filtered = alerts.filter((a) => {
    if (typeFilter === "All")     return true;
    if (typeFilter === "Unread")  return !a.is_read;
    if (typeFilter === "Birthday") return a.type === "birthday";
    if (typeFilter === "Renewal")  return a.type === "renewal";
    if (typeFilter === "Overdue")  return a.type === "overdue";
    if (typeFilter === "Sign-up")  return a.type === "signup";
    return true;
  });

  const countFor = (f: string) => {
    if (f === "All")      return alerts.length;
    if (f === "Unread")   return unread;
    if (f === "Birthday") return alerts.filter((a) => a.type === "birthday").length;
    if (f === "Renewal")  return alerts.filter((a) => a.type === "renewal").length;
    if (f === "Overdue")  return alerts.filter((a) => a.type === "overdue").length;
    if (f === "Sign-up")  return alerts.filter((a) => a.type === "signup").length;
    return 0;
  };

  const kpis = [
    { icon: Gift,          bg: "#FEF3C7", color: "#92400E", label: "Birthdays",  val: alerts.filter((a) => a.type === "birthday").length },
    { icon: Calendar,      bg: "#DBEAFE", color: "#1D4ED8", label: "Renewals",   val: alerts.filter((a) => a.type === "renewal").length },
    { icon: AlertTriangle, bg: "#FEE2E2", color: "#991B1B", label: "Overdue",    val: alerts.filter((a) => a.type === "overdue").length },
    { icon: UserPlus,      bg: "#EDE9FE", color: "#5B21B6", label: "Sign-ups",   val: alerts.filter((a) => a.type === "signup").length },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 26, flexWrap: "wrap", gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bell size={22} color="#6366F1" strokeWidth={1.8} />
            </div>
            Alerts & Notifications
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
            Birthdays, renewals, overdue payments, and new sign-up requests — all in one place.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {unread > 0 && (
            <button onClick={markAllRead}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontWeight: 600, color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>
              <CheckCheck size={15} /> Mark All Read
            </button>
          )}
          <button onClick={handleRefresh} disabled={refreshing}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "var(--primary)", border: "none", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>
            {refreshing ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <RefreshCw size={15} />}
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {kpis.map(({ icon: Icon, bg, color, label, val }) => (
          <div key={label} style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "18px 20px", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <Icon size={20} color={color} strokeWidth={1.8} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: val > 0 ? color : "var(--text-primary)" }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <Filter size={14} color="var(--tertiary)" style={{ marginTop: 6 }} />
        {FILTERS.map((f) => {
          const c = countFor(f);
          const active = typeFilter === f;
          return (
            <button key={f} onClick={() => setTypeFilter(f)}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 13px", borderRadius: "var(--radius-sm)", border: `1px solid ${active ? "var(--primary)" : "var(--border)"}`, background: active ? "rgba(99,102,241,0.09)" : "var(--surface)", color: active ? "var(--primary)" : "var(--text-secondary)", fontSize: 12.5, fontWeight: active ? 700 : 500, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
              {f}
              {c > 0 && (
                <span style={{ minWidth: 18, height: 18, borderRadius: 999, background: active ? "var(--primary)" : "var(--border)", color: active ? "#fff" : "var(--text-muted)", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{c}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Alerts list */}
      <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48, gap: 12 }}>
            <Loader2 size={28} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }} />
            <span style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading alerts…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "56px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>All clear!</div>
            <div style={{ fontSize: 13.5, color: "var(--text-muted)" }}>No alerts matching this filter.</div>
          </div>
        ) : (
          filtered.map((a, i) => {
            const cfg = TYPE_CFG[a.type];
            const Icon = cfg.icon;
            return (
              <div key={a.id}
                style={{ padding: "16px 20px", borderBottom: i < filtered.length - 1 ? "1px solid var(--border-light)" : "none", display: "flex", alignItems: "flex-start", gap: 14, background: a.is_read ? "var(--surface)" : "rgba(99,102,241,0.03)", transition: "background 0.15s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--neutral)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = a.is_read ? "var(--surface)" : "rgba(99,102,241,0.03)")}
              >
                {/* Icon */}
                <div style={{ width: 40, height: 40, borderRadius: 12, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 20 }}>
                  {EMOJI[a.type]}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: a.is_read ? 500 : 700, color: "var(--text-primary)" }}>{a.title}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.color, padding: "2px 8px", borderRadius: 999 }}>{cfg.label}</span>
                    {!a.is_read && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--primary)", display: "inline-block" }} />}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: a.due_date ? 4 : 0 }}>{a.body}</div>
                  {a.due_date && (
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                      <Calendar size={11} />
                      {new Date(a.due_date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                    {new Date(a.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                  {!a.is_read && (
                    <button onClick={() => markRead(a.id)}
                      style={{ padding: "5px 12px", fontSize: 12, fontWeight: 600, color: "var(--primary)", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 6, cursor: "pointer", fontFamily: "inherit" }}>
                      Mark read
                    </button>
                  )}
                  <button onClick={() => deleteAlert(a.id)}
                    style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#FEE2E2"; (e.currentTarget as HTMLElement).style.borderColor = "#EF4444"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}>
                    <Trash2 size={13} color="#EF4444" />
                  </button>
                </div>
              </div>
            );
          })
        )}

        {filtered.length > 0 && (
          <div style={{ padding: "12px 20px", background: "var(--neutral)", borderTop: "1px solid var(--border)", fontSize: 13, color: "var(--text-muted)" }}>
            Showing <strong style={{ color: "var(--text-primary)" }}>{filtered.length}</strong> of <strong style={{ color: "var(--text-primary)" }}>{alerts.length}</strong> alerts &nbsp;·&nbsp; <strong style={{ color: unread > 0 ? "var(--danger)" : "var(--success)" }}>{unread} unread</strong>
          </div>
        )}
      </div>
    </div>
  );
}
