"use client";

import { useState } from "react";
import {
  UserPlus, Flame, Snowflake, CheckCircle2, XCircle,
  Search, Plus, Phone, Camera, Globe, Users, Star,
  ChevronLeft, ChevronRight,
} from "lucide-react";

// ── Roadmap 3.7 ──────────────────────────────────────────────────────────────
type LeadStatus = "Hot" | "Cold" | "Converted" | "Lost";
type LeadSource = "Instagram" | "Google" | "Referral" | "Walk-in" | "Other";
type Requirement = "Seat" | "Cabin";

interface Lead {
  id: string; name: string; phone: string;
  source: LeadSource; visited: boolean; locationShared: boolean;
  requirement: Requirement; quantity: number;
  status: LeadStatus; convertedMember: string | null; notes: string;
  dateAdded: string; initials: string; color: string;
}

const LEADS: Lead[] = [
  { id: "LD-001", name: "Arjun Kapoor",    phone: "+91 98765 43210", source: "Instagram",  visited: true,  locationShared: true,  requirement: "Seat",  quantity: 1, status: "Hot",       convertedMember: null,           notes: "Interested in monthly plan",   dateAdded: "22 May 2026", initials: "AK", color: "#6366F1" },
  { id: "LD-002", name: "Meera Nair",      phone: "+91 99001 23456", source: "Google",     visited: false, locationShared: true,  requirement: "Cabin", quantity: 1, status: "Hot",       convertedMember: null,           notes: "Needs 2-seater cabin",         dateAdded: "24 May 2026", initials: "MN", color: "#EF4444" },
  { id: "LD-003", name: "Siddharth Roy",   phone: "+91 87654 32109", source: "Referral",   visited: true,  locationShared: true,  requirement: "Seat",  quantity: 3, status: "Converted", convertedMember: "Rahul Sharma",  notes: "Team of 3, joined D5-D7",      dateAdded: "10 May 2026", initials: "SR", color: "#10B981" },
  { id: "LD-004", name: "Priyanka Shah",   phone: "+91 76543 21098", source: "Walk-in",    visited: true,  locationShared: false, requirement: "Seat",  quantity: 1, status: "Cold",      convertedMember: null,           notes: "Budget constraint",            dateAdded: "18 May 2026", initials: "PS", color: "#F59E0B" },
  { id: "LD-005", name: "Vikram Bose",     phone: "+91 65432 10987", source: "Instagram",  visited: false, locationShared: false, requirement: "Cabin", quantity: 1, status: "Lost",      convertedMember: null,           notes: "Went with competitor",         dateAdded: "05 May 2026", initials: "VB", color: "#94A3B8" },
  { id: "LD-006", name: "Tanvi Gupta",     phone: "+91 54321 09876", source: "Google",     visited: true,  locationShared: true,  requirement: "Seat",  quantity: 2, status: "Hot",       convertedMember: null,           notes: "Startup, needs flexibility",   dateAdded: "26 May 2026", initials: "TG", color: "#8B5CF6" },
  { id: "LD-007", name: "Harsh Malhotra",  phone: "+91 43210 98765", source: "Referral",   visited: false, locationShared: true,  requirement: "Seat",  quantity: 1, status: "Cold",      convertedMember: null,           notes: "Following up next week",       dateAdded: "20 May 2026", initials: "HM", color: "#06B6D4" },
  { id: "LD-008", name: "Neha Joshi",      phone: "+91 32109 87654", source: "Other",      visited: true,  locationShared: true,  requirement: "Cabin", quantity: 1, status: "Converted", convertedMember: "Priya Patel",   notes: "Converted to C3",             dateAdded: "01 May 2026", initials: "NJ", color: "#F97316" },
];

const STATUS_CONFIG: Record<LeadStatus, { bg: string; color: string; dot: string; icon: React.ElementType; label: string }> = {
  Hot:       { bg: "#FEE2E2", color: "#991B1B", dot: "#EF4444", icon: Flame,        label: "Hot" },
  Cold:      { bg: "#DBEAFE", color: "#1D4ED8", dot: "#3B82F6", icon: Snowflake,    label: "Cold" },
  Converted: { bg: "#D1FAE5", color: "#065F46", dot: "#10B981", icon: CheckCircle2, label: "Converted" },
  Lost:      { bg: "#F1F5F9", color: "#475569", dot: "#94A3B8", icon: XCircle,      label: "Lost" },
};

const SOURCE_ICON: Record<LeadSource, React.ElementType> = {
  Instagram: Camera, Google: Globe, Referral: Users, "Walk-in": UserPlus, Other: Star,
};

const SOURCE_COLOR: Record<LeadSource, string> = {
  Instagram: "#E1306C", Google: "#4285F4", Referral: "#10B981", "Walk-in": "#F59E0B", Other: "#8B5CF6",
};

