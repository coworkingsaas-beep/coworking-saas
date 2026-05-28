"use client";
import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSpaces, getOccupiedSpaces } from "@/lib/useSpaces";
import type { Member } from "@/lib/supabase";

interface Props { member: Member; onClose: () => void; onSaved: () => void; }

const SOURCES     = ["Direct","Instagram","Google","Referral","Walk-in","Other"];
const SPACE_TYPES = ["Dedicated Desk","Manager Cabin","Two-Seater Cabin","Virtual Desk"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display:"block", fontSize:12, fontWeight:600, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:6 }}>{label}</label>
      {children}
    </div>
  );
}

const inp: React.CSSProperties = {
  width:"100%", padding:"9px 12px", border:"1px solid var(--border)",
  borderRadius:"var(--radius-sm)", fontSize:13.5, fontFamily:"inherit",
  background:"var(--neutral)", color:"var(--text-primary)", outline:"none", boxSizing:"border-box",
};
const focus = (e: React.FocusEvent<any>) => (e.currentTarget.style.borderColor = "var(--primary)");
const blur  = (e: React.FocusEvent<any>) => (e.currentTarget.style.borderColor = "var(--border)");

export default function EditMemberModal({ member, onClose, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [occupied, setOccupied] = useState<string[]>([]);
  const { spaces, loading: spacesLoading } = useSpaces();

  const [form, setForm] = useState({
    name:               member.name,
    phone:              member.phone,
    email:              member.email ?? "",
    company:            member.company ?? "",
    date_of_birth:      member.date_of_birth ?? "",
    joining_date:       member.joining_date,
    renewal_date:       member.renewal_date ?? "",
    space_type:         member.space_type ?? "",
    assigned_space:     member.assigned_space ?? "",
    security_deposit:   String(member.security_deposit),
    rent_amount:        String(member.rent_amount),
    team_size:          String(member.team_size),
    source:             member.source ?? "Direct",
    discounted_member:  member.discounted_member,
    total_prints_allowed: String(member.total_prints_allowed),
    total_prints_used:    String(member.total_prints_used),
    status:             member.status,
    exit_reason:        member.exit_reason ?? "",
    welcome_message_status: member.welcome_message_status ?? "Pending",
  });

  useEffect(() => {
    getOccupiedSpaces().then(list =>
      // Exclude own space from occupied list
      setOccupied(list.filter(c => c !== member.assigned_space))
    );
  }, [member.assigned_space]);

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const setSpaceType = (t: string) => setForm(f => ({ ...f, space_type: t, assigned_space: "" }));

  const availableSpaces = spaces.filter(s =>
    s.is_active &&
    (s.type === (form.space_type.includes("Cabin") ? "Cabin" : form.space_type.includes("Virtual") ? "Virtual Desk" : form.space_type.includes("Meeting") ? "Meeting Room" : "Desk") || !form.space_type) &&
    !occupied.includes(s.code)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) return setError("Name is required.");
    if (!form.phone.trim()) return setError("Phone is required.");
    setLoading(true);
    const { error: err } = await supabase.from("members").update({
      name:               form.name.trim(),
      phone:              form.phone.trim(),
      email:              form.email || null,
      company:            form.company || null,
      date_of_birth:      form.date_of_birth || null,
      joining_date:       form.joining_date,
      renewal_date:       form.renewal_date || null,
      space_type:         form.space_type || null,
      assigned_space:     form.assigned_space || null,
      security_deposit:   parseFloat(form.security_deposit) || 0,
      rent_amount:        parseFloat(form.rent_amount) || 0,
      team_size:          parseInt(form.team_size) || 1,
      source:             form.source || null,
      discounted_member:  form.discounted_member,
      total_prints_allowed: parseInt(form.total_prints_allowed) || 500,
      total_prints_used:    parseInt(form.total_prints_used) || 0,
      status:             form.status,
      exit_reason:        form.exit_reason || null,
      welcome_message_status: form.welcome_message_status,
    }).eq("id", member.id);
    setLoading(false);
    if (err) return setError(err.message);
    onSaved();
    onClose();
  };

  const SectionLabel = ({ label }: { label: string }) => (
    <div style={{ fontSize:11, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:14 }}>{label}</div>
  );

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:99, backdropFilter:"blur(2px)" }}/>
      <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", zIndex:100, width:"min(720px,95vw)", maxHeight:"92vh", display:"flex", flexDirection:"column", background:"var(--surface)", borderRadius:"var(--radius)", border:"1px solid var(--border)", boxShadow:"0 24px 64px rgba(0,0,0,0.18)" }}>
        {/* Header */}
        <div style={{ padding:"20px 24px", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
          <div>
            <div style={{ fontSize:17, fontWeight:800, color:"var(--text-primary)" }}>Edit Member</div>
            <div style={{ fontSize:12.5, color:"var(--text-muted)", marginTop:2 }}>{member.name} · {member.phone}</div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:"1px solid var(--border)", background:"var(--neutral)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <X size={15} color="var(--text-muted)"/>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ overflowY:"auto", flex:1 }}>
          <div style={{ padding:"24px" }}>

            <SectionLabel label="Basic Information"/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
              <Field label="Full Name *"><input value={form.name} onChange={e=>set("name",e.target.value)} style={inp} onFocus={focus} onBlur={blur}/></Field>
              <Field label="Phone *"><input value={form.phone} onChange={e=>set("phone",e.target.value)} style={inp} onFocus={focus} onBlur={blur}/></Field>
              <Field label="Email"><input value={form.email} onChange={e=>set("email",e.target.value)} type="email" style={inp} onFocus={focus} onBlur={blur}/></Field>
              <Field label="Company"><input value={form.company} onChange={e=>set("company",e.target.value)} style={inp} onFocus={focus} onBlur={blur}/></Field>
              <Field label="Date of Birth"><input value={form.date_of_birth} onChange={e=>set("date_of_birth",e.target.value)} type="date" style={inp} onFocus={focus} onBlur={blur}/></Field>
              <Field label="Source">
                <select value={form.source} onChange={e=>set("source",e.target.value)} style={{...inp,cursor:"pointer"}}>
                  {SOURCES.map(s=><option key={s}>{s}</option>)}
                </select>
              </Field>
            </div>

            <SectionLabel label="Space Assignment"/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
              <Field label="Joining Date"><input value={form.joining_date} onChange={e=>set("joining_date",e.target.value)} type="date" style={inp} onFocus={focus} onBlur={blur}/></Field>
              <Field label="Renewal Date"><input value={form.renewal_date} onChange={e=>set("renewal_date",e.target.value)} type="date" style={inp} onFocus={focus} onBlur={blur}/></Field>
              <Field label="Space Type">
                {spacesLoading
                  ? <div style={{...inp,color:"var(--text-muted)"}}>Loading…</div>
                  : <select value={form.space_type} onChange={e=>setSpaceType(e.target.value)} style={{...inp,cursor:"pointer"}}>
                      <option value="">— Select type —</option>
                      {SPACE_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                    </select>
                }
              </Field>
              <Field label="Assigned Space">
                {spacesLoading
                  ? <div style={{...inp,color:"var(--text-muted)"}}>Loading…</div>
                  : <select value={form.assigned_space} onChange={e=>set("assigned_space",e.target.value)} style={{...inp,cursor:"pointer"}}>
                      <option value="">— None —</option>
                      {/* Always show current even if occupied */}
                      {member.assigned_space && member.assigned_space !== "" && (
                        <option value={member.assigned_space}>{member.assigned_space} (current)</option>
                      )}
                      {availableSpaces
                        .filter(s=>s.code !== member.assigned_space)
                        .map(s=><option key={s.code} value={s.code}>{s.code} — {s.label}</option>)}
                    </select>
                }
              </Field>
              <Field label="Team Size"><input value={form.team_size} onChange={e=>set("team_size",e.target.value)} type="number" min="1" style={inp} onFocus={focus} onBlur={blur}/></Field>
              <Field label="Status">
                <select value={form.status} onChange={e=>set("status",e.target.value)} style={{...inp,cursor:"pointer"}}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </Field>
            </div>

            <SectionLabel label="Financials & Prints"/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:14, marginBottom:20 }}>
              <Field label="Security Deposit (₹)"><input value={form.security_deposit} onChange={e=>set("security_deposit",e.target.value)} type="number" style={inp} onFocus={focus} onBlur={blur}/></Field>
              <Field label="Monthly Rent (₹)"><input value={form.rent_amount} onChange={e=>set("rent_amount",e.target.value)} type="number" style={inp} onFocus={focus} onBlur={blur}/></Field>
              <Field label="Prints Used"><input value={form.total_prints_used} onChange={e=>set("total_prints_used",e.target.value)} type="number" style={inp} onFocus={focus} onBlur={blur}/></Field>
              <Field label="Prints Allowed"><input value={form.total_prints_allowed} onChange={e=>set("total_prints_allowed",e.target.value)} type="number" style={inp} onFocus={focus} onBlur={blur}/></Field>
            </div>

            <SectionLabel label="Other"/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 }}>
              <Field label="Welcome Message">
                <select value={form.welcome_message_status} onChange={e=>set("welcome_message_status",e.target.value)} style={{...inp,cursor:"pointer"}}>
                  <option value="Pending">Pending</option>
                  <option value="Sent">Sent</option>
                </select>
              </Field>
              <Field label="Exit Reason"><input value={form.exit_reason} onChange={e=>set("exit_reason",e.target.value)} placeholder="Only if Inactive" style={inp} onFocus={focus} onBlur={blur}/></Field>
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
              <button type="button" onClick={()=>set("discounted_member",!form.discounted_member)}
                style={{ width:44, height:24, borderRadius:999, background:form.discounted_member?"var(--primary)":"var(--border)", border:"none", cursor:"pointer", position:"relative", transition:"background 0.2s" }}>
                <span style={{ position:"absolute", top:3, left:form.discounted_member?23:3, width:18, height:18, borderRadius:"50%", background:"#fff", transition:"left 0.2s" }}/>
              </button>
              <span style={{ fontSize:13.5, color:"var(--text-primary)", fontWeight:600 }}>Discounted Member</span>
            </div>

            {error&&<div style={{ marginTop:14, padding:"10px 14px", background:"#FEE2E2", borderRadius:"var(--radius-sm)", fontSize:13, color:"#991B1B", fontWeight:600 }}>{error}</div>}
          </div>

          {/* Footer */}
          <div style={{ padding:"16px 24px", borderTop:"1px solid var(--border)", display:"flex", justifyContent:"flex-end", gap:10, flexShrink:0, background:"var(--neutral)" }}>
            <button type="button" onClick={onClose} style={{ padding:"9px 20px", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", background:"var(--surface)", color:"var(--text-secondary)", fontSize:13.5, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 22px", background:loading?"var(--tertiary)":"var(--primary)", color:"#fff", border:"none", borderRadius:"var(--radius-sm)", fontSize:13.5, fontWeight:700, cursor:loading?"not-allowed":"pointer", fontFamily:"inherit" }}>
              {loading?<Loader2 size={14} style={{animation:"spin 1s linear infinite"}}/>:<Save size={14}/>}
              {loading?"Saving…":"Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
