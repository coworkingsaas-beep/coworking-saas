"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { CalendarDays, Plus, Loader2, X, Save, Pencil, Trash2, Clock, AlertCircle } from "lucide-react";

interface Booking { id: string; title: string; room: string; date: string; start_time: string; end_time: string; attendees: number; status: string; notes: string | null; booking_ref: string; }
interface Room { code: string; label: string; }
const inp: React.CSSProperties = { width: "100%", padding: "9px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontFamily: "inherit", background: "var(--neutral)", color: "var(--text-primary)", outline: "none", boxSizing: "border-box" };
const foc = (e: React.FocusEvent<any>) => (e.currentTarget.style.borderColor = "var(--primary)");
const blu = (e: React.FocusEvent<any>) => (e.currentTarget.style.borderColor = "var(--border)");

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{label}</label>{children}</div>;
}

function StatusBadge({ s }: { s: string }) {
  const m: Record<string, { bg: string; c: string }> = { Upcoming: { bg: "#DBEAFE", c: "#1D4ED8" }, Ongoing: { bg: "#D1FAE5", c: "#065F46" }, Completed: { bg: "#F1F5F9", c: "#475569" }, Cancelled: { bg: "#FEE2E2", c: "#991B1B" } };
  const p = m[s] ?? m.Upcoming;
  return <span style={{ fontSize: 11.5, fontWeight: 700, background: p.bg, color: p.c, padding: "3px 10px", borderRadius: 999 }}>{s}</span>;
}

