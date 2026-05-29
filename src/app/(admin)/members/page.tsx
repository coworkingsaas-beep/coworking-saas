"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users, AlertCircle, Building2, TrendingUp,
  Search, Filter, UserPlus, ChevronLeft, ChevronRight, Plus, Zap, Pencil, Loader2, Check, Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Member } from "@/lib/supabase";
import AddMemberModal from "@/components/members/AddMemberModal";
import EditMemberModal from "@/components/members/EditMemberModal";
import { useSpaces, getOccupiedSpaces } from "@/lib/useSpaces";
import { useSettings } from "@/lib/useSettings";

// ── Mock data from roadmap fields ──────────────────────────────────────────
const MEMBERS = [
  {
    id: 1, name: "Rahul Sharma", company: "Lumina Tech", initials: "RS",
    phone: "+91 98765 43210", email: "rahul@lumina.io", dob: "14 May 1992",
    joiningDate: "12 Jan 2023", renewalDate: "12 Jan 2024",
    spaceType: "Manager Cabin", assignedSpace: "C-04",
    securityDeposit: "₹24,000", rentAmount: "₹8,500",
    paymentStatus: "Paid", teamSize: "1 (Solo)",
    printsUsed: 120, printsAllowed: 500,
    status: "Active", discounted: false, source: "Direct",
    welcomeStatus: "Sent", color: "#6366F1",
  },
  {
    id: 2, name: "Priya Patel", company: "Freelance Design", initials: "PP",
    phone: "+91 87654 32109", email: "priya@design.co", dob: "28 Oct 1988",
    joiningDate: "05 Mar 2023", renewalDate: "05 Mar 2024",
    spaceType: "Dedicated Desk", assignedSpace: "D-28",
    securityDeposit: "₹8,000", rentAmount: "₹4,500",
    paymentStatus: "Pending", teamSize: "1 (Solo)",
    printsUsed: 450, printsAllowed: 500,
    status: "Active", discounted: true, source: "Instagram",
    welcomeStatus: "Sent", color: "#F59E0B",
  },
  {
    id: 3, name: "Ankit Mehta", company: "Mehta & Associates", initials: "AM",
    phone: "+91 76543 21098", email: "ankit@mehtalaw.in", dob: "02 Jan 1975",
    joiningDate: "20 Nov 2022", renewalDate: "20 Nov 2023",
    spaceType: "Two-Seater Cabin", assignedSpace: "C-02",
    securityDeposit: "₹50,000", rentAmount: "₹14,000",
    paymentStatus: "Overdue", teamSize: "2 Members",
    printsUsed: 520, printsAllowed: 500,
    status: "Active", discounted: false, source: "Referral",
    welcomeStatus: "Sent", color: "#EF4444",
  },
  {
    id: 4, name: "Kavya Singh", company: "Solo Founder", initials: "KS",
    phone: "+91 65432 10987", email: "kavya@founder.me", dob: "19 Sep 1995",
    joiningDate: "15 May 2023", renewalDate: "15 Jun 2023",
    spaceType: "Virtual Desk", assignedSpace: "V-102",
    securityDeposit: "₹2,000", rentAmount: "₹1,500",
    paymentStatus: "N/A", teamSize: "1 (Solo)",
    printsUsed: 12, printsAllowed: 50,
    status: "Inactive", discounted: false, source: "Google",
    welcomeStatus: "Sent", color: "#94A3B8",
  },
  {
    id: 5, name: "Rohan Gupta", company: "Gupta Exports", initials: "RG",
    phone: "+91 54321 09876", email: "rohan@guptaexports.com", dob: "11 Mar 1983",
    joiningDate: "01 Aug 2023", renewalDate: "01 Aug 2024",
    spaceType: "Dedicated Desk", assignedSpace: "D-15",
    securityDeposit: "₹8,000", rentAmount: "₹4,500",
    paymentStatus: "Paid", teamSize: "1 (Solo)",
    printsUsed: 80, printsAllowed: 500,
    status: "Active", discounted: false, source: "Direct",
    welcomeStatus: "Pending", color: "#10B981",
  },
];

