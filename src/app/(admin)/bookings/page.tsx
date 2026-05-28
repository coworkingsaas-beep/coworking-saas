"use client";
import { useState, useEffect, useCallback } from "react";
import { CalendarDays, Clock, CheckCircle, Search, Plus, X, Save, Loader2, Pencil, Trash2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Booking {
  id: string; booking_ref: string; title: string;
  member_id: string | null; member_name: string | null;
  room: string; date: string; start_time: string; end_time: string;
  attendees: number; status: string; notes: string | null; created_at: string;
}
interface MemberOpt { id: string; name: string; }
interface SpaceRoom { id: string; code: string; label: string; }

const STATUSES = ["Upcoming", "Ongoing", "Completed", "Cancelled"];
const COLORS: Record<string, string> = { "#6366F1":"#6366F1","#F59E0B":"#F59E0B","#EF4444":"#EF4444","#10B981":"#10B981","#8B5CF6":"#8B5CF6","#06B6D4":"#06B6D4" };
const MEM_COLORS = ["#6366F1","#F59E0B","#EF4444","#10B981","#8B5CF6","#06B6D4","#F97316","#14B8A6","#EC4899","#84CC16"];

const inp: React.CSSProperties = { width:"100%", padding:"9px 12px", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", fontSize:13.5, fontFamily:"inherit", background:"var(--neutral)", color:"var(--text-primary)", outline:"none", boxSizing:"border-box" };
const foc = (e: React.FocusEvent<any>) => (e.currentTarget.style.borderColor = "var(--primary)");
const blu = (e: React.FocusEvent<any>) => (e.currentTarget.style.borderColor = "var(--border)");

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display:"block", fontSize:12, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:6 }}>
        {label}{required && <span style={{ color:"#EF4444", marginLeft:3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string,{bg:string;color:string}> = {
    Upcoming:  { bg:"#DBEAFE", color:"#1D4ED8" },
    Ongoing:   { bg:"#D1FAE5", color:"#065F46" },
    Completed: { bg:"#F1F5F9", color:"#475569" },
    Cancelled: { bg:"#FEE2E2", color:"#991B1B" },
  };
  const s = map[status] || map.Upcoming;
  return <span style={{ fontSize:11.5, fontWeight:700, background:s.bg, color:s.color, padding:"3px 10px", borderRadius:999 }}>{status}</span>;
}

function Avatar({ name, idx }: { name: string; idx: number }) {
  const initials = name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2);
  const color = MEM_COLORS[idx % MEM_COLORS.length];
  return (
    <div style={{ width:32, height:32, borderRadius:"50%", background:`${color}20`, border:`2px solid ${color}50`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color, flexShrink:0 }}>
      {initials}
    </div>
  );
}

// ── Booking Form (Add / Edit) ─────────────────────────────────────────────────
function BookingModal({ editing, members, rooms, onClose, onSaved }: {
  editing: Booking | null; members: MemberOpt[]; rooms: SpaceRoom[];
  onClose: ()=>void; onSaved: ()=>void;
}) {
  const today = (() => { const d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); })();
  const defaultRoom = rooms[0]?.code ?? "";
  const blank = { title:"", member_id:"", room:defaultRoom, date:today, start_time:"09:00", end_time:"10:00", attendees:"1", status:"Upcoming", notes:"" };
  const [form, setForm] = useState(() =>
    editing ? { title:editing.title, member_id:editing.member_id??"", room:editing.room, date:editing.date, start_time:editing.start_time.slice(0,5), end_time:editing.end_time.slice(0,5), attendees:String(editing.attendees), status:editing.status, notes:editing.notes??"" } : blank
  );
  // Reset room default once rooms load (in case modal opened before fetch completed)
  const [roomDefaultSet, setRoomDefaultSet] = useState(false);
  if (!roomDefaultSet && rooms.length > 0 && !editing && form.room === "") {
    setForm(f => ({ ...f, room: rooms[0].code }));
    setRoomDefaultSet(true);
  }
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string|null>(null);

  const set = (k: string, v: string) => setForm(f=>({...f,[k]:v}));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    if (!form.title.trim()) return setError("Title is required.");
    if (!form.date)         return setError("Date is required.");
    if (form.start_time >= form.end_time) return setError("End time must be after start time.");
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      member_id: form.member_id || null,
      member_name: form.member_id ? members.find(m=>m.id===form.member_id)?.name ?? null : null,
      room: form.room, date: form.date,
      start_time: form.start_time, end_time: form.end_time,
      attendees: parseInt(form.attendees)||1,
      status: form.status, notes: form.notes||null,
    };
    const { error: err } = editing
      ? await supabase.from("bookings").update(payload).eq("id", editing.id)
      : await supabase.from("bookings").insert(payload);
    setSaving(false);
    if (err) return setError(err.message);
    onSaved(); onClose();
  };

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:99,backdropFilter:"blur(2px)" }}/>
      <div style={{ position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:100,width:"min(560px,95vw)",maxHeight:"92vh",display:"flex",flexDirection:"column",background:"var(--surface)",borderRadius:"var(--radius)",border:"1px solid var(--border)",boxShadow:"0 24px 64px rgba(0,0,0,0.18)" }}>
        <div style={{ padding:"20px 24px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0 }}>
          <div>
            <div style={{ fontSize:17,fontWeight:800,color:"var(--text-primary)" }}>{editing?"Edit Booking":"New Booking"}</div>
            <div style={{ fontSize:12.5,color:"var(--text-muted)",marginTop:2 }}>Meeting Room Reservation</div>
          </div>
          <button onClick={onClose} style={{ width:30,height:30,borderRadius:"50%",border:"1px solid var(--border)",background:"var(--neutral)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}><X size={14} color="var(--text-muted)"/></button>
        </div>
        <form onSubmit={submit} style={{ overflowY:"auto",flex:1,padding:24 }}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
            <div style={{ gridColumn:"span 2" }}>
              <Field label="Booking Title" required>
                <input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="e.g. Client Pitch" style={inp} onFocus={foc} onBlur={blu}/>
              </Field>
            </div>
            <Field label="Member">
              <select value={form.member_id} onChange={e=>set("member_id",e.target.value)} style={{...inp,cursor:"pointer"}}>
                <option value="">— Guest / Walk-in —</option>
                {members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </Field>
            <Field label="Room" required>
              <select value={form.room} onChange={e=>set("room",e.target.value)} style={{...inp,cursor:"pointer"}}>
                {rooms.length === 0
                  ? <option value="">No meeting rooms configured</option>
                  : rooms.map(r=><option key={r.code} value={r.code}>{r.code}{r.label && r.label !== r.code ? ` — ${r.label}` : ""}</option>)
                }
              </select>
            </Field>
            <div style={{ gridColumn:"span 2" }}>
              <Field label="Date" required>
                <input value={form.date} onChange={e=>set("date",e.target.value)} type="date" style={inp} onFocus={foc} onBlur={blu}/>
              </Field>
            </div>
            <Field label="Start Time" required>
              <input value={form.start_time} onChange={e=>set("start_time",e.target.value)} type="time" style={inp} onFocus={foc} onBlur={blu}/>
            </Field>
            <Field label="End Time" required>
              <input value={form.end_time} onChange={e=>set("end_time",e.target.value)} type="time" style={inp} onFocus={foc} onBlur={blu}/>
            </Field>
            <Field label="Attendees">
              <input value={form.attendees} onChange={e=>set("attendees",e.target.value)} type="number" min="1" max="20" style={inp} onFocus={foc} onBlur={blu}/>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={e=>set("status",e.target.value)} style={{...inp,cursor:"pointer"}}>
                {STATUSES.map(s=><option key={s}>{s}</option>)}
              </select>
            </Field>
            <div style={{ gridColumn:"span 2" }}>
              <Field label="Notes">
                <textarea value={form.notes} onChange={e=>set("notes",e.target.value)} rows={2} placeholder="Optional…" style={{...inp,resize:"vertical"}} onFocus={foc} onBlur={blu}/>
              </Field>
            </div>
          </div>
          {error && <div style={{ marginTop:12,padding:"8px 12px",background:"#FEE2E2",borderRadius:6,fontSize:13,color:"#991B1B",fontWeight:600 }}>{error}</div>}
          <div style={{ display:"flex",justifyContent:"flex-end",gap:10,marginTop:20 }}>
            <button type="button" onClick={onClose} style={{ padding:"9px 20px",border:"1px solid var(--border)",borderRadius:"var(--radius-sm)",background:"var(--surface)",color:"var(--text-secondary)",fontSize:13.5,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ display:"flex",alignItems:"center",gap:6,padding:"9px 22px",background:"var(--primary)",color:"#fff",border:"none",borderRadius:"var(--radius-sm)",fontSize:13.5,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>
              {saving?<Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/>:<Save size={13}/>}
              {saving?"Saving…":editing?"Save Changes":"Create Booking"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ── Inline time editor ────────────────────────────────────────────────────────
function InlineTime({ bookingId, start, end, onSaved }: { bookingId:string; start:string; end:string; onSaved:()=>void }) {
  const [open,    setOpen]    = useState(false);
  const [s,       setS]       = useState(start.slice(0,5));
  const [e,       setE]       = useState(end.slice(0,5));
  const [saving,  setSaving]  = useState(false);
  const [errMsg,  setErrMsg]  = useState("");

  const save = async () => {
    if (s >= e) { setErrMsg("End must be after start"); return; }
    setSaving(true);
    await supabase.from("bookings").update({ start_time:s, end_time:e }).eq("id", bookingId);
    setSaving(false); setOpen(false); onSaved();
  };

  if (!open) return (
    <div style={{ display:"flex",alignItems:"center",gap:6,cursor:"pointer" }} onClick={()=>setOpen(true)}>
      <span style={{ fontSize:13,color:"var(--text-secondary)" }}>{start.slice(0,5)}–{end.slice(0,5)}</span>
      <Pencil size={11} color="var(--primary)" opacity={0.7}/>
    </div>
  );

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:4,background:"var(--neutral)",border:"1px solid var(--primary)",borderRadius:6,padding:8,minWidth:160 }}>
      <div style={{ display:"flex",gap:6,alignItems:"center" }}>
        <input type="time" value={s} onChange={ev=>setS(ev.target.value)} style={{ fontSize:12.5,border:"1px solid var(--border)",borderRadius:4,padding:"3px 6px",fontFamily:"inherit",background:"var(--surface)",color:"var(--text-primary)",outline:"none",width:80 }}/>
        <span style={{ fontSize:11,color:"var(--text-muted)" }}>to</span>
        <input type="time" value={e} onChange={ev=>setE(ev.target.value)} style={{ fontSize:12.5,border:"1px solid var(--border)",borderRadius:4,padding:"3px 6px",fontFamily:"inherit",background:"var(--surface)",color:"var(--text-primary)",outline:"none",width:80 }}/>
      </div>
      {errMsg && <div style={{ fontSize:11,color:"#EF4444" }}>{errMsg}</div>}
      <div style={{ display:"flex",gap:4 }}>
        <button onClick={save} disabled={saving} style={{ flex:1,padding:"4px 0",background:"var(--primary)",color:"#fff",border:"none",borderRadius:4,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>
          {saving?<Loader2 size={10} style={{animation:"spin 1s linear infinite"}}/>:"Save"}
        </button>
        <button onClick={()=>setOpen(false)} style={{ flex:1,padding:"4px 0",background:"var(--surface)",color:"var(--text-secondary)",border:"1px solid var(--border)",borderRadius:4,fontSize:12,cursor:"pointer",fontFamily:"inherit" }}>✕</button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MeetingRoomPage() {
  const [bookings,  setBookings]  = useState<Booking[]>([]);
  const [members,   setMembers]   = useState<MemberOpt[]>([]);
  const [rooms,     setRooms]     = useState<SpaceRoom[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [editing,   setEditing]   = useState<Booking|null>(null);
  const [search,    setSearch]    = useState("");
  const [roomFilter,setRoomFilter]= useState("All");
  const [stFilter,  setStFilter]  = useState("All");
  const [deleting,  setDeleting]  = useState<string|null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: bk }, { data: mb }, { data: sp }] = await Promise.all([
      supabase.from("bookings").select("*").order("date", { ascending: false }).order("start_time"),
      supabase.from("members").select("id,name").eq("status","Active").order("name"),
      supabase.from("spaces").select("id,code,label").eq("type","Meeting Room").eq("is_active",true).order("code"),
    ]);
    setBookings((bk ?? []) as Booking[]);
    setMembers((mb ?? []) as MemberOpt[]);
    setRooms((sp ?? []) as SpaceRoom[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const deleteBooking = async (id: string) => {
    setDeleting(id);
    await supabase.from("bookings").delete().eq("id", id);
    setDeleting(null);
    load();
  };

  const filtered = bookings.filter(b => {
    const q   = search.toLowerCase();
    const mq  = b.title.toLowerCase().includes(q) || (b.member_name??"").toLowerCase().includes(q) || b.booking_ref.toLowerCase().includes(q);
    const rf  = roomFilter === "All" || b.room === roomFilter;
    const sf  = stFilter   === "All" || b.status === stFilter;
    return mq && rf && sf;
  });

  // Local-timezone today (fixes UTC offset bug for IST +5:30)
  const todayStr = (() => {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
  })();
  const currentMonthPrefix = todayStr.slice(0, 7);
  const thisMonthBookings  = bookings.filter(b => b.date.startsWith(currentMonthPrefix));

  // KPI counts — this month only
  const upcoming  = thisMonthBookings.filter(b => b.status === "Upcoming").length;
  const ongoing   = thisMonthBookings.filter(b => b.status === "Ongoing").length;
  const completed = thisMonthBookings.filter(b => b.status === "Completed").length;

  const todayBookings  = bookings
    .filter(b => b.date === todayStr)
    .sort((a,b)=>a.start_time.localeCompare(b.start_time));
  const upcomingList   = bookings
    .filter(b => b.date > todayStr && b.status !== "Cancelled")
    .sort((a,b)=>a.date.localeCompare(b.date)||a.start_time.localeCompare(b.start_time))
    .slice(0,8);

  const thS: React.CSSProperties = { padding:"12px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.06em", whiteSpace:"nowrap", borderBottom:"1px solid var(--border)", background:"var(--neutral-dark)" };
  const tdS: React.CSSProperties = { padding:"13px 16px", whiteSpace:"nowrap", background:"var(--surface)", borderBottom:"1px solid var(--border-light)" };

  return (
    <div>
      {(showForm || editing) && (
        <BookingModal editing={editing} members={members} rooms={rooms} onClose={()=>{ setShowForm(false); setEditing(null); }} onSaved={load}/>
      )}

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28, flexWrap:"wrap", gap:14 }}>
        <div>
          <h1 style={{ fontSize:28, fontWeight:800, color:"var(--text-primary)", marginBottom:6 }}>Meeting Room</h1>
          <p style={{ fontSize:14, color:"var(--text-muted)" }}>Reserve and manage MR-A & MR-B. All bookings are stored in real-time.</p>
        </div>
        <button onClick={()=>setShowForm(true)} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 22px", background:"var(--primary)", color:"#fff", border:"none", borderRadius:"var(--radius-sm)", fontSize:13.5, fontWeight:700, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 2px 8px rgba(99,102,241,0.3)" }}>
          <Plus size={16}/> New Booking
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
        {[
          { icon:CalendarDays, bg:"#EDE9FE", color:"#6366F1", label:"This Month",  value:thisMonthBookings.length },
          { icon:Clock,        bg:"#DBEAFE", color:"#3B82F6", label:"Upcoming",   value:upcoming },
          { icon:AlertCircle,  bg:"#D1FAE5", color:"#059669", label:"Ongoing",    value:ongoing },
          { icon:CheckCircle,  bg:"#F1F5F9", color:"#64748B", label:"Completed",  value:completed },
        ].map(({ icon:Icon, bg, color, label, value })=>(
          <div key={label} style={{ background:"var(--surface)", borderRadius:"var(--radius)", border:"1px solid var(--border)", padding:"20px 22px", boxShadow:"var(--shadow-sm)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
              <div style={{ width:44, height:44, borderRadius:10, background:bg, display:"flex", alignItems:"center", justifyContent:"center" }}><Icon size={21} color={color} strokeWidth={1.8}/></div>
              <span style={{ fontSize:10.5, color:"var(--text-muted)", fontWeight:600 }}>{new Date().toLocaleString("en",{month:"short",year:"numeric"})}</span>
            </div>
            <div style={{ fontSize:11.5, fontWeight:600, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4 }}>{label}</div>
            <div style={{ fontSize:28, fontWeight:800, color:"var(--text-primary)" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Today's Schedule + Upcoming — two-column */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:28 }}>

        {/* Today's Schedule */}
        <div style={{ background:"var(--surface)", borderRadius:"var(--radius)", border:"1px solid var(--border)", boxShadow:"var(--shadow-sm)", overflow:"hidden" }}>
          <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontSize:15, fontWeight:700, color:"var(--text-primary)" }}>📅 Today&apos;s Schedule</div>
            <span style={{ fontSize:12, color:"var(--text-muted)" }}>{new Date().toLocaleDateString("en-IN",{weekday:"short",day:"2-digit",month:"short"})}</span>
          </div>
          {todayBookings.length === 0 ? (
            <div style={{ padding:"32px 20px", textAlign:"center", color:"var(--text-muted)", fontSize:13.5, fontStyle:"italic" }}>No bookings today</div>
          ) : (
            <div style={{ padding:"8px 0" }}>
              {todayBookings.map((b,i) => {
                const statusColors: Record<string,{bg:string;color:string}> = { Upcoming:{bg:"#DBEAFE",color:"#1D4ED8"}, Ongoing:{bg:"#D1FAE5",color:"#065F46"}, Completed:{bg:"#F1F5F9",color:"#475569"}, Cancelled:{bg:"#FEE2E2",color:"#991B1B"} };
                const sc = statusColors[b.status] || statusColors.Upcoming;
                const ROOM_PALETTE = ["#6366F1","#F59E0B","#10B981","#EF4444","#8B5CF6"];
                const roomColor = ROOM_PALETTE[rooms.findIndex(r=>r.code===b.room) % ROOM_PALETTE.length] ?? "#6366F1";
                return (
                  <div key={b.id} style={{ display:"flex", gap:12, padding:"10px 20px", borderBottom:i<todayBookings.length-1?"1px solid var(--border-light)":"none", alignItems:"flex-start" }}>
                    <div style={{ width:3, borderRadius:999, background:roomColor, alignSelf:"stretch", flexShrink:0 }}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, marginBottom:4 }}>
                        <span style={{ fontSize:13.5, fontWeight:700, color:"var(--text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{b.title}</span>
                        <span style={{ fontSize:10.5, fontWeight:700, background:sc.bg, color:sc.color, padding:"2px 7px", borderRadius:999, flexShrink:0 }}>{b.status}</span>
                      </div>
                      <div style={{ display:"flex", gap:10, fontSize:12, color:"var(--text-muted)" }}>
                        <span>🕐 {b.start_time.slice(0,5)}–{b.end_time.slice(0,5)}</span>
                        <span style={{ fontWeight:700, color:roomColor }}>{b.room}</span>
                        {b.member_name && <span>👤 {b.member_name}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Bookings */}
        <div style={{ background:"var(--surface)", borderRadius:"var(--radius)", border:"1px solid var(--border)", boxShadow:"var(--shadow-sm)", overflow:"hidden" }}>
          <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontSize:15, fontWeight:700, color:"var(--text-primary)" }}>⏭ Upcoming Bookings</div>
            <span style={{ fontSize:12, color:"var(--text-muted)" }}>{upcomingList.length} scheduled</span>
          </div>
          {upcomingList.length === 0 ? (
            <div style={{ padding:"32px 20px", textAlign:"center", color:"var(--text-muted)", fontSize:13.5, fontStyle:"italic" }}>No upcoming bookings</div>
          ) : (
            <div style={{ padding:"8px 0" }}>
              {upcomingList.map((b,i) => {
                const roomColor = b.room === "MR-A" ? "#6366F1" : "#F59E0B";
                const bDate = new Date(b.date);
                const daysLeft = Math.ceil((bDate.getTime() - new Date(todayStr).getTime())/(1000*60*60*24));
                return (
                  <div key={b.id} style={{ display:"flex", gap:12, padding:"10px 20px", borderBottom:i<upcomingList.length-1?"1px solid var(--border-light)":"none", alignItems:"flex-start" }}>
                    <div style={{ width:42, height:42, borderRadius:"var(--radius-sm)", background:`${roomColor}15`, border:`1.5px solid ${roomColor}30`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <span style={{ fontSize:16, fontWeight:800, color:roomColor, lineHeight:1 }}>{bDate.getDate()}</span>
                      <span style={{ fontSize:9, fontWeight:600, color:roomColor, textTransform:"uppercase" }}>{bDate.toLocaleString("en",{month:"short"})}</span>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13.5, fontWeight:700, color:"var(--text-primary)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:3 }}>{b.title}</div>
                      <div style={{ display:"flex", gap:8, fontSize:12, color:"var(--text-muted)", flexWrap:"wrap" }}>
                        <span>🕐 {b.start_time.slice(0,5)}–{b.end_time.slice(0,5)}</span>
                        <span style={{ fontWeight:700, color:roomColor }}>{b.room}</span>
                        <span style={{ color:daysLeft===1?"#EF4444":daysLeft<=3?"#D97706":"var(--text-muted)", fontWeight:daysLeft<=3?700:400 }}>in {daysLeft}d</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>


      <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap", marginBottom:16 }}>
        <div style={{ position:"relative" }}>
          <Search size={14} color="var(--tertiary)" style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)" }}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search title, member, ref…"
            style={{ paddingLeft:32, paddingRight:12, paddingTop:7, paddingBottom:7, border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", fontSize:13.5, fontFamily:"inherit", background:"var(--neutral)", color:"var(--text-primary)", outline:"none", width:240 }}
            onFocus={foc} onBlur={blu}/>
        </div>
        {["All", ...rooms.map(r=>r.code)].map(r=>(
          <button key={r} onClick={()=>setRoomFilter(r)} style={{ padding:"6px 13px", borderRadius:"var(--radius-sm)", border:`1px solid ${roomFilter===r?"var(--primary)":"var(--border)"}`, background:roomFilter===r?"rgba(99,102,241,0.09)":"var(--surface)", color:roomFilter===r?"var(--primary)":"var(--text-secondary)", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>{r}</button>
        ))}
        {["All","Upcoming","Ongoing","Completed","Cancelled"].map(s=>(
          <button key={s} onClick={()=>setStFilter(s)} style={{ padding:"6px 13px", borderRadius:"var(--radius-sm)", border:`1px solid ${stFilter===s?"var(--primary)":"var(--border)"}`, background:stFilter===s?"rgba(99,102,241,0.09)":"var(--surface)", color:stFilter===s?"var(--primary)":"var(--text-secondary)", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>{s}</button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background:"var(--surface)", borderRadius:"var(--radius)", border:"1px solid var(--border)", boxShadow:"var(--shadow-sm)", overflow:"hidden" }}>
        {loading ? (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:48, gap:12 }}>
            <Loader2 size={28} color="var(--primary)" style={{ animation:"spin 1s linear infinite" }}/>
            <span style={{ color:"var(--text-muted)", fontSize:14 }}>Loading bookings…</span>
          </div>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"separate", borderSpacing:0, minWidth:900 }}>
              <thead>
                <tr>
                  {["#","Ref","Title","Member","Room","Date","Time (click to edit)","Duration","Attendees","Status","Actions"].map(h=>(
                    <th key={h} style={thS}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={11} style={{ padding:48, textAlign:"center", color:"var(--text-muted)", fontSize:14 }}>
                    {bookings.length===0 ? "No bookings yet — click \"New Booking\" to create one." : "No bookings match your filters."}
                  </td></tr>
                )}
                {filtered.map((b, idx) => {
                  const durMins = (new Date(`2000-01-01T${b.end_time}`).getTime() - new Date(`2000-01-01T${b.start_time}`).getTime()) / 60000;
                  const durStr  = durMins >= 60 ? `${Math.floor(durMins/60)}h${durMins%60?` ${durMins%60}m`:""}` : `${durMins}m`;
                  const memberIdx = members.findIndex(m=>m.id===b.member_id);
                  return (
                    <tr key={b.id}
                      onMouseEnter={e=>(e.currentTarget as HTMLElement).querySelectorAll("td").forEach(c=>(c as HTMLElement).style.background="var(--neutral)")}
                      onMouseLeave={e=>(e.currentTarget as HTMLElement).querySelectorAll("td").forEach(c=>(c as HTMLElement).style.background="var(--surface)")}>
                      <td style={{ ...tdS, fontSize:12, fontWeight:700, color:"var(--text-muted)", width:44 }}>{idx+1}</td>
                      <td style={tdS}><span style={{ fontFamily:"monospace", fontSize:12, color:"var(--text-secondary)" }}>{b.booking_ref}</span></td>
                      <td style={{ ...tdS, fontWeight:700, fontSize:13.5, color:"var(--text-primary)" }}>{b.title}</td>
                      <td style={tdS}>
                        {b.member_name ? (
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <Avatar name={b.member_name} idx={memberIdx >= 0 ? memberIdx : idx}/>
                            <span style={{ fontSize:13, fontWeight:600, color:"var(--text-primary)" }}>{b.member_name}</span>
                          </div>
                        ) : <span style={{ color:"var(--text-muted)", fontSize:12.5, fontStyle:"italic" }}>Guest</span>}
                      </td>
                      <td style={tdS}><span style={{ fontWeight:700, fontSize:12.5, color:"var(--primary)", background:"#EDE9FE", padding:"3px 8px", borderRadius:6 }}>{b.room}</span></td>
                      <td style={tdS}><span style={{ fontSize:13, color:"var(--text-secondary)" }}>{new Date(b.date).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</span></td>
                      <td style={{ ...tdS, minWidth:180 }}>
                        <InlineTime bookingId={b.id} start={b.start_time} end={b.end_time} onSaved={load}/>
                      </td>
                      <td style={tdS}><span style={{ fontSize:12.5, color:"var(--text-secondary)" }}>{durStr}</span></td>
                      <td style={tdS}><span style={{ fontSize:13, color:"var(--text-secondary)" }}>{b.attendees}</span></td>
                      <td style={tdS}><StatusBadge status={b.status}/></td>
                      <td style={{ ...tdS, minWidth:120 }}>
                        <div style={{ display:"flex", gap:6 }}>
                          <button onClick={()=>setEditing(b)} style={{ padding:"5px 10px", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", background:"var(--neutral)", color:"var(--text-secondary)", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:4 }}>
                            <Pencil size={11}/> Edit
                          </button>
                          <button onClick={()=>deleteBooking(b.id)} disabled={deleting===b.id} style={{ padding:"5px 10px", border:"1px solid #FEE2E2", borderRadius:"var(--radius-sm)", background:"#FFF1F2", color:"#EF4444", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:4 }}>
                            {deleting===b.id?<Loader2 size={10} style={{animation:"spin 1s linear infinite"}}/>:<Trash2 size={11}/>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ padding:"14px 20px", background:"var(--neutral)", borderTop:"1px solid var(--border)", fontSize:13.5, color:"var(--text-muted)" }}>
          Showing <strong style={{ color:"var(--text-primary)" }}>{filtered.length}</strong> of <strong style={{ color:"var(--text-primary)" }}>{bookings.length}</strong> bookings
        </div>
      </div>
    </div>
  );
}