function BookingModal({ editing, memberId, memberName, rooms, onClose, onSaved }: { editing: Booking | null; memberId: string; memberName: string; rooms: Room[]; onClose: () => void; onSaved: () => void }) {
  const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })();
  const [form, setForm] = useState(editing ? { title: editing.title, room: editing.room, date: editing.date, start_time: editing.start_time.slice(0,5), end_time: editing.end_time.slice(0,5), attendees: String(editing.attendees), notes: editing.notes ?? "" } : { title: "", room: rooms[0]?.code ?? "MR-A", date: today, start_time: "09:00", end_time: "10:00", attendees: "1", notes: "" });
  const [saving, setSaving] = useState(false); const [error, setError] = useState<string | null>(null);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    if (!form.title.trim()) return setError("Title required.");
    if (form.start_time >= form.end_time) return setError("End time must be after start.");
    setSaving(true);
    const payload = { title: form.title, room: form.room, date: form.date, start_time: form.start_time, end_time: form.end_time, attendees: parseInt(form.attendees) || 1, notes: form.notes || null, member_id: memberId, member_name: memberName, status: "Upcoming" };
    const { error: err } = editing ? await supabase.from("bookings").update(payload).eq("id", editing.id) : await supabase.from("bookings").insert(payload);
    setSaving(false); if (err) return setError(err.message); onSaved(); onClose();
  };
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 99, backdropFilter: "blur(2px)" }}/>
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 100, width: "min(520px,95vw)", maxHeight: "90vh", display: "flex", flexDirection: "column", background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>{editing ? "Edit Booking" : "New Booking"}</div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid var(--border)", background: "var(--neutral)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={14} color="var(--text-muted)"/></button>
        </div>
        <form onSubmit={submit} style={{ overflowY: "auto", flex: 1, padding: 22 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ gridColumn: "span 2" }}><Field label="Title *"><input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Team Meeting" style={inp} onFocus={foc} onBlur={blu}/></Field></div>
            <Field label="Room"><select value={form.room} onChange={e => set("room", e.target.value)} style={{ ...inp, cursor: "pointer" }}>{rooms.map(r => <option key={r.code} value={r.code}>{r.code} — {r.label}</option>)}</select></Field>
            <Field label="Date *"><input type="date" value={form.date} onChange={e => set("date", e.target.value)} style={inp} onFocus={foc} onBlur={blu}/></Field>
            <Field label="Start Time *"><input type="time" value={form.start_time} onChange={e => set("start_time", e.target.value)} style={inp} onFocus={foc} onBlur={blu}/></Field>
            <Field label="End Time *"><input type="time" value={form.end_time} onChange={e => set("end_time", e.target.value)} style={inp} onFocus={foc} onBlur={blu}/></Field>
            <Field label="Attendees"><input type="number" min="1" value={form.attendees} onChange={e => set("attendees", e.target.value)} style={inp} onFocus={foc} onBlur={blu}/></Field>
            <div style={{ gridColumn: "span 2" }}><Field label="Notes"><textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} style={{ ...inp, resize: "vertical" }} onFocus={foc} onBlur={blu}/></Field></div>
          </div>
          {error && <div style={{ marginTop: 12, padding: "8px 12px", background: "#FEE2E2", borderRadius: 6, fontSize: 13, color: "#991B1B", fontWeight: 600 }}>{error}</div>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
            <button type="button" onClick={onClose} style={{ padding: "9px 18px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)", color: "var(--text-secondary)", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 20px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              {saving ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }}/> : <Save size={13}/>}{saving ? "Saving…" : editing ? "Save Changes" : "Create Booking"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default function UserBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms,    setRooms]    = useState<Room[]>([]);
  const [memberId, setMemberId] = useState(""); const [memberName, setMemberName] = useState("");
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false); const [editing, setEditing] = useState<Booking | null>(null);
  const [filter,   setFilter]   = useState("All");

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: m } = await supabase.from("members").select("id,name").eq("email", user.email!).maybeSingle();
    if (m) { setMemberId(m.id); setMemberName(m.name); }
    const [{ data: bk }, { data: sp }] = await Promise.all([
      supabase.from("bookings").select("*").eq("member_id", m?.id ?? "").order("date", { ascending: false }),
      supabase.from("spaces").select("code,label").eq("type", "Meeting Room").eq("is_active", true).order("code"),
    ]);
    setBookings((bk ?? []) as Booking[]);
    setRooms((sp ?? []) as Room[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === "All" ? bookings : bookings.filter(b => b.status === filter);
  const del = async (id: string) => { await supabase.from("bookings").delete().eq("id", id); load(); };
  const thS: React.CSSProperties = { padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid var(--border)", background: "var(--neutral-dark)", whiteSpace: "nowrap" };
  const tdS: React.CSSProperties = { padding: "12px 16px", background: "var(--surface)", borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap" };

  return (
    <div>
      {(showForm || editing) && <BookingModal editing={editing} memberId={memberId} memberName={memberName} rooms={rooms} onClose={() => { setShowForm(false); setEditing(null); }} onSaved={load}/>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>My Bookings</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>View and manage your meeting room reservations.</p>
        </div>
        <button onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(99,102,241,0.3)" }}>
          <Plus size={15}/> New Booking
        </button>
      </div>
      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {["All", "Upcoming", "Ongoing", "Completed", "Cancelled"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 14px", borderRadius: "var(--radius-sm)", border: `1px solid ${filter === f ? "var(--primary)" : "var(--border)"}`, background: filter === f ? "rgba(99,102,241,0.09)" : "var(--surface)", color: filter === f ? "var(--primary)" : "var(--text-secondary)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{f}</button>
        ))}
      </div>
      <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48, gap: 12 }}><Loader2 size={28} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }}/><span style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading…</span></div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 700 }}>
              <thead><tr>{["Ref", "Title", "Room", "Date", "Time", "Attendees", "Status", "Actions"].map(h => <th key={h} style={thS}>{h}</th>)}</tr></thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>{bookings.length === 0 ? "No bookings yet — create your first one!" : "No bookings match the filter."}</td></tr>}
                {filtered.map(b => {
                  const mins = (new Date(`2000-01-01T${b.end_time}`).getTime() - new Date(`2000-01-01T${b.start_time}`).getTime()) / 60000;
                  const dur = mins >= 60 ? `${Math.floor(mins/60)}h${mins%60?` ${mins%60}m`:""}` : `${mins}m`;
                  return (
                    <tr key={b.id}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).querySelectorAll("td").forEach(c => (c as HTMLElement).style.background = "var(--neutral)")}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).querySelectorAll("td").forEach(c => (c as HTMLElement).style.background = "var(--surface)")}>
                      <td style={tdS}><span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-secondary)" }}>{b.booking_ref}</span></td>
                      <td style={{ ...tdS, fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)" }}>{b.title}</td>
                      <td style={tdS}><span style={{ fontWeight: 700, color: "var(--primary)", background: "#EDE9FE", fontSize: 12, padding: "2px 8px", borderRadius: 6 }}>{b.room}</span></td>
                      <td style={tdS}>{new Date(b.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                      <td style={tdS}><div style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} color="var(--text-muted)"/><span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{b.start_time.slice(0,5)}–{b.end_time.slice(0,5)} ({dur})</span></div></td>
                      <td style={tdS}>{b.attendees}</td>
                      <td style={tdS}><StatusBadge s={b.status}/></td>
                      <td style={tdS}>
                        <div style={{ display: "flex", gap: 6 }}>
                          {b.status !== "Completed" && b.status !== "Cancelled" && (
                            <button onClick={() => setEditing(b)} style={{ padding: "5px 10px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--neutral)", color: "var(--text-secondary)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}><Pencil size={11}/> Edit</button>
                          )}
                          <button onClick={() => del(b.id)} style={{ padding: "5px 10px", border: "1px solid #FEE2E2", borderRadius: "var(--radius-sm)", background: "#FFF1F2", color: "#EF4444", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}><Trash2 size={11}/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
