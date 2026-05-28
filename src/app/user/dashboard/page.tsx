"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Member } from "@/lib/supabase";
import {
  CalendarDays, CreditCard, Printer, Home, Clock,
  CheckCircle, AlertCircle, Loader2, Plus, ChevronRight, Zap,
} from "lucide-react";

interface Booking {
  id: string; title: string; room: string; date: string;
  start_time: string; end_time: string; status: string;
}

function StatCard({ icon: Icon, iconBg, iconColor, label, value, sub, accent }: any) {
  return (
    <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: `1px solid ${accent ?? "var(--border)"}`, padding: "22px", boxShadow: "var(--shadow-sm)", transition: "transform 0.2s, box-shadow 0.2s" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)"; }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={22} color={iconColor} strokeWidth={1.8}/>
        </div>
        {sub && <span style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 600, background: "var(--neutral)", padding: "3px 8px", borderRadius: 6 }}>{sub}</span>}
      </div>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)" }}>{value}</div>
    </div>
  );
}

function Badge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return <span style={{ fontSize: 11.5, fontWeight: 700, background: bg, color, padding: "3px 10px", borderRadius: 999 }}>{label}</span>;
}

export default function UserDashboard() {
  const [member,   setMember]   = useState<Member | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserEmail(user.email ?? "");

      // Match member by email
      const { data: m } = await supabase.from("members").select("*").eq("email", user.email!).maybeSingle();
      if (m) setMember(m as Member);

      // Fetch their bookings
      const { data: bk } = await supabase.from("bookings")
        .select("id,title,room,date,start_time,end_time,status")
        .eq("member_id", m?.id ?? "00000000-0000-0000-0000-000000000000")
        .order("date", { ascending: false }).limit(5);
      setBookings((bk ?? []) as Booking[]);
      setLoading(false);
    };
    init();
  }, []);

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "70vh", gap: 16 }}>
      <Loader2 size={42} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }}/>
      <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading your dashboard…</p>
    </div>
  );

  const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })();
  const todayBk = bookings.filter(b => b.date === today);
  const upcomingBk = bookings.filter(b => b.date > today && b.status !== "Cancelled");
  const dueDate = member?.renewal_date ? new Date(member.renewal_date) : null;
  const daysToRenewal = dueDate ? Math.ceil((dueDate.getTime() - Date.now()) / 86400000) : null;
  const printPct = member ? Math.round((member.total_prints_used / Math.max(member.total_prints_allowed, 1)) * 100) : 0;
  const initials = member?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) ?? "U";

  const statusColors: Record<string, { bg: string; color: string }> = {
    Upcoming:  { bg: "#DBEAFE", color: "#1D4ED8" },
    Ongoing:   { bg: "#D1FAE5", color: "#065F46" },
    Completed: { bg: "#F1F5F9", color: "#475569" },
    Cancelled: { bg: "#FEE2E2", color: "#991B1B" },
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 27, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
            👋 Hello, {member?.name?.split(" ")[0] ?? "there"}!
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <a href="/user/bookings" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "var(--primary)", color: "#fff", textDecoration: "none", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontWeight: 700, boxShadow: "0 2px 8px rgba(99,102,241,0.3)" }}>
          <Plus size={15}/> Book Meeting Room
        </a>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        <StatCard icon={Home} iconBg="#EDE9FE" iconColor="#6366F1" label="My Space" value={member?.assigned_space ?? "Unassigned"} sub={member?.space_type ?? undefined}/>
        <StatCard icon={CreditCard} iconBg={daysToRenewal !== null && daysToRenewal <= 7 ? "#FEE2E2" : "#D1FAE5"} iconColor={daysToRenewal !== null && daysToRenewal <= 7 ? "#EF4444" : "#059669"} label="Renewal Due" value={member?.renewal_date ? new Date(member.renewal_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—"} sub={daysToRenewal !== null ? `${daysToRenewal}d left` : undefined} accent={daysToRenewal !== null && daysToRenewal <= 7 ? "#FEE2E2" : undefined}/>
        <StatCard icon={CalendarDays} iconBg="#DBEAFE" iconColor="#3B82F6" label="Bookings This Month" value={bookings.length}/>
        <StatCard icon={Printer} iconBg={printPct >= 80 ? "#FEF3C7" : "#F1F5F9"} iconColor={printPct >= 80 ? "#D97706" : "#64748B"} label="Prints Used" value={`${member?.total_prints_used ?? 0} / ${member?.total_prints_allowed ?? 500}`} sub={`${printPct}%`} accent={printPct >= 80 ? "#FEF3C7" : undefined}/>
      </div>

      {/* Two-column: profile + bookings */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 20, marginBottom: 24 }}>

        {/* Profile Card */}
        <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
          {/* Banner */}
          <div style={{ height: 70, background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)" }}/>
          <div style={{ padding: "0 24px 24px" }}>
            <div style={{ marginTop: -28, marginBottom: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", border: "3px solid var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "#fff" }}>{initials}</div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 2 }}>{member?.name ?? "—"}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>{userEmail}</div>

            {[
              { label: "Phone",       value: member?.phone },
              { label: "Company",     value: member?.company },
              { label: "Member Since",value: member?.joining_date ? new Date(member.joining_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : null },
              { label: "Status",      value: member?.status },
              { label: "Team Size",   value: member?.team_size ? `${member.team_size} person${member.team_size > 1 ? "s" : ""}` : null },
            ].filter(r => r.value).map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 10, marginBottom: 10, borderBottom: "1px solid var(--border-light)" }}>
                <span style={{ fontSize: 12.5, color: "var(--text-muted)", fontWeight: 600 }}>{label}</span>
                <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600, textAlign: "right" }}>
                  {label === "Status"
                    ? <Badge label={String(value)} bg={value === "Active" ? "#D1FAE5" : "#FEE2E2"} color={value === "Active" ? "#065F46" : "#991B1B"}/>
                    : value}
                </span>
              </div>
            ))}

            <a href="/user/profile" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 8, padding: "9px 0", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontWeight: 600, color: "var(--text-secondary)", textDecoration: "none", transition: "all 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)"; (e.currentTarget as HTMLElement).style.color = "var(--primary)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; }}>
              Edit Profile <ChevronRight size={13}/>
            </a>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Today's bookings */}
          <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>📅 Today&apos;s Schedule</span>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{new Date().toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" })}</span>
            </div>
            {todayBk.length === 0
              ? <div style={{ padding: "28px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13.5, fontStyle: "italic" }}>No bookings today</div>
              : todayBk.map(b => {
                  const sc = statusColors[b.status] ?? statusColors.Upcoming;
                  return (
                    <div key={b.id} style={{ padding: "12px 20px", borderBottom: "1px solid var(--border-light)", display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 3, height: 36, borderRadius: 999, background: "#6366F1", flexShrink: 0 }}/>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>{b.title}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>🕐 {b.start_time.slice(0,5)}–{b.end_time.slice(0,5)} · {b.room}</div>
                      </div>
                      <Badge label={b.status} bg={sc.bg} color={sc.color}/>
                    </div>
                  );
                })
            }
          </div>

          {/* Upcoming bookings */}
          <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>⏭ Upcoming Bookings</span>
              <a href="/user/bookings" style={{ fontSize: 12.5, color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>View all →</a>
            </div>
            {upcomingBk.length === 0
              ? <div style={{ padding: "28px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13.5, fontStyle: "italic" }}>No upcoming bookings</div>
              : upcomingBk.slice(0, 4).map(b => {
                  const bDate = new Date(b.date);
                  const dLeft = Math.ceil((bDate.getTime() - new Date(today).getTime()) / 86400000);
                  const sc    = statusColors[b.status] ?? statusColors.Upcoming;
                  return (
                    <div key={b.id} style={{ padding: "12px 20px", borderBottom: "1px solid var(--border-light)", display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: "var(--radius-sm)", background: "#EDE9FE", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: "#6366F1", lineHeight: 1 }}>{bDate.getDate()}</span>
                        <span style={{ fontSize: 9, color: "#6366F1", fontWeight: 600, textTransform: "uppercase" }}>{bDate.toLocaleString("en", { month: "short" })}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.title}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>🕐 {b.start_time.slice(0,5)}–{b.end_time.slice(0,5)} · {b.room}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                        <Badge label={b.status} bg={sc.bg} color={sc.color}/>
                        <span style={{ fontSize: 11, color: dLeft <= 2 ? "#EF4444" : dLeft <= 5 ? "#D97706" : "var(--text-muted)", fontWeight: 600 }}>in {dLeft}d</span>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </div>
      </div>

      {/* Print usage bar */}
      {member && (
        <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "20px 24px", boxShadow: "var(--shadow-sm)", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Printer size={17} color="var(--text-secondary)" strokeWidth={1.8}/>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Print Usage This Month</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: printPct >= 90 ? "#EF4444" : printPct >= 70 ? "#D97706" : "var(--primary)" }}>
              {member.total_prints_used} / {member.total_prints_allowed} pages
            </span>
          </div>
          <div style={{ height: 10, background: "var(--border)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${printPct}%`, background: printPct >= 90 ? "#EF4444" : printPct >= 70 ? "#F59E0B" : "linear-gradient(90deg,var(--primary),#8B5CF6)", borderRadius: 999, transition: "width 0.6s ease" }}/>
          </div>
          {printPct >= 80 && (
            <div style={{ marginTop: 10, fontSize: 12.5, color: printPct >= 90 ? "#991B1B" : "#92400E", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              <AlertCircle size={13}/> {printPct >= 90 ? "You're almost out of prints! Contact admin." : "You're using a lot of prints this month."}
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "20px 24px", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>⚡ Quick Actions</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { icon: CalendarDays, label: "Book Room",     href: "/user/bookings",  bg: "#EDE9FE", color: "#6366F1" },
            { icon: CreditCard,   label: "View Payments", href: "/user/payments",  bg: "#D1FAE5", color: "#059669" },
            { icon: Zap,          label: "My Profile",    href: "/user/profile",   bg: "#FEF3C7", color: "#D97706" },
            { icon: CheckCircle,  label: "Past Bookings", href: "/user/bookings",  bg: "#DBEAFE", color: "#3B82F6" },
          ].map(({ icon: Icon, label, href, bg, color }) => (
            <a key={label} href={href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "18px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--neutral)", textDecoration: "none", transition: "all 0.18s", cursor: "pointer" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = bg; (e.currentTarget as HTMLElement).style.borderColor = color; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--neutral)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.transform = ""; }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={20} color={color} strokeWidth={1.8}/>
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-secondary)", textAlign: "center" }}>{label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
