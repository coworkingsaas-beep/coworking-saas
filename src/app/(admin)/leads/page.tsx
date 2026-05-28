"use client";
import { useState, useEffect, useCallback } from "react";
import {
  UserPlus, CheckCircle2, XCircle, Clock, Search, Plus,
  Phone, Camera, Globe, Users, Star, Flame, Snowflake,
  Loader2, ChevronRight, UserCheck, AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ── Types ─────────────────────────────────────────────────────────────────────
type VerifStatus = "Pending" | "Approved" | "Rejected";
type LeadStatus  = "Hot" | "Cold" | "Converted" | "Lost";
type LeadSource  = "Instagram" | "Google" | "Referral" | "Walk-in" | "Other" | "Direct";

interface SignupLead {
  id: string; name: string; phone: string; email: string;
  company: string | null; date_of_birth: string | null;
  space_type: string | null; team_size: number; source: string;
  verification_status: VerifStatus;
  signed_up_at: string; reviewed_at: string | null;
  rejection_reason: string | null; converted_member_id: string | null;
}

interface ManualLead {
  id: string; name: string; phone: string; source: string;
  status: LeadStatus; notes: string; dateAdded: string;
}

// ── Config ────────────────────────────────────────────────────────────────────
const VERIF_CFG: Record<VerifStatus, { bg: string; color: string; icon: React.ElementType; label: string }> = {
  Pending:  { bg: "#FEF3C7", color: "#92400E", icon: Clock,        label: "Pending" },
  Approved: { bg: "#D1FAE5", color: "#065F46", icon: CheckCircle2, label: "Approved" },
  Rejected: { bg: "#FEE2E2", color: "#991B1B", icon: XCircle,      label: "Rejected" },
};

const SOURCE_COLOR: Record<string, string> = {
  Instagram: "#E1306C", Google: "#4285F4", Referral: "#10B981",
  "Walk-in": "#F59E0B", Other: "#8B5CF6", Direct: "#6366F1",
};

const MEM_COLORS = ["#6366F1","#F59E0B","#EF4444","#10B981","#8B5CF6","#06B6D4","#F97316","#14B8A6"];

function VerifBadge({ status }: { status: VerifStatus }) {
  const c = VERIF_CFG[status];
  const Icon = c.icon;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 700, background: c.bg, color: c.color, padding: "3px 10px", borderRadius: 999 }}><Icon size={11} strokeWidth={2.5}/> {c.label}</span>;
}

function Avatar({ name, idx }: { name: string; idx: number }) {
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const color = MEM_COLORS[idx % MEM_COLORS.length];
  return <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${color}20`, border: `2px solid ${color}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color, flexShrink: 0 }}>{initials}</div>;
}

