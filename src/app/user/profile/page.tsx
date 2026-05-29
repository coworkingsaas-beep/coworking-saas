"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Member } from "@/lib/supabase";
import { Save, Loader2 } from "lucide-react";
import { useSettings } from "@/lib/useSettings";

const inp: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontFamily: "inherit", background: "var(--neutral)", color: "var(--text-primary)", outline: "none", boxSizing: "border-box" };
const foc = (e: React.FocusEvent<any>) => (e.currentTarget.style.borderColor = "var(--primary)");
const blu = (e: React.FocusEvent<any>) => (e.currentTarget.style.borderColor = "var(--border)");
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{label}</label>{children}</div>;
}

export default function UserProfilePage() {
  const { fmt } = useSettings();
  const [member,  setMember]  = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [form,    setForm]    = useState({ name: "", phone: "", company: "", date_of_birth: "" });

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: m } = await supabase.from("members").select("*").eq("email", user.email!).maybeSingle();
      if (m) { setMember(m as Member); setForm({ name: m.name, phone: m.phone, company: m.company ?? "", date_of_birth: m.date_of_birth ?? "" }); }
      setLoading(false);
    });
  }, []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    if (!form.name.trim()) return setError("Name is required.");
    setSaving(true);
    const { error: err } = await supabase.from("members").update({ name: form.name, phone: form.phone, company: form.company || null, date_of_birth: form.date_of_birth || null }).eq("id", member!.id);
    setSaving(false);
    if (err) return setError(err.message);
    setSaved(true); setTimeout(() => setSaved(false), 2500);
  };

  const initials = member?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) ?? "U";

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}><Loader2 size={36} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }}/></div>;

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>My Profile</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Update your personal information below.</p>
      </div>

      {/* Avatar card */}
      <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: 24, boxShadow: "var(--shadow-sm)", marginBottom: 20, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{initials}</div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", marginBottom: 2 }}>{member?.name}</div>
          <div style={{ fontSize: 13.5, color: "var(--text-muted)" }}>{member?.space_type ?? "No space assigned"} {member?.assigned_space ? `· ${member.assigned_space}` : ""}</div>
          <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, background: member?.status === "Active" ? "#D1FAE5" : "#FEE2E2", color: member?.status === "Active" ? "#065F46" : "#991B1B", padding: "2px 10px", borderRadius: 999 }}>{member?.status}</span>
            {member?.discounted_member && <span style={{ fontSize: 11.5, fontWeight: 700, background: "#FEF3C7", color: "#92400E", padding: "2px 10px", borderRadius: 999 }}>Discounted</span>}
          </div>
        </div>
      </div>

      {/* Readonly info */}
      <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: 24, boxShadow: "var(--shadow-sm)", marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>Membership Info</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[
            { label: "Member Since", value: member?.joining_date ? new Date(member.joining_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—" },
            { label: "Renewal Date",  value: member?.renewal_date ? new Date(member.renewal_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—" },
            { label: "Monthly Rent",  value: member?.rent_amount ? fmt(member.rent_amount) : "—" },
            { label: "Security Dep.", value: member?.security_deposit ? fmt(member.security_deposit) : "—" },
          ].map(({ label, value }) => (
            <div key={label} style={{ padding: "10px 14px", background: "var(--neutral)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Editable fields */}
      <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: 24, boxShadow: "var(--shadow-sm)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>Edit Details</div>
        <form onSubmit={save}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <Field label="Full Name *"><input value={form.name} onChange={e => set("name", e.target.value)} style={inp} onFocus={foc} onBlur={blu}/></Field>
            <Field label="Phone"><input value={form.phone} onChange={e => set("phone", e.target.value)} style={inp} onFocus={foc} onBlur={blu}/></Field>
            <Field label="Company"><input value={form.company} onChange={e => set("company", e.target.value)} style={inp} onFocus={foc} onBlur={blu}/></Field>
            <Field label="Date of Birth"><input type="date" value={form.date_of_birth} onChange={e => set("date_of_birth", e.target.value)} style={inp} onFocus={foc} onBlur={blu}/></Field>
          </div>
          {error && <div style={{ marginBottom: 12, padding: "8px 12px", background: "#FEE2E2", borderRadius: 6, fontSize: 13, color: "#991B1B", fontWeight: 600 }}>{error}</div>}
          {saved && <div style={{ marginBottom: 12, padding: "8px 12px", background: "#D1FAE5", borderRadius: 6, fontSize: 13, color: "#065F46", fontWeight: 600 }}>✓ Changes saved successfully!</div>}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 22px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              {saving ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }}/> : <Save size={13}/>}{saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
