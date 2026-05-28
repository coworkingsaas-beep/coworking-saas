"use client";

import { useState } from "react";
import {
  CalendarDays, Clock, AlertTriangle, CheckCircle,
  Search, Plus, ChevronLeft, ChevronRight,
} from "lucide-react";

// ── Roadmap 3.4: Meeting Room Booking ──────────────────────────────────────
type BookingStatus = "Upcoming" | "Ongoing" | "Completed" | "Cancelled" | "Booked";

interface Booking {
  id: string; bookingName: string; memberName: string; initials: string; color: string;
  date: string; startTime: string; endTime: string; duration: number; // hours
  status: BookingStatus; conflict: boolean; room: string;
}

const BOOKINGS: Booking[] = [
  { id: "BK-001", bookingName: "Product Strategy",  memberName: "Rahul Sharma",  initials: "RS", color: "#6366F1", date: "28 May 2026", startTime: "09:00", endTime: "10:30", duration: 1.5,  status: "Ongoing",   conflict: false, room: "MR-A" },
  { id: "BK-002", bookingName: "Client Pitch",       memberName: "Priya Patel",   initials: "PP", color: "#F59E0B", date: "28 May 2026", startTime: "11:00", endTime: "12:00", duration: 1,    status: "Upcoming",  conflict: false, room: "MR-B" },
  { id: "BK-003", bookingName: "Legal Debrief",      memberName: "Ankit Mehta",   initials: "AM", color: "#EF4444", date: "28 May 2026", startTime: "11:30", endTime: "13:00", duration: 1.5,  status: "Upcoming",  conflict: true,  room: "MR-A" },
  { id: "BK-004", bookingName: "Team Standup",       memberName: "Rohan Gupta",   initials: "RG", color: "#10B981", date: "27 May 2026", startTime: "10:00", endTime: "10:30", duration: 0.5,  status: "Completed", conflict: false, room: "MR-A" },
  { id: "BK-005", bookingName: "Investor Call",      memberName: "Sneha Joshi",   initials: "SJ", color: "#8B5CF6", date: "27 May 2026", startTime: "14:00", endTime: "16:00", duration: 2,    status: "Completed", conflict: false, room: "MR-B" },
  { id: "BK-006", bookingName: "Design Review",      memberName: "Dev Malhotra",  initials: "DM", color: "#06B6D4", date: "29 May 2026", startTime: "15:00", endTime: "16:30", duration: 1.5,  status: "Booked",    conflict: false, room: "MR-A" },
  { id: "BK-007", bookingName: "Sales Training",     memberName: "Kavya Singh",   initials: "KS", color: "#94A3B8", date: "29 May 2026", startTime: "09:00", endTime: "11:00", duration: 2,    status: "Booked",    conflict: false, room: "MR-B" },
  { id: "BK-008", bookingName: "Workshop",           memberName: "Rahul Sharma",  initials: "RS", color: "#6366F1", date: "26 May 2026", startTime: "13:00", endTime: "15:00", duration: 2,    status: "Completed", conflict: false, room: "MR-A" },
  { id: "BK-009", bookingName: "Board Meeting",      memberName: "Ankit Mehta",   initials: "AM", color: "#EF4444", date: "30 May 2026", startTime: "10:00", endTime: "12:00", duration: 2,    status: "Upcoming",  conflict: false, room: "MR-B" },
  { id: "BK-010", bookingName: "Sprint Planning",    memberName: "Rohan Gupta",   initials: "RG", color: "#10B981", date: "26 May 2026", startTime: "09:30", endTime: "10:00", duration: 0.5,  status: "Cancelled", conflict: false, room: "MR-A" },
];

const STATUS_STYLES: Record<BookingStatus, { bg: string; color: string; dot: string }> = {
  Upcoming:  { bg: "#DBEAFE", color: "#1D4ED8", dot: "#3B82F6" },
  Ongoing:   { bg: "#D1FAE5", color: "#065F46", dot: "#10B981" },
  Completed: { bg: "#F1F5F9", color: "#475569", dot: "#94A3B8" },
  Cancelled: { bg: "#FEE2E2", color: "#991B1B", dot: "#EF4444" },
  Booked:    { bg: "#EDE9FE", color: "#5B21B6", dot: "#8B5CF6" },
};

// ── Components ─────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, iconColor, iconBg, label, value, badge, badgeColor }: any) {
  return (
    <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "20px 22px", boxShadow: "var(--shadow-sm)", transition: "box-shadow 0.2s, transform 0.2s" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={21} color={iconColor} strokeWidth={1.8} />
        </div>
        {badge && <span style={{ fontSize: 11.5, fontWeight: 700, color: badgeColor, background: `${badgeColor}18`, padding: "3px 8px", borderRadius: 6 }}>{badge}</span>}
      </div>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)" }}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 700, background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 999 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

function ConflictBadge({ conflict }: { conflict: boolean }) {
  if (!conflict) return <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>;
  return <span style={{ fontSize: 11.5, fontWeight: 700, background: "#FEE2E2", color: "#991B1B", padding: "3px 9px", borderRadius: 999, border: "1px solid #FCA5A540" }}>⚠ Conflict</span>;
}