// ── Reject Modal ──────────────────────────────────────────────────────────────
function RejectModal({ lead, onClose, onDone }: { lead: SignupLead; onClose: () => void; onDone: () => void }) {
  const [reason,  setReason]  = useState("");
  const [saving,  setSaving]  = useState(false);
  const submit = async () => {
    setSaving(true);
    await supabase.from("signup_leads").update({
      verification_status: "Rejected",
      rejection_reason: reason.trim() || "Your application was not approved.",
      reviewed_at: new Date().toISOString(),
      reviewed_by: "Admin",
    }).eq("id", lead.id);
    setSaving(false); onDone(); onClose();
  };
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 99 }}/>
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 100, width: "min(480px,95vw)", background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "0 24px 64px rgba(0,0,0,0.18)", padding: 28 }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>Reject Application</div>
        <div style={{ fontSize: 13.5, color: "var(--text-muted)", marginBottom: 18 }}>Rejecting <strong>{lead.name}</strong> — optionally provide a reason.</div>
        <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for rejection (optional)…" rows={3}
          style={{ width: "100%", padding: "9px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontFamily: "inherit", background: "var(--neutral)", color: "var(--text-primary)", outline: "none", resize: "vertical", boxSizing: "border-box" }}/>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
          <button onClick={onClose} style={{ padding: "9px 18px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)", color: "var(--text-secondary)", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={submit} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 20px", background: "#EF4444", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            {saving ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }}/> : <XCircle size={13}/>} Reject
          </button>
        </div>
      </div>
    </>
  );
}

// ── Convert to Member Modal ───────────────────────────────────────────────────
function ConvertModal({ lead, onClose, onDone }: { lead: SignupLead; onClose: () => void; onDone: () => void }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    joining_date: today, renewal_date: "", assigned_space: "",
    rent_amount: "0", security_deposit: "0",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setError(null); setSaving(true);
    // Insert into members
    const { data: member, error: mErr } = await supabase.from("members").insert({
      name: lead.name, phone: lead.phone, email: lead.email,
      company: lead.company ?? null, date_of_birth: lead.date_of_birth ?? null,
      space_type: lead.space_type ?? null, team_size: lead.team_size,
      source: lead.source, status: "Active",
      joining_date: form.joining_date,
      renewal_date: form.renewal_date || null,
      assigned_space: form.assigned_space || null,
      rent_amount: parseFloat(form.rent_amount) || 0,
      security_deposit: parseFloat(form.security_deposit) || 0,
      discounted_member: false, total_prints_used: 0,
      total_prints_allowed: 500, welcome_message_status: "Pending",
      duplicate_entry_flag: false,
    }).select("id").single();

    if (mErr) { setSaving(false); setError(mErr.message); return; }

    // Update lead to Approved + link member
    await supabase.from("signup_leads").update({
      verification_status: "Approved",
      converted_member_id: member.id,
      reviewed_at: new Date().toISOString(),
      reviewed_by: "Admin",
    }).eq("id", lead.id);

    setSaving(false); onDone(); onClose();
  };

  const inpStyle: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontFamily: "inherit", background: "var(--neutral)", color: "var(--text-primary)", outline: "none", boxSizing: "border-box" };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 99 }}/>
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 100, width: "min(540px,95vw)", maxHeight: "90vh", display: "flex", flexDirection: "column", background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)", marginBottom: 2 }}>Convert to Member</div>
          <div style={{ fontSize: 13.5, color: "var(--text-muted)" }}>{lead.name} · {lead.email}</div>
        </div>
        <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              { label: "Joining Date", key: "joining_date", type: "date" },
              { label: "Renewal Date", key: "renewal_date", type: "date" },
              { label: "Assigned Space", key: "assigned_space", type: "text", placeholder: "e.g. D-5" },
              { label: "Monthly Rent (₹)", key: "rent_amount", type: "number" },
              { label: "Security Deposit (₹)", key: "security_deposit", type: "number" },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{label}</label>
                <input type={type} value={(form as any)[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder} style={inpStyle}/>
              </div>
            ))}
          </div>
          {error && <div style={{ marginTop: 14, padding: "8px 12px", background: "#FEE2E2", borderRadius: 6, fontSize: 13, color: "#991B1B", fontWeight: 600 }}>{error}</div>}
        </div>
        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: "9px 18px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)", color: "var(--text-secondary)", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={submit} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 20px", background: "#059669", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            {saving ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }}/> : <UserCheck size={13}/>} {saving ? "Converting…" : "Approve & Convert"}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Quick Approve (no member conversion) ─────────────────────────────────────
