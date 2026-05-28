"use client";

import { useState } from "react";
import {
  CreditCard, AlertTriangle, CheckCircle, Clock,
  Search, Filter, Plus, ChevronLeft, ChevronRight,
  IndianRupee, RefreshCw, Banknote,
} from "lucide-react";

// ── Types & Mock Data (roadmap 3.2) ────────────────────────────────────────
type PaymentMode = "Cash" | "UPI" | "Bank";
type ReminderFlag = "Reminder Due" | "Payment Due Today" | "Overdue Reminder" | "None";

interface Payment {
  id: string; memberName: string; initials: string; color: string;
  month: string; year: number; rentAmount: number;
  paid: boolean; paymentDate: string | null; mode: PaymentMode | null;
  dueDate: string; paymentStatus: "Paid" | "Due";
  isOverdue: boolean; daysOverdue: number;
  reminderFlag: ReminderFlag; incomeSynced: boolean; renewalSynced: boolean;
}

const PAYMENTS: Payment[] = [
  { id: "PMT-001", memberName: "Rahul Sharma",  initials: "RS", color: "#6366F1", month: "May", year: 2026, rentAmount: 8500,  paid: true,  paymentDate: "03 May 2026", mode: "UPI",  dueDate: "05 May 2026", paymentStatus: "Paid", isOverdue: false, daysOverdue: 0, reminderFlag: "None",              incomeSynced: true,  renewalSynced: true  },
  { id: "PMT-002", memberName: "Priya Patel",   initials: "PP", color: "#F59E0B", month: "May", year: 2026, rentAmount: 4500,  paid: false, paymentDate: null,            mode: null,  dueDate: "05 May 2026", paymentStatus: "Due",  isOverdue: true,  daysOverdue: 22, reminderFlag: "Overdue Reminder",  incomeSynced: false, renewalSynced: false },
  { id: "PMT-003", memberName: "Ankit Mehta",   initials: "AM", color: "#EF4444", month: "May", year: 2026, rentAmount: 14000, paid: false, paymentDate: null,            mode: null,  dueDate: "05 May 2026", paymentStatus: "Due",  isOverdue: true,  daysOverdue: 22, reminderFlag: "Overdue Reminder",  incomeSynced: false, renewalSynced: false },
  { id: "PMT-004", memberName: "Kavya Singh",   initials: "KS", color: "#94A3B8", month: "Apr", year: 2026, rentAmount: 1500,  paid: true,  paymentDate: "02 Apr 2026", mode: "Cash", dueDate: "05 Apr 2026", paymentStatus: "Paid", isOverdue: false, daysOverdue: 0, reminderFlag: "None",              incomeSynced: true,  renewalSynced: true  },
  { id: "PMT-005", memberName: "Rohan Gupta",   initials: "RG", color: "#10B981", month: "May", year: 2026, rentAmount: 4500,  paid: true,  paymentDate: "01 May 2026", mode: "Bank", dueDate: "05 May 2026", paymentStatus: "Paid", isOverdue: false, daysOverdue: 0, reminderFlag: "None",              incomeSynced: true,  renewalSynced: true  },
  { id: "PMT-006", memberName: "Sneha Joshi",   initials: "SJ", color: "#8B5CF6", month: "May", year: 2026, rentAmount: 8500,  paid: false, paymentDate: null,            mode: null,  dueDate: "05 May 2026", paymentStatus: "Due",  isOverdue: false, daysOverdue: 0, reminderFlag: "Payment Due Today", incomeSynced: false, renewalSynced: false },
  { id: "PMT-007", memberName: "Dev Malhotra",  initials: "DM", color: "#06B6D4", month: "May", year: 2026, rentAmount: 4500,  paid: false, paymentDate: null,            mode: null,  dueDate: "08 May 2026", paymentStatus: "Due",  isOverdue: false, daysOverdue: 0, reminderFlag: "Reminder Due",     incomeSynced: false, renewalSynced: false },
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ── Helpers ────────────────────────────────────────────────────────────────
function Avatar({ i, c }: { i: string; c: string }) {
  return (
    <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${c}20`, border: `2px solid ${c}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: c, flexShrink: 0 }}>
      {i}
    </div>
  );
}

function StatusBadge({ paid, overdue }: { paid: boolean; overdue: boolean }) {
  if (paid)    return <span style={{ fontSize: 11.5, fontWeight: 700, background: "#D1FAE5", color: "#065F46", padding: "3px 10px", borderRadius: 999, border: "1px solid #6EE7B740" }}>Paid</span>;
  if (overdue) return <span style={{ fontSize: 11.5, fontWeight: 700, background: "#FEE2E2", color: "#991B1B", padding: "3px 10px", borderRadius: 999, border: "1px solid #FCA5A540" }}>Overdue</span>;
  return         <span style={{ fontSize: 11.5, fontWeight: 700, background: "#FEF3C7", color: "#92400E", padding: "3px 10px", borderRadius: 999, border: "1px solid #FCD34D40" }}>Due</span>;
}

