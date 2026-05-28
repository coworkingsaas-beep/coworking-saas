"use client";
import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Member { id: string; name: string; rent_amount: number; assigned_space: string | null; }
interface Props { onClose: () => void; onSaved: () => void; prefillMemberId?: string; }

const MODES = ["Cash", "UPI", "Bank"];
const inp: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontFamily: "inherit", background: "var(--neutral)", color: "var(--text-primary)", outline: "none", boxSizing: "border-box" };
const f = (e: React.FocusEvent<any>) => (e.currentTarget.style.borderColor = "var(--primary)");
const b = (e: React.FocusEvent<any>) => (e.currentTarget.style.borderColor = "var(--border)");

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

export default function RecordPaymentModal({ onClose, onSaved, prefillMemberId }: Props) {
  const [members, setMembers] = useState<Member[]>([]);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({ member_id: prefillMemberId ?? "", amount: "", mode: "UPI", payment_date: today, month: new Date().toLocaleString("default", { month: "short" }), year: String(new Date().getFullYear()), notes: "" });

  useEffect(() => {
    supabase.from("members").select("id,name,rent_amount,assigned_space").eq("status","Active").order("name")
      .then(({ data }) => { if (data) setMembers(data as Member[]); });
  }, []);

  useEffect(() => {
    const m = members.find(x => x.id === form.member_id);
    if (m) setForm(f => ({ ...f, amount: String(m.rent_amount) }));
  }, [form.member_id, members]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.member_id) return setError("Select a member.");
    if (!form.amount) return setError("Enter amount.");
    setSaving(true);
    const { error: err } = await supabase.from("payments").insert({
      member_id: form.member_id, amount: parseFloat(form.amount), mode: form.mode,
      payment_date: form.payment_date, month: form.month, year: parseInt(form.year),
      notes: form.notes || null, status: "Paid",
    });
    setSaving(false);
    if (err) { setError(err.message); return; }
    onSaved(); onClose();
  };

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:99,backdropFilter:"blur(2px)" }}/>
      <div style={{ position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:100,width:"min(500px,95vw)",background:"var(--surface)",borderRadius:"var(--radius)",border:"1px solid var(--border)",boxShadow:"0 24px 64px rgba(0,0,0,0.18)" }}>
        <div style={{ padding:"20px 24px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div style={{ fontSize:17,fontWeight:800,color:"var(--text-primary)" }}>Record Payment</div>
          <button onClick={onClose} style={{ width:30,height:30,borderRadius:"50%",border:"1px solid var(--border)",background:"var(--neutral)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}><X size={14} color="var(--text-muted)"/></button>
        </div>
        <form onSubmit={submit} style={{ padding:24 }}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14 }}>
            <Field label="Member">
              <select value={form.member_id} onChange={e=>set("member_id",e.target.value)} style={{...inp,cursor:"pointer"}}>
                <option value="">— Select member —</option>
                {members.map(m=><option key={m.id} value={m.id}>{m.name}{m.assigned_space?` (${m.assigned_space})`:""}</option>)}
              </select>
            </Field>
            <Field label="Amount (₹)">
              <input value={form.amount} onChange={e=>set("amount",e.target.value)} type="number" min="0" style={inp} onFocus={f} onBlur={b}/>
            </Field>
            <Field label="Payment Mode">
              <select value={form.mode} onChange={e=>set("mode",e.target.value)} style={{...inp,cursor:"pointer"}}>
                {MODES.map(m=><option key={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Payment Date">
              <input value={form.payment_date} onChange={e=>set("payment_date",e.target.value)} type="date" style={inp} onFocus={f} onBlur={b}/>
            </Field>
            <Field label="Month">
              <select value={form.month} onChange={e=>set("month",e.target.value)} style={{...inp,cursor:"pointer"}}>
                {MONTHS.map(m=><option key={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Year">
              <input value={form.year} onChange={e=>set("year",e.target.value)} type="number" min="2020" style={inp} onFocus={f} onBlur={b}/>
            </Field>
          </div>
          <Field label="Notes">
            <input value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="Optional note…" style={inp} onFocus={f} onBlur={b}/>
          </Field>
          {error&&<div style={{marginTop:12,padding:"8px 12px",background:"#FEE2E2",borderRadius:6,fontSize:13,color:"#991B1B",fontWeight:600}}>{error}</div>}
          <div style={{ display:"flex",justifyContent:"flex-end",gap:10,marginTop:20 }}>
            <button type="button" onClick={onClose} style={{ padding:"9px 20px",border:"1px solid var(--border)",borderRadius:"var(--radius-sm)",background:"var(--surface)",color:"var(--text-secondary)",fontSize:13.5,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ display:"flex",alignItems:"center",gap:6,padding:"9px 22px",background:"var(--primary)",color:"#fff",border:"none",borderRadius:"var(--radius-sm)",fontSize:13.5,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>
              {saving?<Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/>:<Save size={13}/>}
              {saving?"Saving…":"Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