function DurationBar({ duration }: { duration: number }) {
  const max = 4;
  const pct = Math.min((duration / max) * 100, 100);
  return (
    <div style={{ minWidth: 100 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 3 }}>{duration}h</div>
      <div style={{ height: 4, background: "var(--border)", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "var(--primary)", borderRadius: 999 }} />
      </div>
    </div>
  );
}

// Timeline card for today
function TimelineCard({ b }: { b: Booking }) {
  const s = STATUS_STYLES[b.status];
  return (
    <div style={{ display: "flex", gap: 12, padding: "12px 16px", background: "var(--surface)", borderRadius: "var(--radius-sm)", border: `1px solid ${b.conflict ? "#FCA5A5" : "var(--border)"}`, marginBottom: 10, transition: "box-shadow 0.15s" }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)"}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "none"}>
      <div style={{ width: 4, borderRadius: 999, background: s.dot, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.bookingName}</div>
          <StatusBadge status={b.status} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>⏱ {b.startTime}–{b.endTime}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--primary)" }}>{b.room}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: `${b.color}22`, border: `1.5px solid ${b.color}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: b.color }}>{b.initials}</div>
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{b.memberName}</span>
          </div>
          {b.conflict && <span style={{ fontSize: 11, fontWeight: 700, color: "#EF4444" }}>⚠ Conflict</span>}
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function BookingsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roomFilter, setRoomFilter] = useState("All");

  const filtered = BOOKINGS.filter(b => {
    const q = search.toLowerCase();
    const mq = b.memberName.toLowerCase().includes(q) || b.bookingName.toLowerCase().includes(q) || b.id.toLowerCase().includes(q);
    const sf = statusFilter === "All" || b.status === statusFilter;
    const rf = roomFilter === "All" || b.room === roomFilter;
    return mq && sf && rf;
  });

  const todayBookings = BOOKINGS.filter(b => b.date === "28 May 2026").sort((a, b) => a.startTime.localeCompare(b.startTime));
  const conflictCount = BOOKINGS.filter(b => b.conflict).length;
  const totalHours    = BOOKINGS.reduce((s, b) => s + b.duration, 0);

  const th = (label: string) => (
    <th key={label} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", borderBottom: "1px solid var(--border)", background: "var(--neutral-dark)" }}>{label}</th>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2, marginBottom: 6 }}>Meeting Room Bookings</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Schedule, track and detect conflicts across all meeting rooms.</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 20px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          <Plus size={15} /> New Booking
        </button>
      </div>

      {/* ── Today's Schedule (top) ─────────────────────────────────────── */}
      <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: "14px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Today's Schedule</div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>28 May 2026 · {todayBookings.length} bookings</div>
          </div>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: "#10B981", background: "#D1FAE5", padding: "4px 10px", borderRadius: 999 }}>● Live</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 0 }}>
          <div style={{ padding: "18px 24px", borderRight: "1px solid var(--border)" }}>
            {todayBookings.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
                {todayBookings.map(b => {
                  const s = STATUS_STYLES[b.status];
                  return (
                    <div key={b.id} style={{ display: "flex", gap: 10, padding: "12px 14px", background: "var(--neutral)", borderRadius: "var(--radius-sm)", border: `1.5px solid ${b.conflict ? "#FCA5A5" : "var(--border)"}`, transition: "box-shadow 0.15s, transform 0.15s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
                      <div style={{ width: 4, borderRadius: 999, background: s.dot, flexShrink: 0, minHeight: 44 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)" }}>{b.bookingName}</div>
                          <StatusBadge status={b.status} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                            <Clock size={11} strokeWidth={2} color="var(--text-muted)" />{b.startTime}–{b.endTime}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#6366F1", background: "#EDE9FE", padding: "1px 8px", borderRadius: 999 }}>{b.room}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <div style={{ width: 20, height: 20, borderRadius: "50%", background: `${b.color}22`, border: `1.5px solid ${b.color}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: b.color }}>{b.initials}</div>
                            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{b.memberName}</span>
                          </div>
                        </div>
                        {b.conflict && <div style={{ marginTop: 5, fontSize: 11.5, fontWeight: 700, color: "#EF4444", display: "flex", alignItems: "center", gap: 4 }}><AlertTriangle size={11} strokeWidth={2.5} /> Conflict detected</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "32px 0", fontSize: 13 }}>No bookings today</div>}
          </div>
          <div style={{ padding: "18px 24px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>Room Usage Today</div>
            {["MR-A", "MR-B"].map(room => {
              const roomHours = todayBookings.filter(b => b.room === room).reduce((s, b) => s + b.duration, 0);
              const pct = Math.min((roomHours / 8) * 100, 100);
              const roomBks = todayBookings.filter(b => b.room === room);
              return (
                <div key={room} style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)" }}>{room}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: pct > 60 ? "var(--primary)" : "var(--text-muted)" }}>{roomHours}h <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>/ 8h</span></span>
                  </div>
                  <div style={{ height: 6, background: "var(--border)", borderRadius: 999, overflow: "hidden", marginBottom: 8 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: pct > 75 ? "#EF4444" : "var(--primary)", borderRadius: 999 }} />
                  </div>
                  {roomBks.map(b => (
                    <div key={b.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--border-light)" }}>
                      <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>{b.bookingName}</span>
                      <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{b.startTime}–{b.endTime}</span>
                    </div>
                  ))}
                  {roomBks.length === 0 && <div style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>No bookings</div>}
                </div>
              );
            })}
            <div style={{ padding: "10px 12px", background: "var(--neutral)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", marginTop: 4 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Total today</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>{todayBookings.reduce((s, b) => s + b.duration, 0)}h <span style={{ fontSize: 12, fontWeight: 400, color: "var(--text-muted)" }}>across rooms</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative" }}>
          <Search size={14} color="var(--tertiary)" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search booking or member…"
            style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontFamily: "inherit", background: "var(--neutral)", color: "var(--text-primary)", outline: "none", width: 240 }}
            onFocus={e => (e.currentTarget.style.borderColor = "var(--primary)")}
            onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")} />
        </div>
        {(["All","Upcoming","Ongoing","Completed","Cancelled","Booked"] as const).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: "5px 12px", borderRadius: "var(--radius-sm)", border: `1px solid ${statusFilter === s ? "var(--primary)" : "var(--border)"}`, background: statusFilter === s ? "rgba(99,102,241,0.09)" : "var(--surface)", color: statusFilter === s ? "var(--primary)" : "var(--text-secondary)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{s}</button>
        ))}
        <div style={{ height: 22, width: 1, background: "var(--border)", margin: "0 2px" }} />
        {["All","MR-A","MR-B"].map(r => (
          <button key={r} onClick={() => setRoomFilter(r)} style={{ padding: "5px 12px", borderRadius: "var(--radius-sm)", border: `1px solid ${roomFilter === r ? "#10B981" : "var(--border)"}`, background: roomFilter === r ? "#D1FAE5" : "var(--surface)", color: roomFilter === r ? "#065F46" : "var(--text-secondary)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{r}</button>
        ))}
      </div>

      {/* Full-width Table */}
      <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", overflow: "hidden", marginBottom: 24 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 900 }}>
            <thead>
              <tr>{["#","Booking","Member","Date","Time","Room","Duration","Status","Conflict"].map(h => th(h))}</tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => {
                const bg = "var(--surface)";
                return (
                  <tr key={b.id}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).querySelectorAll("td").forEach(c => (c as HTMLElement).style.background = "var(--neutral)")}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).querySelectorAll("td").forEach(c => (c as HTMLElement).style.background = bg)}>
                    <td style={{ padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", background: bg, borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap" }}>{i + 1}</td>
                    <td style={{ padding: "12px 16px", background: bg, borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)" }}>{b.bookingName}</div>
                      <div style={{ fontSize: 11.5, color: "var(--text-muted)", fontFamily: "monospace" }}>{b.id}</div>
                    </td>
                    <td style={{ padding: "12px 16px", background: bg, borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${b.color}22`, border: `2px solid ${b.color}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: b.color }}>{b.initials}</div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{b.memberName}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-primary)", background: bg, borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap" }}>{b.date}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)", background: bg, borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap" }}>{b.startTime}–{b.endTime}</td>
                    <td style={{ padding: "12px 16px", background: bg, borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: "#6366F1", background: "#EDE9FE", padding: "3px 10px", borderRadius: 999 }}>{b.room}</span>
                    </td>
                    <td style={{ padding: "12px 16px", background: bg, borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap" }}><DurationBar duration={b.duration} /></td>
                    <td style={{ padding: "12px 16px", background: bg, borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap" }}><StatusBadge status={b.status} /></td>
                    <td style={{ padding: "12px 16px", background: bg, borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap" }}><ConflictBadge conflict={b.conflict} /></td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={9} style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>No bookings match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div style={{ padding: "13px 20px", background: "var(--neutral)", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Showing <strong style={{ color: "var(--text-primary)" }}>{filtered.length}</strong> of <strong style={{ color: "var(--text-primary)" }}>{BOOKINGS.length}</strong> bookings</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={{ width: 30, height: 30, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronLeft size={13} color="var(--text-secondary)" /></button>
            {[1, 2].map(p => <button key={p} style={{ width: 30, height: 30, borderRadius: "var(--radius-sm)", border: `1px solid ${p === 1 ? "var(--primary)" : "var(--border)"}`, background: p === 1 ? "var(--primary)" : "var(--surface)", color: p === 1 ? "#fff" : "var(--text-secondary)", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>{p}</button>)}
            <button style={{ width: 30, height: 30, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronRight size={13} color="var(--text-secondary)" /></button>
          </div>
        </div>
      </div>

    </div>

  );
}
