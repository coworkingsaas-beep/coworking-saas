"use client";
import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSpaces, getOccupiedSpaces } from "@/lib/useSpaces";
import { useSettings } from "@/lib/useSettings";

interface Props { onClose: () => void; onSaved: () => void; }

const SOURCES = ["Direct","Instagram","Google","Referral","Walk-in","Other"];

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
        {label}{required && <span style={{ color: "#EF4444", marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)", fontSize: 13.5, fontFamily: "inherit",
  background: "var(--neutral)", color: "var(--text-primary)", outline: "none", boxSizing: "border-box",
};

export default function AddMemberModal({ onClose, onSaved }: Props) {
  const { symbol } = useSettings();
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [occupied, setOccupied]   = useState<string[]>([]);
  const { spaces, loading: spacesLoading } = useSpaces();

  useEffect(() => {
    getOccupiedSpaces().then(setOccupied);
  }, []);

  // Derive unique space types available in the spaces table
  const spaceTypes = [...new Set(spaces.map(s => s.type))]; // "Desk" | "Cabin" | "Meeting Room"

  const defaultJoining = new Date().toISOString().split("T")[0];
  const defaultRenewal = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split("T")[0];
  })();

  const [form, setForm] = useState({
    name: "", phone: "", email: "", company: "",
    date_of_birth: "", joining_date: defaultJoining,
    renewal_date: defaultRenewal, space_type: "", assigned_space: "",
    security_deposit: "", rent_amount: "", team_size: "1",
    source: "Direct", discounted_member: false,
    total_prints_allowed: "500", notes: "",
  });

  // Set default space_type once spaces load
  useEffect(() => {
    if (spaceTypes.length > 0 && !form.space_type) {
      setForm(f => ({ ...f, space_type: spaceTypes[0] }));
    }
  }, [spaceTypes.join(",")]);

  // Available seats = active spaces of selected type that are not occupied
  const availableSpaces = spaces.filter(s =>
    s.type === form.space_type &&
    s.is_active &&
    !occupied.includes(s.code)
  );

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const handleJoiningDateChange = (dateVal: string) => {
    const d = new Date(dateVal);
    d.setMonth(d.getMonth() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const renewalVal = `${year}-${month}-${day}`;
    setForm(f => ({
      ...f,
      joining_date: dateVal,
      renewal_date: renewalVal
    }));
  };

  // When space_type changes, reset assigned_space
  const setSpaceType = (t: string) => setForm(f => ({ ...f, space_type: t, assigned_space: "" }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) return setError("Name is required.");
    if (!form.phone.trim()) return setError("Phone is required.");
    setLoading(true);
    const { error: err } = await supabase.from("members").insert({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email || null,
      company: form.company || null,
      date_of_birth: form.date_of_birth || null,
      joining_date: form.joining_date,
      renewal_date: form.renewal_date || null,
      space_type: form.space_type || null,
      assigned_space: form.assigned_space || null,
      security_deposit: parseFloat(form.security_deposit) || 0,
      rent_amount: parseFloat(form.rent_amount) || 0,
      team_size: parseInt(form.team_size) || 1,
      source: form.source || null,
      discounted_member: form.discounted_member,
      total_prints_allowed: parseInt(form.total_prints_allowed) || 500,
      total_prints_used: 0,
      notes: form.notes || null,
      status: "Active",
      welcome_message_status: "Pending",
    });
    setLoading(false);
    if (err) return setError(err.message);
    onSaved();
    onClose();
  };

  const focusBorder = (e: React.FocusEvent<any>) => (e.currentTarget.style.borderColor = "var(--primary)");
  const blurBorder  = (e: React.FocusEvent<any>) => (e.currentTarget.style.borderColor = "var(--border)");

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 99, backdropFilter: "blur(2px)" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 100, width: "min(680px, 95vw)", maxHeight: "90vh", display: "flex", flexDirection: "column", background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>

        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)" }}>Add New Member</div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>All fields marked * are required</div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid var(--border)", background: "var(--neutral)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={15} color="var(--text-muted)" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: "auto", flex: 1 }}>
          <div style={{ padding: "24px" }}>

            {/* Basic Info */}
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Basic Information</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              <Field label="Full Name" required>
                <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Rahul Sharma" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
              </Field>
              <Field label="Phone Number" required>
                <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+91 98765 43210" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
              </Field>
              <Field label="Email Address">
                <input value={form.email} onChange={e => set("email", e.target.value)} placeholder="rahul@company.com" type="email" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
              </Field>
              <Field label="Company / Org">
                <input value={form.company} onChange={e => set("company", e.target.value)} placeholder="Lumina Tech" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
              </Field>
              <Field label="Date of Birth">
                <input value={form.date_of_birth} onChange={e => set("date_of_birth", e.target.value)} type="date" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
              </Field>
              <Field label="Source">
                <select value={form.source} onChange={e => set("source", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                  {SOURCES.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </div>

            {/* Space Assignment */}
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Space Assignment</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              <Field label="Joining Date" required>
                <input value={form.joining_date} onChange={e => handleJoiningDateChange(e.target.value)} type="date" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
              </Field>
              <Field label="Renewal Date">
                <input value={form.renewal_date} onChange={e => set("renewal_date", e.target.value)} type="date" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
              </Field>
              <Field label="Space Type">
                {spacesLoading ? (
                  <div style={{ ...inputStyle, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                    <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Loading…
                  </div>
                ) : (
                  <select value={form.space_type} onChange={e => setSpaceType(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="">— Select type —</option>
                    {spaceTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                )}
              </Field>
              <Field label="Assigned Space">
                {spacesLoading ? (
                  <div style={{ ...inputStyle, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                    <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Loading…
                  </div>
                ) : (
                  <select value={form.assigned_space} onChange={e => set("assigned_space", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="">— Select seat —</option>
                    {availableSpaces.map(s => (
                      <option key={s.code} value={s.code}>{s.code} — {s.label}</option>
                    ))}
                    {availableSpaces.length === 0 && form.space_type && (
                      <option disabled>No available {form.space_type}s</option>
                    )}
                  </select>
                )}
                {availableSpaces.length === 0 && form.space_type && !spacesLoading && (
                  <div style={{ fontSize: 11.5, color: "#EF4444", marginTop: 4 }}>All {form.space_type}s are occupied</div>
                )}
              </Field>
              <Field label="Team Size">
                <input value={form.team_size} onChange={e => set("team_size", e.target.value)} type="number" min="1" placeholder="1" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
              </Field>
            </div>

            {/* Financials */}
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Financials</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
              <Field label={`Security Deposit (${symbol})`}>
                <input value={form.security_deposit} onChange={e => set("security_deposit", e.target.value)} type="number" placeholder="8000" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
              </Field>
              <Field label={`Monthly Rent (${symbol})`}>
                <input value={form.rent_amount} onChange={e => set("rent_amount", e.target.value)} type="number" placeholder="4500" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
              </Field>
              <Field label="Prints Allowed">
                <input value={form.total_prints_allowed} onChange={e => set("total_prints_allowed", e.target.value)} type="number" placeholder="500" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
              </Field>
            </div>

            {/* Discounted toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <button type="button" onClick={() => set("discounted_member", !form.discounted_member)}
                style={{ width: 44, height: 24, borderRadius: 999, background: form.discounted_member ? "var(--primary)" : "var(--border)", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                <span style={{ position: "absolute", top: 3, left: form.discounted_member ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
              </button>
              <span style={{ fontSize: 13.5, color: "var(--text-primary)", fontWeight: 600 }}>Discounted Member</span>
            </div>

            <Field label="Notes">
              <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3} placeholder="Any additional notes…"
                style={{ ...inputStyle, resize: "vertical" }} onFocus={focusBorder} onBlur={blurBorder} />
            </Field>

            {error && (
              <div style={{ marginTop: 14, padding: "10px 14px", background: "#FEE2E2", borderRadius: "var(--radius-sm)", fontSize: 13, color: "#991B1B", fontWeight: 600 }}>
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 10, flexShrink: 0, background: "var(--neutral)" }}>
            <button type="button" onClick={onClose} style={{ padding: "9px 20px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)", color: "var(--text-secondary)", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 22px", background: loading ? "var(--tertiary)" : "var(--primary)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {loading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={14} />}
              {loading ? "Saving…" : "Save Member"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