function ReminderBadge({ flag }: { flag: ReminderFlag }) {
  if (flag === "None") return <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>;
  const map: Record<ReminderFlag, { bg: string; color: string }> = {
    "Reminder Due":      { bg: "#DBEAFE", color: "#1D4ED8" },
    "Payment Due Today": { bg: "#FEF3C7", color: "#92400E" },
    "Overdue Reminder":  { bg: "#FEE2E2", color: "#991B1B" },
    "None":              { bg: "", color: "" },
  };
  const s = map[flag];
  return <span style={{ fontSize: 11, fontWeight: 700, background: s.bg, color: s.color, padding: "3px 8px", borderRadius: 6 }}>{flag}</span>;
}

function ModeBadge({ mode }: { mode: PaymentMode | null }) {
  if (!mode) return <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>;
  const map: Record<PaymentMode, string> = { Cash: "#059669", UPI: "#6366F1", Bank: "#3B82F6" };
  return <span style={{ fontSize: 11.5, fontWeight: 700, color: map[mode], background: `${map[mode]}18`, padding: "3px 10px", borderRadius: 999 }}>{mode}</span>;
}

function SyncDot({ synced }: { synced: boolean }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, color: synced ? "#059669" : "var(--text-muted)" }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: synced ? "#10B981" : "var(--border)", display: "inline-block" }} />
      {synced ? "Yes" : "No"}
    </span>
  );
}

