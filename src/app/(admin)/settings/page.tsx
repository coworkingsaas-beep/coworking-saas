"use client";
import { useState, useEffect, useCallback } from "react";
import { Building2, CreditCard, Bell, Shield, Palette, Save, ChevronRight, Plus, Trash2, Loader2, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Space } from "@/lib/useSpaces";
import { useSettings, CURRENCIES, type AppSettings } from "@/lib/useSettings";

const TABS = [
  { id: "profile",       label: "Space Profile",    icon: Building2 },
  { id: "payments",      label: "Payments",         icon: CreditCard },
  { id: "notifications", label: "Notifications",    icon: Bell },
  { id: "access",        label: "Access & Security",icon: Shield },
  { id: "appearance",    label: "Appearance",       icon: Palette },
];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px 12px", border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)", fontSize: 13.5, fontFamily: "inherit",
  background: "var(--neutral)", color: "var(--text-primary)", outline: "none",
};

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--border-light)", gap: 20 }}>
      <div style={{ minWidth: 200 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ flex: 1, maxWidth: 340, display: "flex", justifyContent: "flex-end" }}>{children}</div>
    </div>
  );
}

function Input({ defaultValue, placeholder, value, onChange }: any) {
  return (
    <input defaultValue={defaultValue} value={value} onChange={onChange} placeholder={placeholder}
      style={inputStyle}
      onFocus={e => (e.currentTarget.style.borderColor = "var(--primary)")}
      onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")} />
  );
}

