"use client";
import { Zap, Users, Calendar, CreditCard, MapPin, ArrowRight, Shield } from "lucide-react";

const features = [
  { icon: Users, title: "Member Management", desc: "Track members, seats, and renewals in one place." },
  { icon: Calendar, title: "Meeting Room Booking", desc: "Real-time room reservations with conflict prevention." },
  { icon: CreditCard, title: "Payments & Dues", desc: "Monitor rent, overdue alerts, and payment history." },
  { icon: MapPin, title: "Workspace Overview", desc: "Visual seat map with live occupancy status." },
];

export default function HomePage() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#0F172A", minHeight: "100vh", color: "#F1F5F9" }}>
      {/* Noise texture overlay */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")", opacity: 0.4, pointerEvents: "none", zIndex: 0 }} />

      {/* Glow blobs */}
      <div style={{ position: "fixed", top: -200, left: "30%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: -100, right: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* NAV */}
      <nav style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 48px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(99,102,241,0.5)" }}>
            <Zap size={18} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, color: "#F1F5F9" }}>CoSpace</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/login" style={{ padding: "9px 22px", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", borderRadius: 10, textDecoration: "none", fontSize: 14, fontWeight: 700, boxShadow: "0 4px 14px rgba(99,102,241,0.4)", display: "flex", alignItems: "center", gap: 6, transition: "opacity 0.2s" }}>
            Member Login <ArrowRight size={14} />
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "100px 24px 80px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 999, fontSize: 12.5, fontWeight: 700, color: "#A5B4FC", marginBottom: 32, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6EE7B7", display: "inline-block", boxShadow: "0 0 8px #6EE7B7" }} /> Coworking Management Suite
        </div>
        <h1 style={{ fontSize: "clamp(38px, 6vw, 68px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 24, letterSpacing: "-0.03em", background: "linear-gradient(135deg, #F1F5F9 30%, #A5B4FC 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Manage Your Coworking<br />Space Effortlessly
        </h1>
        <p style={{ fontSize: 18, color: "#94A3B8", maxWidth: 520, margin: "0 auto 48px", lineHeight: 1.7 }}>
          All-in-one dashboard for members, bookings, payments, and workspace allocation.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/login" style={{ padding: "14px 32px", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", borderRadius: 12, textDecoration: "none", fontSize: 16, fontWeight: 700, boxShadow: "0 8px 24px rgba(99,102,241,0.45)", display: "inline-flex", alignItems: "center", gap: 8 }}>
            Get Started <ArrowRight size={16} />
          </a>
          <a href="#features" style={{ padding: "14px 32px", background: "rgba(255,255,255,0.06)", color: "#CBD5E1", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, textDecoration: "none", fontSize: 16, fontWeight: 600 }}>
            Learn More
          </a>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "60px 24px 100px" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6366F1", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Features</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.02em" }}>Everything in one place</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "28px 24px", backdropFilter: "blur(10px)", transition: "border-color 0.2s, transform 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(99,102,241,0.4)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                <Icon size={20} color="#818CF8" strokeWidth={1.8} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#F1F5F9", marginBottom: 8 }}>{title}</div>
              <div style={{ fontSize: 13.5, color: "#64748B", lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "60px 24px 100px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "52px 40px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 24, backdropFilter: "blur(16px)" }}>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: "#F1F5F9", marginBottom: 14 }}>Ready to get started?</h2>
          <p style={{ fontSize: 15, color: "#94A3B8", marginBottom: 32, lineHeight: 1.6 }}>Sign up or log into your member account to access your workspace dashboard.</p>
          <a href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 30px", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", borderRadius: 12, textDecoration: "none", fontSize: 15, fontWeight: 700, boxShadow: "0 8px 24px rgba(99,102,241,0.4)" }}>
            Member Portal <ArrowRight size={15} />
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontSize: 13, color: "#334155" }}>© 2026 CoSpace. All rights reserved.</span>
        <a href="/admin/login" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#334155", textDecoration: "none" }}>
          <Shield size={13} /> Admin Login
        </a>
      </footer>
    </div>
  );
}