function KpiCard({ icon: Icon, iconColor, iconBg, label, value, badge, badgeColor }: any) {
  return (
    <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "20px 22px", boxShadow: "var(--shadow-sm)", transition: "box-shadow 0.2s, transform 0.2s" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={21} color={iconColor} strokeWidth={1.8} />
        </div>
        {badge && <span style={{ fontSize: 11.5, fontWeight: 700, color: badgeColor, background: `${badgeColor}18`, padding: "3px 8px", borderRadius: 6 }}>{badge}</span>}
      </div>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)" }}>{value}</div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("All");

  const filtered = PAYMENTS.filter(p => {
    const q = search.toLowerCase();
    const mq = p.memberName.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    const sf = statusFilter === "All" || (statusFilter === "Paid" && p.paid) || (statusFilter === "Due" && !p.paid && !p.isOverdue) || (statusFilter === "Overdue" && p.isOverdue);
    const mf = monthFilter === "All" || p.month === monthFilter;
    return mq && sf && mf;
  });

  const totalRevenue = PAYMENTS.filter(p => p.paid).reduce((s, p) => s + p.rentAmount, 0);
  const overdueCount = PAYMENTS.filter(p => p.isOverdue).length;
  const pendingCount = PAYMENTS.filter(p => !p.paid).length;

  const th = (label: string, extra?: React.CSSProperties) => (
    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", borderBottom: "1px solid var(--border)", background: "var(--neutral-dark)", ...extra }}>
      {label}
    </th>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2, marginBottom: 6 }}>Payment Tracking</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Monthly payment ledger — track dues, overdues, and sync status for every member.</p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
        <KpiCard icon={IndianRupee} iconColor="#10B981" iconBg="#D1FAE5" label="Revenue Collected" value={`₹${(totalRevenue/1000).toFixed(1)}k`} badge="+8%" badgeColor="#10B981" />
        <KpiCard icon={AlertTriangle} iconColor="#EF4444" iconBg="#FEE2E2" label="Overdue Payments" value={overdueCount} badge="Urgent" badgeColor="#EF4444" />
        <KpiCard icon={Clock} iconColor="#F59E0B" iconBg="#FEF3C7" label="Pending Payments" value={pendingCount} badge="This Month" badgeColor="#F59E0B" />
        <KpiCard icon={CheckCircle} iconColor="#6366F1" iconBg="#EDE9FE" label="Paid This Month" value={PAYMENTS.filter(p => p.paid).length} />
      </div>

      {/* Table Card */}
      <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", overflow: "hidden", marginBottom: 28 }}>
        {/* Controls */}
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <Search size={14} color="var(--tertiary)" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search member or payment ID…"
                style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontFamily: "inherit", background: "var(--neutral)", color: "var(--text-primary)", outline: "none", width: 260 }}
                onFocus={e => (e.currentTarget.style.borderColor = "var(--primary)")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")} />
            </div>
            {["All","Paid","Due","Overdue"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: "6px 13px", borderRadius: "var(--radius-sm)", border: `1px solid ${statusFilter === s ? "var(--primary)" : "var(--border)"}`, background: statusFilter === s ? "rgba(99,102,241,0.09)" : "var(--surface)", color: statusFilter === s ? "var(--primary)" : "var(--text-secondary)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{s}</button>
            ))}
            <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
              style={{ padding: "6px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 13, fontFamily: "inherit", background: "var(--surface)", color: "var(--text-secondary)", outline: "none", cursor: "pointer" }}>
              <option value="All">All Months</option>
              {MONTHS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            <Plus size={15} /> Record Payment
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 1300 }}>
            <thead>
              <tr>
                {th("#", { position: "sticky", left: 0, zIndex: 3, width: 48 })}
                {th("Member", { position: "sticky", left: 48, zIndex: 3, boxShadow: "4px 0 8px -2px rgba(0,0,0,0.07)", minWidth: 180 })}
                {th("Payment ID")} {th("Month / Year")} {th("Rent Amount")}
                {th("Paid?")} {th("Payment Date")} {th("Mode")}
                {th("Due Date")} {th("Status")} {th("Is Overdue")}
                {th("Days Overdue")} {th("Reminder Flag")}
                {th("Income Synced")} {th("Renewal Synced")}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const bg = "var(--surface)";
                const stickyTd = (children: React.ReactNode, left: number, extra?: React.CSSProperties) => (
                  <td style={{ padding: "13px 16px", whiteSpace: "nowrap", position: "sticky", left, zIndex: 2, background: bg, borderBottom: "1px solid var(--border-light)", ...extra }}>{children}</td>
                );
                const td = (children: React.ReactNode) => (
                  <td style={{ padding: "13px 16px", whiteSpace: "nowrap", fontSize: 13.5, color: "var(--text-primary)", background: bg, borderBottom: "1px solid var(--border-light)" }}>{children}</td>
                );
                return (
                  <tr key={p.id}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).querySelectorAll("td").forEach(c => (c as HTMLElement).style.background = "var(--neutral)"); }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).querySelectorAll("td").forEach(c => (c as HTMLElement).style.background = bg); }}>
                    {stickyTd(<span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>{i + 1}</span>, 0)}
                    {stickyTd(
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <Avatar i={p.initials} c={p.color} />
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--primary)" }}>{p.memberName}</span>
                      </div>, 48, { boxShadow: "4px 0 8px -2px rgba(0,0,0,0.07)", minWidth: 180 }
                    )}
                    {td(<span style={{ fontFamily: "monospace", fontSize: 12.5, color: "var(--text-secondary)" }}>{p.id}</span>)}
                    {td(`${p.month} ${p.year}`)}
                    {td(<strong>₹{p.rentAmount.toLocaleString()}</strong>)}
                    {td(<SyncDot synced={p.paid} />)}
                    {td(p.paymentDate ?? "—")}
                    {td(<ModeBadge mode={p.mode} />)}
                    {td(p.dueDate)}
                    {td(<StatusBadge paid={p.paid} overdue={p.isOverdue} />)}
                    {td(<span style={{ color: p.isOverdue ? "#EF4444" : "var(--success)", fontWeight: 700, fontSize: 12.5 }}>{p.isOverdue ? "YES" : "NO"}</span>)}
                    {td(<span style={{ color: p.daysOverdue > 0 ? "#EF4444" : "var(--text-muted)", fontWeight: p.daysOverdue > 0 ? 700 : 400 }}>{p.daysOverdue > 0 ? `${p.daysOverdue} days` : "—"}</span>)}
                    {td(<ReminderBadge flag={p.reminderFlag} />)}
                    {td(<SyncDot synced={p.incomeSynced} />)}
                    {td(<SyncDot synced={p.renewalSynced} />)}
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={15} style={{ padding: 48, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>No payments match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: "14px 24px", background: "var(--neutral)", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13.5, color: "var(--text-muted)" }}>Showing <strong style={{ color: "var(--text-primary)" }}>{filtered.length}</strong> of <strong style={{ color: "var(--text-primary)" }}>{PAYMENTS.length}</strong> records</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronLeft size={14} color="var(--text-secondary)" /></button>
            {[1, 2].map(p => <button key={p} style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", border: `1px solid ${p === 1 ? "var(--primary)" : "var(--border)"}`, background: p === 1 ? "var(--primary)" : "var(--surface)", color: p === 1 ? "#fff" : "var(--text-secondary)", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>{p}</button>)}
            <button style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronRight size={14} color="var(--text-secondary)" /></button>
          </div>
        </div>
      </div>

      {/* Payment Mode Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {(["Cash","UPI","Bank"] as PaymentMode[]).map(mode => {
          const count = PAYMENTS.filter(p => p.mode === mode).length;
          const total = PAYMENTS.filter(p => p.mode === mode).reduce((s, p) => s + p.rentAmount, 0);
          const colors: Record<PaymentMode, { bg: string; color: string; icon: React.ElementType }> = {
            Cash:  { bg: "#D1FAE5", color: "#059669", icon: Banknote },
            UPI:   { bg: "#EDE9FE", color: "#6366F1", icon: RefreshCw },
            Bank:  { bg: "#DBEAFE", color: "#3B82F6", icon: CreditCard },
          };
          const c = colors[mode];
          return (
            <div key={mode} style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "20px 22px", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <c.icon size={19} color={c.color} strokeWidth={1.8} />
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{mode}</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>₹{total.toLocaleString()}</div>
              <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{count} payment{count !== 1 ? "s" : ""} collected</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