// ── Components ────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: LeadStatus }) {
  const c = STATUS_CONFIG[status];
  const Icon = c.icon;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 700, background: c.bg, color: c.color, padding: "3px 10px", borderRadius: 999 }}>
      <Icon size={11} strokeWidth={2.5} /> {status}
    </span>
  );
}

function SourceBadge({ source }: { source: LeadSource }) {
  const Icon = SOURCE_ICON[source];
  const color = SOURCE_COLOR[source];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color, background: `${color}14`, padding: "3px 10px", borderRadius: 999 }}>
      <Icon size={11} strokeWidth={2} /> {source}
    </span>
  );
}

function YesNo({ val, positiveColor }: { val: boolean; positiveColor?: string }) {
  return (
    <span style={{ fontSize: 12, fontWeight: 700, color: val ? (positiveColor ?? "#10B981") : "var(--text-muted)" }}>
      {val ? "✓ Yes" : "✗ No"}
    </span>
  );
}

function KpiCard({ icon: Icon, iconColor, iconBg, label, value, sub }: any) {
  return (
    <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "18px 20px", boxShadow: "var(--shadow-sm)", transition: "box-shadow 0.2s, transform 0.2s" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
        <Icon size={19} color={iconColor} strokeWidth={1.8} />
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

const th = (label: string, extra?: React.CSSProperties) => (
  <th key={label} style={{ padding: "11px 14px", textAlign: "left", fontSize: 10.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", borderBottom: "1px solid var(--border)", background: "var(--neutral-dark)", ...extra }}>
    {label}
  </th>
);

// ── Pipeline funnel strip ─────────────────────────────────────────────────────
function Funnel({ leads }: { leads: Lead[] }) {
  const stages: LeadStatus[] = ["Hot", "Cold", "Converted", "Lost"];
  const total = leads.length || 1;
  return (
    <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "20px 24px", boxShadow: "var(--shadow-sm)", marginBottom: 24 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Pipeline Overview</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {stages.map(s => {
          const c = STATUS_CONFIG[s];
          const count = leads.filter(l => l.status === s).length;
          const pct = Math.round((count / total) * 100);
          const Icon = c.icon;
          return (
            <div key={s} style={{ textAlign: "center" }}>
              <div style={{ height: 6, background: "var(--border)", borderRadius: 999, overflow: "hidden", marginBottom: 10 }}>
                <div style={{ height: "100%", width: `${pct}%`, background: c.dot, borderRadius: 999, transition: "width 0.6s ease" }} />
              </div>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                <Icon size={16} color={c.color} strokeWidth={2} />
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>{count}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>{s} <span style={{ color: c.dot }}>·{pct}%</span></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");

  const filtered = LEADS.filter(l => {
    const q = search.toLowerCase();
    const mq = l.name.toLowerCase().includes(q) || l.phone.includes(q) || l.id.toLowerCase().includes(q);
    const sf = statusFilter === "All" || l.status === statusFilter;
    const rf = sourceFilter === "All" || l.source === sourceFilter;
    return mq && sf && rf;
  });

  const hot       = LEADS.filter(l => l.status === "Hot").length;
  const converted = LEADS.filter(l => l.status === "Converted").length;
  const convRate  = Math.round((converted / LEADS.length) * 100);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 26, flexWrap: "wrap", gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2, marginBottom: 6 }}>Leads & Inquiries</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Track prospects through the sales pipeline — from inquiry to conversion.</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 20px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          <Plus size={15} /> Add Lead
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        <KpiCard icon={UserPlus}     iconColor="#6366F1" iconBg="#EDE9FE" label="Total Leads"      value={LEADS.length} />
        <KpiCard icon={Flame}        iconColor="#EF4444" iconBg="#FEE2E2" label="Hot Leads"         value={hot}           sub="Need immediate action" />
        <KpiCard icon={CheckCircle2} iconColor="#10B981" iconBg="#D1FAE5" label="Converted"         value={converted} />
        <KpiCard icon={Star}         iconColor="#F59E0B" iconBg="#FEF3C7" label="Conversion Rate"   value={`${convRate}%`} sub={`${converted} of ${LEADS.length} leads`} />
      </div>

      {/* Pipeline funnel */}
      <Funnel leads={LEADS} />

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ position: "relative" }}>
          <Search size={14} color="var(--tertiary)" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, phone or ID…"
            style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontFamily: "inherit", background: "var(--neutral)", color: "var(--text-primary)", outline: "none", width: 230 }}
            onFocus={e => (e.currentTarget.style.borderColor = "var(--primary)")}
            onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")} />
        </div>
        {["All","Hot","Cold","Converted","Lost"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: "5px 12px", borderRadius: "var(--radius-sm)", border: `1px solid ${statusFilter === s ? "var(--primary)" : "var(--border)"}`, background: statusFilter === s ? "rgba(99,102,241,0.09)" : "var(--surface)", color: statusFilter === s ? "var(--primary)" : "var(--text-secondary)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{s}</button>
        ))}
        <div style={{ width: 1, height: 20, background: "var(--border)" }} />
        {["All","Instagram","Google","Referral","Walk-in","Other"].map(s => (
          <button key={s} onClick={() => setSourceFilter(s)} style={{ padding: "5px 12px", borderRadius: "var(--radius-sm)", border: `1px solid ${sourceFilter === s ? SOURCE_COLOR[s as LeadSource] ?? "var(--primary)" : "var(--border)"}`, background: sourceFilter === s ? `${SOURCE_COLOR[s as LeadSource] ?? "var(--primary)"}12` : "var(--surface)", color: sourceFilter === s ? (SOURCE_COLOR[s as LeadSource] ?? "var(--primary)") : "var(--text-secondary)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{s}</button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 1100 }}>
            <thead>
              <tr>
                {th("#", { width: 40 })}
                {th("Lead", { minWidth: 170 })}
                {th("Phone")}
                {th("Source")}
                {th("Visited?")}
                {th("Location Shared?")}
                {th("Requirement")}
                {th("Qty")}
                {th("Status")}
                {th("Converted Member")}
                {th("Date Added")}
                {th("Notes", { minWidth: 180 })}
              </tr>
            </thead>
            <tbody>
              {filtered.map((l, i) => {
                const bg = "var(--surface)";
                return (
                  <tr key={l.id}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).querySelectorAll("td").forEach(c => (c as HTMLElement).style.background = "var(--neutral)")}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).querySelectorAll("td").forEach(c => (c as HTMLElement).style.background = bg)}>
                    <td style={{ padding: "12px 14px", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", background: bg, borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap" }}>{i + 1}</td>
                    <td style={{ padding: "12px 14px", background: bg, borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${l.color}20`, border: `2px solid ${l.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: l.color, flexShrink: 0 }}>{l.initials}</div>
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)" }}>{l.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>{l.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", background: bg, borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--text-secondary)" }}>
                        <Phone size={12} color="var(--text-muted)" />{l.phone}
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", background: bg, borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap" }}><SourceBadge source={l.source} /></td>
                    <td style={{ padding: "12px 14px", background: bg, borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap" }}><YesNo val={l.visited} /></td>
                    <td style={{ padding: "12px 14px", background: bg, borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap" }}><YesNo val={l.locationShared} positiveColor="#6366F1" /></td>
                    <td style={{ padding: "12px 14px", background: bg, borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: l.requirement === "Cabin" ? "#6366F1" : "#10B981", background: l.requirement === "Cabin" ? "#EDE9FE" : "#D1FAE5", padding: "3px 10px", borderRadius: 999 }}>
                        {l.requirement === "Cabin" ? "🏢" : "💺"} {l.requirement}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: "var(--text-primary)", background: bg, borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap" }}>{l.quantity}</td>
                    <td style={{ padding: "12px 14px", background: bg, borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap" }}><StatusBadge status={l.status} /></td>
                    <td style={{ padding: "12px 14px", background: bg, borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap" }}>
                      {l.convertedMember
                        ? <span style={{ fontSize: 12.5, fontWeight: 600, color: "#10B981" }}>→ {l.convertedMember}</span>
                        : <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 12.5, color: "var(--text-secondary)", background: bg, borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap" }}>{l.dateAdded}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12.5, color: "var(--text-muted)", background: bg, borderBottom: "1px solid var(--border-light)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.notes || "—"}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={12} style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>No leads match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Footer */}
        <div style={{ padding: "13px 20px", background: "var(--neutral)", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Showing <strong style={{ color: "var(--text-primary)" }}>{filtered.length}</strong> of <strong style={{ color: "var(--text-primary)" }}>{LEADS.length}</strong> leads</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={{ width: 30, height: 30, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronLeft size={13} color="var(--text-secondary)" /></button>
            {[1].map(p => <button key={p} style={{ width: 30, height: 30, borderRadius: "var(--radius-sm)", border: "1px solid var(--primary)", background: "var(--primary)", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>{p}</button>)}
            <button style={{ width: 30, height: 30, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronRight size={13} color="var(--text-secondary)" /></button>
          </div>
        </div>
      </div>

      {/* Source breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginTop: 20 }}>
        {(["Instagram","Google","Referral","Walk-in","Other"] as LeadSource[]).map(src => {
          const Icon = SOURCE_ICON[src];
          const count = LEADS.filter(l => l.source === src).length;
          const color = SOURCE_COLOR[src];
          return (
            <div key={src} style={{ background: "var(--surface)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: `${color}16`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={17} color={color} strokeWidth={1.8} />
              </div>
              <div>
                <div style={{ fontSize: 19, fontWeight: 800, color: "var(--text-primary)" }}>{count}</div>
                <div style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 500 }}>{src}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