function Toggle({ defaultChecked }: { defaultChecked?: boolean }) {
  const [on, setOn] = useState(defaultChecked ?? false);
  return (
    <button onClick={() => setOn(!on)} style={{ width: 44, height: 24, borderRadius: 999, background: on ? "var(--primary)" : "var(--border)", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
      <span style={{ position: "absolute", top: 3, left: on ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </button>
  );
}

function Select({ options, defaultValue }: { options: string[]; defaultValue?: string }) {
  return (
    <select defaultValue={defaultValue} style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontFamily: "inherit", background: "var(--neutral)", color: "var(--text-primary)", outline: "none", cursor: "pointer" }}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}

// ── Live Capacity Section ─────────────────────────────────────────────────────
function CapacitySection() {
  const [spaces, setSpaces]   = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [newRow, setNewRow]   = useState({ code: "", label: "", type: "Desk" as Space["type"], capacity: 1 });

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("spaces").select("*").order("type").order("code");
    setSpaces((data as Space[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addRow = async () => {
    if (!newRow.code.trim() || !newRow.label.trim()) return;
    const { error } = await supabase.from("spaces").insert({ ...newRow, is_active: true });
    if (!error) { setNewRow({ code: "", label: "", type: "Desk", capacity: 1 }); load(); }
  };

  const deleteRow = async (id: string) => {
    await supabase.from("spaces").delete().eq("id", id);
    load();
  };

  const toggleActive = async (id: string, cur: boolean) => {
    await supabase.from("spaces").update({ is_active: !cur }).eq("id", id);
    setSpaces(s => s.map(x => x.id === id ? { ...x, is_active: !cur } : x));
  };

  const saveAll = async () => {
    setSaving(true);
    for (const s of spaces) {
      await supabase.from("spaces").update({ code: s.code, label: s.label, type: s.type, capacity: s.capacity, is_active: s.is_active }).eq("id", s.id);
    }
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const update = (id: string, field: keyof Space, val: any) =>
    setSpaces(s => s.map(x => x.id === id ? { ...x, [field]: val } : x));

  const byType = (t: string) => spaces.filter(s => s.type === t);
  const thStyle: React.CSSProperties = { padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left", background: "var(--neutral-dark)", borderBottom: "1px solid var(--border)" };
  const tdStyle: React.CSSProperties = { padding: "10px 14px", borderBottom: "1px solid var(--border-light)", verticalAlign: "middle" };
  const cellInput: React.CSSProperties = { ...inputStyle, padding: "6px 8px", fontSize: 13, width: "100%" };

  if (loading) return (
    <div style={{ padding: 32, display: "flex", alignItems: "center", gap: 10, color: "var(--text-muted)" }}>
      <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Loading spaces…
    </div>
  );

  return (
    <div style={{ padding: 20 }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        {(["Desk","Cabin","Meeting Room"] as Space["type"][]).map(t => {
          const cnt = spaces.filter(s => s.type === t && s.is_active).length;
          const colors: Record<string,{bg:string;color:string}> = { Desk: {bg:"#EDE9FE",color:"#6366F1"}, Cabin: {bg:"#D1FAE5",color:"#059669"}, "Meeting Room": {bg:"#DBEAFE",color:"#3B82F6"} };
          const c = colors[t];
          return (
            <div key={t} style={{ background: c.bg, borderRadius: "var(--radius-sm)", padding: "16px 18px" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: c.color }}>{cnt}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: c.color, marginTop: 2 }}>{t}s Active</div>
            </div>
          );
        })}
      </div>

      {/* Tables per type */}
      {(["Desk","Cabin","Meeting Room"] as Space["type"][]).map(type => (
        <div key={type} style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>{type}s</div>
          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Code</th>
                  <th style={thStyle}>Label</th>
                  <th style={thStyle}>Capacity</th>
                  <th style={thStyle}>Active</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {byType(type).length === 0 && (
                  <tr><td colSpan={5} style={{ ...tdStyle, color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: 20 }}>No {type}s yet</td></tr>
                )}
                {byType(type).map(s => (
                  <tr key={s.id} style={{ background: s.is_active ? "var(--surface)" : "var(--neutral)" }}>
                    <td style={tdStyle}><input value={s.code} onChange={e => update(s.id,"code",e.target.value)} style={cellInput} /></td>
                    <td style={tdStyle}><input value={s.label} onChange={e => update(s.id,"label",e.target.value)} style={cellInput} /></td>
                    <td style={{ ...tdStyle, width: 90 }}><input type="number" min={1} value={s.capacity} onChange={e => update(s.id,"capacity",parseInt(e.target.value)||1)} style={cellInput} /></td>
                    <td style={{ ...tdStyle, width: 70 }}>
                      <button onClick={() => toggleActive(s.id, s.is_active)} style={{ width: 36, height: 20, borderRadius: 999, background: s.is_active ? "var(--primary)" : "var(--border)", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                        <span style={{ position: "absolute", top: 2, left: s.is_active ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                      </button>
                    </td>
                    <td style={{ ...tdStyle, width: 40 }}>
                      <button onClick={() => deleteRow(s.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", display: "flex", alignItems: "center" }}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {/* Add row inline for this type */}
                {newRow.type === type && (
                  <tr style={{ background: "rgba(99,102,241,0.04)" }}>
                    <td style={tdStyle}><input value={newRow.code} onChange={e => setNewRow(r=>({...r,code:e.target.value}))} placeholder="D-29" style={cellInput} /></td>
                    <td style={tdStyle}><input value={newRow.label} onChange={e => setNewRow(r=>({...r,label:e.target.value}))} placeholder="Desk 29" style={cellInput} /></td>
                    <td style={tdStyle}><input type="number" min={1} value={newRow.capacity} onChange={e => setNewRow(r=>({...r,capacity:parseInt(e.target.value)||1}))} style={cellInput} /></td>
                    <td style={tdStyle}><span style={{fontSize:12,color:"var(--text-muted)"}}>Active</span></td>
                    <td style={tdStyle}><button onClick={addRow} style={{background:"var(--primary)",color:"#fff",border:"none",borderRadius:"var(--radius-sm)",padding:"5px 10px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Add</button></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <button onClick={() => setNewRow(r=>({...r,type,code:"",label:""}))} style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 700, color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
            <Plus size={13} /> Add {type}
          </button>
        </div>
      ))}

      {/* Save */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={saveAll} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 22px", background: saved ? "#10B981" : "var(--primary)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "background 0.3s" }}>
          {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : saved ? <Check size={14} /> : <Save size={14} />}
          {saving ? "Saving…" : saved ? "Saved!" : "Save Capacity"}
        </button>
      </div>
    </div>
  );
}

function ProfileTab() {
  return (
    <>
      <Section title="Space Details" sub="Basic information about your coworking space">
        <Field label="Space Name" sub="Displayed across all reports"><Input defaultValue="CoSpace Workspaces" /></Field>
        <Field label="Address" sub="Full address for invoices and receipts"><Input defaultValue="42, MG Road, Bangalore, KA 560001" /></Field>
        <Field label="Phone Number"><Input defaultValue="+91 98765 43210" /></Field>
        <Field label="Email Address"><Input defaultValue="admin@cospace.in" /></Field>
        <Field label="GST Number" sub="Used on payment receipts"><Input defaultValue="29AABCU9603R1ZJ" /></Field>
        <Field label="Website" sub="Optional"><Input placeholder="https://cospace.in" /></Field>
      </Section>
      <Section title="Capacity" sub="Live space inventory — desks, cabins, and meeting rooms">
        <CapacitySection />
      </Section>
    </>
  );
}

function PaymentsTab() {
  const { settings, saveSettings, loading } = useSettings();
  const [form, setForm] = useState<AppSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync form when settings load from DB
  useEffect(() => { setForm(settings); }, [settings]);

  const set = <K extends keyof AppSettings>(k: K, v: AppSettings[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    await saveSettings(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const DUE_DAYS = ["1st", "5th", "7th", "10th", "15th", "20th", "25th", "Last day"];
  const dayVal = `${form.monthly_due_day}${form.monthly_due_day === 1 ? "st" : form.monthly_due_day === 5 ? "th" : "th"}`;

  if (loading) return (
    <div style={{ padding: 40, display: "flex", alignItems: "center", gap: 10, color: "var(--text-muted)" }}>
      <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Loading settings…
    </div>
  );

  return (
    <>
      <Section title="Billing Defaults" sub="Applied when creating new payment records">
        <Field label="Currency" sub="All monetary values across the platform use this">
          <select
            value={form.currency}
            onChange={(e) => set("currency", e.target.value)}
            style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontFamily: "inherit", background: "var(--neutral)", color: "var(--text-primary)", outline: "none", cursor: "pointer" }}
          >
            {Object.entries(CURRENCIES).map(([code, meta]) => (
              <option key={code} value={code}>{meta.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Monthly Due Date" sub="Day of month payments are due">
          <select
            value={dayVal}
            onChange={(e) => {
              const n = parseInt(e.target.value);
              set("monthly_due_day", n);
            }}
            style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontFamily: "inherit", background: "var(--neutral)", color: "var(--text-primary)", outline: "none", cursor: "pointer" }}
          >
            {DUE_DAYS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </Field>
        <Field label={`Default Seat Rent (${CURRENCIES[form.currency]?.symbol ?? "₹"})`} sub="Pre-filled for new members">
          <input value={form.default_seat_rent} onChange={(e) => set("default_seat_rent", parseInt(e.target.value) || 0)} type="number" style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
        </Field>
        <Field label={`Default Cabin Rent (${CURRENCIES[form.currency]?.symbol ?? "₹"})`}>
          <input value={form.default_cabin_rent} onChange={(e) => set("default_cabin_rent", parseInt(e.target.value) || 0)} type="number" style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
        </Field>
        <Field label="Security Deposit Multiplier" sub="e.g. 2 = 2× monthly rent">
          <input value={form.deposit_multiplier} onChange={(e) => set("deposit_multiplier", parseFloat(e.target.value) || 0)} type="number" min={0} step={0.5} style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
        </Field>
      </Section>

      <Section title="Overdue Rules">
        <Field label="Grace Period (days)" sub="Days after due date before marking overdue">
          <input value={form.grace_period_days} onChange={(e) => set("grace_period_days", parseInt(e.target.value) || 0)} type="number" min={0} style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
        </Field>
        <Field label="Auto-flag Overdue" sub="Automatically mark as overdue after grace period">
          <button onClick={() => set("auto_flag_overdue", !form.auto_flag_overdue)}
            style={{ width: 44, height: 24, borderRadius: 999, background: form.auto_flag_overdue ? "var(--primary)" : "var(--border)", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
            <span style={{ position: "absolute", top: 3, left: form.auto_flag_overdue ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
          </button>
        </Field>
        <Field label={`Late Fee (${CURRENCIES[form.currency]?.symbol ?? "₹"})`} sub="Optional flat fee added after grace period">
          <input value={form.late_fee} onChange={(e) => set("late_fee", parseInt(e.target.value) || 0)} type="number" min={0} style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
        </Field>
      </Section>

      <Section title="Payment Modes">
        <Field label="Accept Cash">
          <button onClick={() => set("accept_cash", !form.accept_cash)}
            style={{ width: 44, height: 24, borderRadius: 999, background: form.accept_cash ? "var(--primary)" : "var(--border)", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
            <span style={{ position: "absolute", top: 3, left: form.accept_cash ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
          </button>
        </Field>
        <Field label="Accept UPI">
          <button onClick={() => set("accept_upi", !form.accept_upi)}
            style={{ width: 44, height: 24, borderRadius: 999, background: form.accept_upi ? "var(--primary)" : "var(--border)", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
            <span style={{ position: "absolute", top: 3, left: form.accept_upi ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
          </button>
        </Field>
        <Field label="Accept Bank Transfer">
          <button onClick={() => set("accept_bank_transfer", !form.accept_bank_transfer)}
            style={{ width: 44, height: 24, borderRadius: 999, background: form.accept_bank_transfer ? "var(--primary)" : "var(--border)", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
            <span style={{ position: "absolute", top: 3, left: form.accept_bank_transfer ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
          </button>
        </Field>
        <Field label="UPI ID" sub="For QR code on receipts">
          <input value={form.upi_id} onChange={(e) => set("upi_id", e.target.value)} placeholder="cospace@okaxis" style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
        </Field>
      </Section>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8 }}>
        <button onClick={() => setForm(settings)} style={{ padding: "9px 20px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)", color: "var(--text-secondary)", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          Reset
        </button>
        <button onClick={handleSave} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 22px", background: saved ? "#10B981" : "var(--primary)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "background 0.3s" }}>
          {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : saved ? <Check size={14} /> : <Save size={14} />}
          {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>
    </>
  );
}


function NotificationsTab() {
  return (
    <>
      <Section title="Payment Reminders" sub="Automated alerts for upcoming and overdue payments">
        <Field label="Send Payment Reminder" sub="3 days before due date"><Toggle defaultChecked={true} /></Field>
        <Field label="Send Overdue Alert" sub="When payment is past due date"><Toggle defaultChecked={true} /></Field>
        <Field label="Reminder Channel"><Select options={["Email","WhatsApp","Both","Disabled"]} defaultValue="Both" /></Field>
      </Section>
      <Section title="Booking Alerts">
        <Field label="New Booking Notification"><Toggle defaultChecked={true} /></Field>
        <Field label="Conflict Detection Alert" sub="When two bookings overlap"><Toggle defaultChecked={true} /></Field>
        <Field label="Daily Schedule Digest" sub="Summary of today's bookings at 8 AM"><Toggle defaultChecked={false} /></Field>
      </Section>
      <Section title="Lead Notifications">
        <Field label="New Lead Alert"><Toggle defaultChecked={true} /></Field>
        <Field label="Follow-up Reminder" sub="Remind when a hot lead hasn't been contacted"><Toggle defaultChecked={true} /></Field>
        <Field label="Conversion Notification" sub="Alert when a lead converts to member"><Toggle defaultChecked={true} /></Field>
      </Section>
    </>
  );
}

function AccessTab() {
  const admins = [
    { name: "Vaibhav Rajawat", email: "vaibhav@cospace.in", role: "Super Admin", initials: "VR", color: "#6366F1" },
    { name: "Priya Manager",   email: "priya@cospace.in",   role: "Manager",     initials: "PM", color: "#10B981" },
  ];
  return (
    <>
      <Section title="Admin Users" sub="People who can access this dashboard">
        <div style={{ padding: "4px 0" }}>
          {admins.map(a => (
            <div key={a.email} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--border-light)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${a.color}20`, border: `2px solid ${a.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: a.color }}>{a.initials}</div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)" }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{a.email}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#6366F1", background: "#EDE9FE", padding: "3px 10px", borderRadius: 999 }}>{a.role}</span>
                <button style={{ fontSize: 12.5, color: "#EF4444", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Remove</button>
              </div>
            </div>
          ))}
          <div style={{ padding: "12px 20px" }}>
            <button style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 700, color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>+ Invite Admin</button>
          </div>
        </div>
      </Section>
      <Section title="Security">
        <Field label="Two-Factor Authentication" sub="Require 2FA for all admins"><Toggle defaultChecked={false} /></Field>
        <Field label="Session Timeout" sub="Auto-logout after inactivity"><Select options={["30 minutes","1 hour","4 hours","Never"]} defaultValue="1 hour" /></Field>
        <Field label="Login Audit Log" sub="Track all admin sign-ins"><Toggle defaultChecked={true} /></Field>
      </Section>
    </>
  );
}

const THEMES  = [{ id:"system",label:"System",desc:"Follows OS preference" },{ id:"light",label:"Light",desc:"Always light" },{ id:"dark",label:"Dark",desc:"Always dark" }];
const ACCENTS = ["#6366F1","#3B82F6","#10B981","#F59E0B","#EF4444","#8B5CF6","#06B6D4"];

function AppearanceTab() {
  const [theme, setTheme]   = useState("system");
  const [accent, setAccent] = useState("#6366F1");
  return (
    <>
      <Section title="Theme" sub="Choose your preferred color mode">
        <div style={{ display: "flex", gap: 12, padding: "20px" }}>
          {THEMES.map(t => (
            <button key={t.id} onClick={() => setTheme(t.id)} style={{ flex: 1, padding: "16px", border: `2px solid ${theme===t.id?"var(--primary)":"var(--border)"}`, borderRadius: "var(--radius-sm)", background: theme===t.id?"rgba(99,102,241,0.06)":"var(--neutral)", cursor: "pointer", textAlign: "center", fontFamily: "inherit" }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{t.id==="system"?"⚙️":t.id==="light"?"☀️":"🌙"}</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: theme===t.id?"var(--primary)":"var(--text-primary)" }}>{t.label}</div>
              <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </Section>
      <Section title="Accent Color" sub="Primary color used across the UI">
        <div style={{ padding: "20px", display: "flex", gap: 10, alignItems: "center" }}>
          {ACCENTS.map(c => (
            <button key={c} onClick={() => setAccent(c)} style={{ width: 36, height: 36, borderRadius: "50%", background: c, border: `3px solid ${accent===c?"var(--text-primary)":"transparent"}`, cursor: "pointer", outline: "none" }} />
          ))}
          <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 8 }}>Current: <strong style={{ color: accent }}>{accent}</strong></span>
        </div>
      </Section>
      <Section title="Display">
        <Field label="Compact Table Rows" sub="Reduce row height for more data density"><Toggle defaultChecked={false} /></Field>
        <Field label="Show Serial Numbers" sub="# column in all tables"><Toggle defaultChecked={true} /></Field>
        <Field label="Date Format"><Select options={["DD MMM YYYY","DD/MM/YYYY","MM/DD/YYYY","YYYY-MM-DD"]} defaultValue="DD MMM YYYY" /></Field>
      </Section>
    </>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState("profile");
  const content: Record<string, React.ReactNode> = {
    profile: <ProfileTab />, payments: <PaymentsTab />,
    notifications: <NotificationsTab />, access: <AccessTab />, appearance: <AppearanceTab />,
  };
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>Settings</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Configure your coworking space preferences, billing rules, and access control.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24, alignItems: "start" }}>
        <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", overflow: "hidden", boxShadow: "var(--shadow-sm)", position: "sticky", top: 80 }}>
          {TABS.map(t => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", border: "none", borderBottom: "1px solid var(--border-light)", background: active?"rgba(99,102,241,0.07)":"var(--surface)", cursor: "pointer", fontFamily: "inherit" }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "var(--neutral)"; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "var(--surface)"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <t.icon size={16} color={active?"var(--primary)":"var(--tertiary)"} strokeWidth={active?2.2:1.8} />
                  <span style={{ fontSize: 13.5, fontWeight: active?700:500, color: active?"var(--primary)":"var(--text-secondary)" }}>{t.label}</span>
                </div>
                {active && <ChevronRight size={14} color="var(--primary)" />}
              </button>
            );
          })}
        </div>
        <div>
          {content[tab]}
        </div>
      </div>
    </div>
  );
}