const barData = [40, 65, 55, 85, 70, 30, 25];
const barDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ── Sub-components ─────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, iconColor, iconBg, label, value, badge, badgeColor }: any) {
  return (
    <div
      style={{
        background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)",
        padding: "20px 22px", boxShadow: "var(--shadow-sm)", transition: "box-shadow 0.2s, transform 0.2s",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={21} color={iconColor} strokeWidth={1.8} />
        </div>
        {badge && (
          <span style={{ fontSize: 11.5, fontWeight: 700, color: badgeColor, background: `${badgeColor}18`, padding: "3px 8px", borderRadius: 6 }}>
            {badge}
          </span>
        )}
      </div>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)" }}>{value}</div>
    </div>
  );
}

function PayBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Paid: { bg: "#D1FAE5", color: "#065F46" },
    Pending: { bg: "#FEF3C7", color: "#92400E" },
    Overdue: { bg: "#FEE2E2", color: "#991B1B" },
    "N/A": { bg: "#F1F5F9", color: "#64748B" },
  };
  const s = map[status] || map["N/A"];
  return (
    <span style={{ fontSize: 11.5, fontWeight: 700, background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 999, border: `1px solid ${s.color}22` }}>
      {status}
    </span>
  );
}

function PrintBar({ used, allowed, memberId, onUpdate }: { used: number; allowed: number; memberId: string; onUpdate: (id: string, used: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal]         = useState(String(used));
  const [saving, setSaving]   = useState(false);
  const pct   = Math.min((used / allowed) * 100, 100);
  const color = pct >= 100 ? "#EF4444" : pct >= 80 ? "#F59E0B" : "#6366F1";

  const save = async () => {
    const n = parseInt(val);
    if (isNaN(n) || n === used) { setEditing(false); return; }
    setSaving(true);
    await supabase.from("members").update({ total_prints_used: n }).eq("id", memberId);
    setSaving(false);
    setEditing(false);
    onUpdate(memberId, n);
  };

  return (
    <div style={{ width: 130 }}>
      {editing ? (
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
          <input
            autoFocus
            type="number" min={0} max={allowed}
            value={val}
            onChange={e => setVal(e.target.value)}
            onBlur={save}
            onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
            style={{ width: 56, padding: "2px 6px", border: "1px solid var(--primary)", borderRadius: 4, fontSize: 12.5, fontFamily: "inherit", outline: "none", background: "var(--neutral)", color: "var(--text-primary)" }}
          />
          <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>/{allowed}</span>
          {saving && <Loader2 size={11} style={{ animation: "spin 1s linear infinite", color: "var(--primary)" }} />}
        </div>
      ) : (
        <div
          title="Click to edit print usage"
          onClick={() => { setVal(String(used)); setEditing(true); }}
          style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 4, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
          {used}/{allowed}
          <span style={{ fontSize: 10, color: "var(--primary)", opacity: 0.7 }}>✏</span>
        </div>
      )}
      <div style={{ height: 5, background: "var(--border)", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 999, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

// ── Inline editable Space Type cell ────────────────────────────────────────
const SPACE_TYPES = ["Dedicated Desk", "Manager Cabin", "Two-Seater Cabin", "Virtual Desk"];

function InlineSpaceType({ value, memberId, onUpdate }: { value: string; memberId: string; onUpdate: (id: string, v: string) => void }) {
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const save = async (v: string) => {
    if (v === value) return;
    setSaving(true);
    await supabase.from("members").update({ space_type: v }).eq("id", memberId);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 1200);
    onUpdate(memberId, v);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <select
        value={value || ""}
        onChange={e => save(e.target.value)}
        style={{ padding: "5px 8px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12.5, fontFamily: "inherit", background: "var(--neutral)", color: "var(--text-primary)", cursor: "pointer", outline: "none", maxWidth: 150 }}
      >
        <option value="">— None —</option>
        {SPACE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      {saving && <Loader2 size={12} style={{ animation: "spin 1s linear infinite", color: "var(--primary)" }} />}
      {saved  && <Check  size={12} color="#10B981" />}
    </div>
  );
}

// ── Inline editable Assigned Space cell ─────────────────────────────────────
function InlineAssignedSpace({ value, memberId, spaceType, allSpaces, occupiedBy, onUpdate }: {
  value: string; memberId: string; spaceType: string;
  allSpaces: { code: string; label: string; type: string; is_active: boolean }[];
  occupiedBy: Record<string, string>; // code → memberId
  onUpdate: (id: string, space: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const save = async (v: string) => {
    if (v === value) return;
    setSaving(true);
    await supabase.from("members").update({ assigned_space: v || null }).eq("id", memberId);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 1200);
    onUpdate(memberId, v);
  };

  // Map space type to DB type
  const dbType = spaceType?.includes("Cabin") ? "Cabin" : spaceType?.includes("Virtual") ? "Virtual Desk" : spaceType?.includes("Meeting") ? "Meeting Room" : "Desk";
  const available = allSpaces.filter(s =>
    s.is_active && (s.type === dbType || !spaceType) &&
    (s.code === value || !occupiedBy[s.code] || occupiedBy[s.code] === memberId)
  );

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <select
        value={value || ""}
        onChange={e => save(e.target.value)}
        style={{ padding: "5px 8px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12.5, fontFamily: "inherit", background: "var(--neutral)", color: value ? "var(--primary)" : "var(--text-muted)", fontWeight: value ? 700 : 400, cursor: "pointer", outline: "none", maxWidth: 130 }}
      >
        <option value="">— None —</option>
        {available.map(s => (
          <option key={s.code} value={s.code}>
            {s.code}{occupiedBy[s.code] && occupiedBy[s.code] !== memberId ? " (taken)" : ""}
          </option>
        ))}
        {/* Always show current value even if not in list */}
        {value && !available.find(s => s.code === value) && (
          <option value={value}>{value}</option>
        )}
      </select>
      {saving && <Loader2 size={12} style={{ animation: "spin 1s linear infinite", color: "var(--primary)" }} />}
      {saved  && <Check  size={12} color="#10B981" />}
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const active = status === "Active";
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", color: active ? "#059669" : "var(--text-muted)" }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: active ? "#10B981" : "var(--tertiary)", display: "inline-block", boxShadow: active ? "0 0 0 3px #D1FAE5" : "none" }} />
      {status}
    </span>
  );
}

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <div style={{ width: 38, height: 38, borderRadius: "50%", background: `${color}20`, border: `2px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function MembersPage() {
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus]  = useState("All");
  const [showModal, setShowModal]        = useState(false);
  const [dbMembers, setDbMembers]        = useState<Member[]>([]);
  const [loading, setLoading]            = useState(true);
  const [occupiedBy, setOccupiedBy]      = useState<Record<string, string>>({});
  const [editMember, setEditMember]      = useState<Member | null>(null);
  const [deleteTarget, setDeleteTarget]  = useState<Member | null>(null);
  const [deleting, setDeleting]          = useState(false);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (!error) {
      setDbMembers(prev => prev.filter(x => x.id !== id));
      setDeleteTarget(null);
    } else {
      alert("Failed to delete member: " + error.message);
    }
    setDeleting(false);
  };

  const { spaces } = useSpaces();
  const { fmt } = useSettings();

  // Build occupiedBy map: space_code → member_id
  useEffect(() => {
    supabase.from("members")
      .select("id, assigned_space")
      .eq("status", "Active")
      .not("assigned_space", "is", null)
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, string> = {};
        data.forEach((r: any) => { if (r.assigned_space) map[r.assigned_space] = r.id; });
        setOccupiedBy(map);
      });
  }, [dbMembers]);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false });
    if (data && data.length > 0) setDbMembers(data as Member[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const source = dbMembers.map(m => ({
    id: m.id, name: m.name, company: m.company ?? "",
    initials: m.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
    phone: m.phone, email: m.email ?? "", dob: m.date_of_birth ?? "—",
    joiningDate: m.joining_date, renewalDate: m.renewal_date ?? "—",
    spaceType: m.space_type ?? "—", assignedSpace: m.assigned_space ?? "—",
    securityDeposit: fmt(m.security_deposit),
    rentAmount: fmt(m.rent_amount),
    paymentStatus: "N/A", teamSize: `${m.team_size}`,
    printsUsed: m.total_prints_used, printsAllowed: m.total_prints_allowed,
    status: m.status, discounted: m.discounted_member,
    source: m.source ?? "—", welcomeStatus: m.welcome_message_status,
    color: ["#6366F1","#F59E0B","#EF4444","#10B981","#8B5CF6","#06B6D4"][Math.abs(m.name.charCodeAt(0)) % 6],
  }));

  const filtered = source.filter(m => {
    const q = search.toLowerCase();
    const matchQ = m.name.toLowerCase().includes(q) ||
                   m.email.toLowerCase().includes(q) ||
                   m.assignedSpace.toLowerCase().includes(q);
    const matchS = filterStatus === "All" || m.status === filterStatus;
    return matchQ && matchS;
  });

  const activeCount   = source.filter(m => m.status === "Active").length;
  const inactiveCount = source.filter(m => m.status === "Inactive").length;

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 16 }}>
      <Loader2 size={40} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }} />
      <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Loading members…</p>
    </div>
  );

  return (
    <div>
      {showModal && <AddMemberModal onClose={() => setShowModal(false)} onSaved={fetchMembers} />}
      {editMember && <EditMemberModal member={editMember} onClose={() => setEditMember(null)} onSaved={fetchMembers} />}
      {deleteTarget && (
        <>
          <div onClick={() => setDeleteTarget(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 999 }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 1000, width: "min(400px,95vw)", background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "0 20px 48px rgba(0,0,0,0.18)", padding: 24 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <Trash2 size={20} color="#EF4444" />
              Delete Member
            </div>
            <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 20 }}>
              Are you sure you want to permanently delete <strong>{deleteTarget.name}</strong>? This action will remove their record from the database and cannot be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setDeleteTarget(null)} disabled={deleting} style={{ padding: "8px 16px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)", color: "var(--text-secondary)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteTarget.id)} disabled={deleting} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", background: "#EF4444", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                {deleting ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : null}
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2, marginBottom: 6 }}>Member Directory</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Manage your coworking community and space allocations from one centralized suite.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
        <KpiCard icon={Users} iconColor="#6366F1" iconBg="#EDE9FE" label="Total Active Members" value={activeCount} />
        <KpiCard icon={AlertCircle} iconColor="#EF4444" iconBg="#FEE2E2" label="Inactive Members" value={inactiveCount} />
        <KpiCard icon={Building2} iconColor="#4F5D70" iconBg="#E2E8F0" label="Total Members" value={source.length} />
        <KpiCard icon={TrendingUp} iconColor="#6366F1" iconBg="#EDE9FE" label="Showing" value={filtered.length} />
      </div>

      {/* Table Card */}
      <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", overflow: "hidden", marginBottom: 28 }}>
        {/* Table Controls */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {/* Search */}
            <div style={{ position: "relative" }}>
              <Search size={14} color="var(--tertiary)" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filter by name, space or email…"
                style={{ paddingLeft: 34, paddingRight: 14, paddingTop: 8, paddingBottom: 8, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontFamily: "inherit", background: "var(--neutral)", color: "var(--text-primary)", outline: "none", width: 280 }}
                onFocus={e => (e.currentTarget.style.borderColor = "var(--primary)")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>
            {/* Status filter */}
            {["All", "Active", "Inactive"].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: "7px 14px", borderRadius: "var(--radius-sm)", border: `1px solid ${filterStatus === s ? "var(--primary)" : "var(--border)"}`, background: filterStatus === s ? "rgba(99,102,241,0.09)" : "var(--surface)", color: filterStatus === s ? "var(--primary)" : "var(--text-secondary)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                {s}
              </button>
            ))}
            <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>
              <Filter size={13} /> Filters
            </button>
          </div>
          <button onClick={() => setShowModal(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            <UserPlus size={15} /> Add Member
          </button>
        </div>

        {/* Table — columns #0 (#) and #1 (Name) are sticky-frozen */}
        <div style={{ overflowX: "auto", position: "relative" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 1600 }}>
            <thead>
              <tr style={{ background: "var(--neutral-dark)" }}>
                {/* Frozen: # */}
                <th style={{
                  padding: "13px 14px", textAlign: "left", fontSize: 11, fontWeight: 700,
                  color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em",
                  whiteSpace: "nowrap", borderBottom: "1px solid var(--border)",
                  position: "sticky", left: 0, zIndex: 3, background: "var(--neutral-dark)",
                  width: 52, minWidth: 52,
                }}>#</th>
                {/* Frozen: Name */}
                <th style={{
                  padding: "13px 18px", textAlign: "left", fontSize: 11, fontWeight: 700,
                  color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em",
                  whiteSpace: "nowrap", borderBottom: "1px solid var(--border)",
                  position: "sticky", left: 52, zIndex: 3, background: "var(--neutral-dark)",
                  boxShadow: "4px 0 8px -2px rgba(0,0,0,0.08)",
                  minWidth: 200,
                }}>Name</th>
                {/* Scrollable headers */}
                {["Phone", "Email", "Date of Birth", "Joining Date", "Renewal Date", "Space Type", "Assigned Space", "Sec. Deposit", "Payment Status", "Team Size", "Print Usage", "Member Status", "Actions"].map(h => (
                  <th key={h} style={{
                    padding: "13px 18px", textAlign: "left", fontSize: 11, fontWeight: 700,
                    color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em",
                    whiteSpace: "nowrap", borderBottom: "1px solid var(--border)",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <tr key={m.id}
                  style={{ borderBottom: "1px solid var(--border-light)", transition: "background 0.15s" }}
                  onMouseEnter={e => {
                    const cells = (e.currentTarget as HTMLElement).querySelectorAll('td');
                    cells.forEach(c => (c as HTMLElement).style.background = "var(--neutral)");
                  }}
                  onMouseLeave={e => {
                    const cells = (e.currentTarget as HTMLElement).querySelectorAll('td');
                    cells.forEach(c => (c as HTMLElement).style.background = "var(--surface)");
                  }}
                >
                  {/* Frozen: Serial # */}
                  <td style={{
                    padding: "14px 14px", whiteSpace: "nowrap",
                    position: "sticky", left: 0, zIndex: 2,
                    background: "var(--surface)",
                    fontSize: 12.5, fontWeight: 700, color: "var(--text-muted)",
                    width: 52, minWidth: 52,
                    borderBottom: "1px solid var(--border-light)",
                  }}>{i + 1}</td>
                  {/* Frozen: Name */}
                  <td style={{
                    padding: "14px 18px", whiteSpace: "nowrap",
                    position: "sticky", left: 52, zIndex: 2,
                    background: "var(--surface)",
                    boxShadow: "4px 0 8px -2px rgba(0,0,0,0.08)",
                    borderBottom: "1px solid var(--border-light)",
                    minWidth: 200,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar initials={m.initials} color={m.color} />
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--primary)" }}>{m.name}</div>
                        <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{m.company}</div>
                      </div>
                    </div>
                  </td>
                  {/* Scrollable cells */}
                  <td style={{ padding: "14px 18px", fontSize: 13.5, color: "var(--text-primary)", whiteSpace: "nowrap", background: "var(--surface)", borderBottom: "1px solid var(--border-light)" }}>{m.phone}</td>
                  <td style={{ padding: "14px 18px", fontSize: 13.5, color: "var(--text-primary)", whiteSpace: "nowrap", background: "var(--surface)", borderBottom: "1px solid var(--border-light)" }}>{m.email}</td>
                  <td style={{ padding: "14px 18px", fontSize: 13.5, color: "var(--text-primary)", whiteSpace: "nowrap", background: "var(--surface)", borderBottom: "1px solid var(--border-light)" }}>{m.dob}</td>
                  <td style={{ padding: "14px 18px", fontSize: 13.5, color: "var(--text-primary)", whiteSpace: "nowrap", background: "var(--surface)", borderBottom: "1px solid var(--border-light)" }}>{m.joiningDate}</td>
                  <td style={{ padding: "14px 18px", fontSize: 13.5, color: "var(--text-primary)", whiteSpace: "nowrap", background: "var(--surface)", borderBottom: "1px solid var(--border-light)" }}>{m.renewalDate}</td>
                  <td style={{ padding: "14px 18px", whiteSpace: "nowrap", background: "var(--surface)", borderBottom: "1px solid var(--border-light)" }}>
                    <InlineSpaceType
                      value={m.spaceType === "—" ? "" : m.spaceType}
                      memberId={m.id}
                      onUpdate={(id, v) => setDbMembers(prev => prev.map(x => x.id === id ? { ...x, space_type: v } as Member : x))}
                    />
                  </td>
                  <td style={{ padding: "14px 18px", whiteSpace: "nowrap", background: "var(--surface)", borderBottom: "1px solid var(--border-light)" }}>
                    <InlineAssignedSpace
                      value={m.assignedSpace === "—" ? "" : m.assignedSpace}
                      memberId={m.id}
                      spaceType={m.spaceType === "—" ? "" : m.spaceType}
                      allSpaces={spaces}
                      occupiedBy={occupiedBy}
                      onUpdate={(id, v) => {
                        setDbMembers(prev => prev.map(x => x.id === id ? { ...x, assigned_space: v } : x));
                        setOccupiedBy(prev => {
                          const next = { ...prev };
                          // Remove old assignment
                          Object.keys(next).forEach(k => { if (next[k] === id) delete next[k]; });
                          if (v) next[v] = id;
                          return next;
                        });
                      }}
                    />
                  </td>
                  <td style={{ padding: "14px 18px", fontSize: 13.5, color: "var(--text-primary)", whiteSpace: "nowrap", background: "var(--surface)", borderBottom: "1px solid var(--border-light)" }}>{m.securityDeposit}</td>
                  <td style={{ padding: "14px 18px", whiteSpace: "nowrap", background: "var(--surface)", borderBottom: "1px solid var(--border-light)" }}><PayBadge status={m.paymentStatus} /></td>
                  <td style={{ padding: "14px 18px", fontSize: 13.5, color: "var(--text-primary)", whiteSpace: "nowrap", background: "var(--surface)", borderBottom: "1px solid var(--border-light)" }}>{m.teamSize}</td>
                  <td style={{ padding: "14px 18px", whiteSpace: "nowrap", background: "var(--surface)", borderBottom: "1px solid var(--border-light)" }}>
                    <PrintBar
                      used={m.printsUsed}
                      allowed={m.printsAllowed}
                      memberId={m.id}
                      onUpdate={(id, newUsed) =>
                        setDbMembers(prev => prev.map(x => x.id === id ? { ...x, total_prints_used: newUsed } : x))
                      }
                    />
                  </td>
                  <td style={{ padding: "14px 18px", whiteSpace: "nowrap", background: "var(--surface)", borderBottom: "1px solid var(--border-light)" }}><StatusDot status={m.status} /></td>
                   {/* Edit & Delete buttons */}
                  <td style={{ padding: "14px 18px", whiteSpace: "nowrap", background: "var(--surface)", borderBottom: "1px solid var(--border-light)" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => setEditMember(dbMembers.find(x => x.id === m.id) ?? null)}
                        style={{
                          display: "flex", alignItems: "center", gap: 5,
                          padding: "6px 12px",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius-sm)",
                          background: "var(--neutral)",
                          color: "var(--text-secondary)",
                          fontSize: 12.5, fontWeight: 600,
                          cursor: "pointer", fontFamily: "inherit",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.09)";
                          (e.currentTarget as HTMLElement).style.color = "var(--primary)";
                          (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)";
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.background = "var(--neutral)";
                          (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                          (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                        }}
                      >
                        <Pencil size={13} strokeWidth={2} />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(dbMembers.find(x => x.id === m.id) ?? null)}
                        style={{
                          display: "flex", alignItems: "center", gap: 5,
                          padding: "6px 12px",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius-sm)",
                          background: "var(--neutral)",
                          color: "#EF4444",
                          fontSize: 12.5, fontWeight: 600,
                          cursor: "pointer", fontFamily: "inherit",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.background = "#FEE2E2";
                          (e.currentTarget as HTMLElement).style.borderColor = "#FCA5A5";
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.background = "var(--neutral)";
                          (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                        }}
                      >
                        <Trash2 size={13} strokeWidth={2} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={15} style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>No members match your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: "16px 24px", background: "var(--neutral)", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
            Showing <strong style={{ color: "var(--text-primary)" }}>1–{filtered.length}</strong> of <strong style={{ color: "var(--text-primary)" }}>1,248</strong> members
          </span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)", cursor: "pointer" }}>
              <ChevronLeft size={15} color="var(--text-secondary)" />
            </button>
            {[1, 2, 3].map(page => (
              <button key={page} style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${page === 1 ? "var(--primary)" : "var(--border)"}`, borderRadius: "var(--radius-sm)", background: page === 1 ? "var(--primary)" : "var(--surface)", color: page === 1 ? "#fff" : "var(--text-secondary)", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                {page}
              </button>
            ))}
            <span style={{ color: "var(--text-muted)", fontSize: 14 }}>…</span>
            <button style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", fontFamily: "inherit" }}>312</button>
            <button style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)", cursor: "pointer" }}>
              <ChevronRight size={15} color="var(--text-secondary)" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bento Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
        {/* Activity Bar Chart */}
        <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "24px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)" }}>New Member Activity</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Onboardings per day this week</div>
            </div>
            <button style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>View Analytics</button>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 160, paddingBottom: 28, position: "relative" }}>
            {barData.map((h, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
                <div
                  style={{ width: "100%", borderRadius: "6px 6px 0 0", background: i === 3 ? "var(--primary)" : "rgba(99,102,241,0.18)", height: `${h}%`, transition: "background 0.2s", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = i === 3 ? "var(--primary-dark)" : "rgba(99,102,241,0.35)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = i === 3 ? "var(--primary)" : "rgba(99,102,241,0.18)"}
                />
                <span style={{ fontSize: 11.5, color: "var(--text-muted)", position: "absolute", bottom: 4, left: `calc(${(i / barData.length) * 100}% + ${(100 / barData.length / 2)}%)`, transform: "translateX(-50%)" }}>{barDays[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Space Utilization Card */}
        <div style={{ background: "var(--primary)", borderRadius: "var(--radius)", padding: "28px 24px", boxShadow: "var(--shadow-md)", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
          {/* decorative blobs */}
          <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, background: "rgba(255,255,255,0.08)", borderRadius: "50%", filter: "blur(30px)" }} />
          <div style={{ position: "absolute", bottom: -40, left: -40, width: 140, height: 140, background: "rgba(255,255,255,0.05)", borderRadius: "50%", filter: "blur(25px)" }} />
          <div style={{ position: "relative" }}>
            <Zap size={36} color="rgba(255,255,255,0.9)" fill="rgba(255,255,255,0.9)" style={{ marginBottom: 16 }} />
            <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 10 }}>Space Utilization</div>
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>
              Dedicated Desks at <strong>94% capacity</strong>. Consider opening the waitlist for next quarter.
            </p>
          </div>
          <button style={{ width: "100%", background: "#fff", color: "var(--primary)", border: "none", borderRadius: "var(--radius-sm)", padding: "11px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            Optimize Inventory <TrendingUp size={15} />
          </button>
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        style={{ position: "fixed", bottom: 32, right: 32, width: 52, height: 52, borderRadius: "50%", background: "var(--primary)", color: "#fff", border: "none", boxShadow: "var(--shadow-md)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, transition: "transform 0.2s" }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "scale(1.1)"}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "scale(1)"}
        title="Add Member"
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>
    </div>
  );
}