async function quickApprove(leadId: string) {
  await supabase.from("signup_leads").update({
    verification_status: "Approved",
    reviewed_at: new Date().toISOString(),
    reviewed_by: "Admin",
  }).eq("id", leadId);
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LeadsPage() {
  const [signupLeads, setSignupLeads] = useState<SignupLead[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [statusFilter,setStatusFilter]= useState("All");
  const [rejectTarget,setRejectTarget]= useState<SignupLead | null>(null);
  const [convertTarget,setConvertTarget]= useState<SignupLead | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [tab, setTab] = useState<"signup" | "manual">("signup");

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("signup_leads").select("*").order("signed_up_at", { ascending: false });
    setSignupLeads((data ?? []) as SignupLead[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = signupLeads.filter(l => {
    const q  = search.toLowerCase();
    const mq = l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.phone.includes(q);
    const sf = statusFilter === "All" || l.verification_status === statusFilter;
    return mq && sf;
  });

  const pending  = signupLeads.filter(l => l.verification_status === "Pending").length;
  const approved = signupLeads.filter(l => l.verification_status === "Approved").length;
  const rejected = signupLeads.filter(l => l.verification_status === "Rejected").length;

  const thS: React.CSSProperties = { padding: "11px 14px", textAlign: "left", fontSize: 10.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", borderBottom: "1px solid var(--border)", background: "var(--neutral-dark)" };
  const tdS: React.CSSProperties = { padding: "12px 14px", background: "var(--surface)", borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap" };

  return (
    <div>
      {rejectTarget  && <RejectModal  lead={rejectTarget}  onClose={() => setRejectTarget(null)}  onDone={load}/>}
      {convertTarget && <ConvertModal lead={convertTarget} onClose={() => setConvertTarget(null)} onDone={load}/>}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 26, flexWrap: "wrap", gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>Leads & Sign-ups</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Review signup requests and approve or reject member access.</p>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { icon: UserPlus,    iconBg: "#EDE9FE", iconColor: "#6366F1", label: "Total Sign-ups", value: signupLeads.length },
          { icon: Clock,       iconBg: "#FEF3C7", iconColor: "#D97706", label: "Pending Review",  value: pending, accent: pending > 0 },
          { icon: CheckCircle2,iconBg: "#D1FAE5", iconColor: "#059669", label: "Approved",         value: approved },
          { icon: XCircle,     iconBg: "#FEE2E2", iconColor: "#EF4444", label: "Rejected",         value: rejected },
        ].map(({ icon: Icon, iconBg, iconColor, label, value, accent }) => (
          <div key={label} style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: `1px solid ${accent ? "#FDE68A" : "var(--border)"}`, padding: "18px 20px", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}><Icon size={19} color={iconColor} strokeWidth={1.8}/></div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: accent ? "#D97706" : "var(--text-primary)" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Pending alert */}
      {pending > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "var(--radius-sm)", marginBottom: 20, fontSize: 13.5, color: "#92400E", fontWeight: 600 }}>
          <AlertCircle size={16}/> {pending} sign-up request{pending > 1 ? "s" : ""} awaiting your review.
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ position: "relative" }}>
          <Search size={14} color="var(--tertiary)" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, phone…"
            style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontFamily: "inherit", background: "var(--neutral)", color: "var(--text-primary)", outline: "none", width: 240 }}
            onFocus={e => (e.currentTarget.style.borderColor = "var(--primary)")}
            onBlur={e  => (e.currentTarget.style.borderColor = "var(--border)")}/>
        </div>
        {["All", "Pending", "Approved", "Rejected"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: "5px 13px", borderRadius: "var(--radius-sm)", border: `1px solid ${statusFilter === s ? "var(--primary)" : "var(--border)"}`, background: statusFilter === s ? "rgba(99,102,241,0.09)" : "var(--surface)", color: statusFilter === s ? "var(--primary)" : "var(--text-secondary)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{s}</button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48, gap: 12 }}>
            <Loader2 size={28} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }}/><span style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading…</span>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 1000 }}>
              <thead>
                <tr>
                  {["#", "Applicant", "Phone", "Email", "Space Interest", "Team", "Source", "Signed Up", "Status", "Actions"].map(h => (
                    <th key={h} style={thS}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={10} style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
                    {signupLeads.length === 0 ? "No signup requests yet." : "No results match your filters."}
                  </td></tr>
                )}
                {filtered.map((l, i) => (
                  <tr key={l.id}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).querySelectorAll("td").forEach(c => (c as HTMLElement).style.background = "var(--neutral)")}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).querySelectorAll("td").forEach(c => (c as HTMLElement).style.background = "var(--surface)")}>
                    <td style={{ ...tdS, fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>{i + 1}</td>
                    <td style={tdS}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <Avatar name={l.name} idx={i}/>
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)" }}>{l.name}</div>
                          {l.company && <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{l.company}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={tdS}><span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{l.phone}</span></td>
                    <td style={tdS}><span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{l.email}</span></td>
                    <td style={tdS}>{l.space_type ? <span style={{ fontSize: 12, fontWeight: 700, color: "#6366F1", background: "#EDE9FE", padding: "2px 8px", borderRadius: 6 }}>{l.space_type}</span> : <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>}</td>
                    <td style={tdS}><span style={{ fontSize: 13 }}>{l.team_size}</span></td>
                    <td style={tdS}><span style={{ fontSize: 12, fontWeight: 600, color: SOURCE_COLOR[l.source] ?? "#6366F1", background: `${SOURCE_COLOR[l.source] ?? "#6366F1"}14`, padding: "2px 8px", borderRadius: 999 }}>{l.source}</span></td>
                    <td style={tdS}>
                      <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{new Date(l.signed_up_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{new Date(l.signed_up_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
                    </td>
                    <td style={tdS}><VerifBadge status={l.verification_status}/></td>
                    <td style={{ ...tdS, minWidth: 200 }}>
                      {l.verification_status === "Pending" && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => setConvertTarget(l)}
                            style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", background: "#059669", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                            <UserCheck size={11}/> Approve
                          </button>
                          <button onClick={() => setRejectTarget(l)}
                            style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", background: "#FEE2E2", color: "#EF4444", border: "1px solid #FCA5A5", borderRadius: "var(--radius-sm)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                            <XCircle size={11}/> Reject
                          </button>
                        </div>
                      )}
                      {l.verification_status === "Approved" && !l.converted_member_id && (
                        <button onClick={() => setConvertTarget(l)}
                          style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", background: "#EDE9FE", color: "#6366F1", border: "1px solid #C4B5FD", borderRadius: "var(--radius-sm)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                          <ChevronRight size={11}/> Convert to Member
                        </button>
                      )}
                      {l.verification_status === "Approved" && l.converted_member_id && (
                        <span style={{ fontSize: 12, color: "#059669", fontWeight: 700 }}>✓ Member created</span>
                      )}
                      {l.verification_status === "Rejected" && (
                        <span style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>{l.rejection_reason ? `"${l.rejection_reason.slice(0, 40)}…"` : "Rejected"}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ padding: "12px 20px", background: "var(--neutral)", borderTop: "1px solid var(--border)", fontSize: 13, color: "var(--text-muted)" }}>
          Showing <strong style={{ color: "var(--text-primary)" }}>{filtered.length}</strong> of <strong style={{ color: "var(--text-primary)" }}>{signupLeads.length}</strong> requests
        </div>
      </div>
    </div>
  );
}
