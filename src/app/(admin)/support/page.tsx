"use client";
import { useState } from "react";
import {
  BookOpen, MessageSquare, ChevronDown, ChevronUp,
  ExternalLink, Send, CheckCircle, AlertTriangle, Clock, Zap,
} from "lucide-react";

// ── FAQ Data ──────────────────────────────────────────────────────────────────
const FAQS = [
  {
    cat: "Members",
    items: [
      { q: "How do I add a new member?", a: "Go to Members → click the 'Add Member' button in the top right. Fill in the member details including name, contact, space assignment, and plan. The system will auto-create a payment record for the current month." },
      { q: "How do I mark a member as inactive?", a: "Open the member's edit drawer, change their Status to 'Inactive'. This will move them to the Discontinued Co-workers list and stop generating new payment records." },
      { q: "Can I assign multiple spaces to one member?", a: "Currently, one member maps to one primary space. For team plans, assign by team size and note it in the member record." },
    ],
  },
  {
    cat: "Payments",
    items: [
      { q: "How are overdue payments flagged?", a: "Payments past their due date + the configured grace period (default 3 days) are automatically marked Overdue. You can adjust the grace period in Settings → Payments." },
      { q: "What happens when I record a payment?", a: "Recording a payment marks the record as Paid, updates the Income Synced and Renewal Synced flags, and creates a corresponding P&L income entry linked to that payment." },
      { q: "How do I set custom rent for a member?", a: "Edit the member record and set their monthly rent. This overrides the default desk/cabin rate set in Settings." },
    ],
  },
  {
    cat: "Bookings",
    items: [
      { q: "How does conflict detection work?", a: "When two bookings overlap on the same date in the same room, the Conflict field is flagged automatically. Conflicting bookings are highlighted in red on the bookings page." },
      { q: "Can I block a room for maintenance?", a: "Create a booking with the name 'Maintenance Block' and assign it to the relevant room. Set the status to Booked." },
    ],
  },
  {
    cat: "Leads",
    items: [
      { q: "What does 'Hot' vs 'Cold' mean?", a: "'Hot' leads are actively interested and require immediate follow-up. 'Cold' leads need nurturing. Change status manually based on your last interaction." },
      { q: "How do I convert a lead to a member?", a: "Set the lead status to 'Converted' and link to the member record. The lead history is preserved for reporting." },
    ],
  },
];

// ── System Status ─────────────────────────────────────────────────────────────
const STATUS_ITEMS = [
  { name: "Dashboard & Members",  status: "Operational",    uptime: "99.9%" },
  { name: "Payment Tracking",     status: "Operational",    uptime: "99.8%" },
  { name: "Booking System",       status: "Operational",    uptime: "100%" },
  { name: "Database",             status: "Operational",    uptime: "99.9%" },
  { name: "Email Notifications",  status: "Degraded",       uptime: "94.2%" },
  { name: "WhatsApp Alerts",      status: "Operational",    uptime: "98.7%" },
];

const STATUS_STYLE: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  Operational: { color: "#059669", bg: "#D1FAE5", icon: CheckCircle },
  Degraded:    { color: "#D97706", bg: "#FEF3C7", icon: AlertTriangle },
  Down:        { color: "#DC2626", bg: "#FEE2E2", icon: AlertTriangle },
};

// ── Docs Links ────────────────────────────────────────────────────────────────
const DOCS = [
  { title: "Getting Started Guide",      desc: "Setup your space from scratch",                 icon: "📋" },
  { title: "Member Management",          desc: "Add, edit, and manage members",                  icon: "👥" },
  { title: "Payment Workflow",           desc: "Recording, tracking and overdue handling",       icon: "💳" },
  { title: "Booking & Conflict Rules",   desc: "How room scheduling and conflict detection work",icon: "📅" },
  { title: "P&L & Reporting",            desc: "Understanding your financial reports",           icon: "📊" },
  { title: "Leads Pipeline",             desc: "Convert prospects into paying members",          icon: "🔥" },
];

// ── Components ────────────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid var(--border-light)" }}>
      <button onClick={() => setOpen(!open)}
        style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 20px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left", gap: 12 }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>{q}</span>
        {open ? <ChevronUp size={16} color="var(--primary)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
      </button>
      {open && (
        <div style={{ padding: "0 20px 16px", fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7 }}>{a}</div>
      )}
    </div>
  );
}

function ContactForm() {
  const [sent, setSent] = useState(false);
  const [type, setType] = useState("Bug Report");
  if (sent) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center" }}>
        <CheckCircle size={40} color="#10B981" style={{ margin: "0 auto 12px" }} />
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>Message Sent!</div>
        <div style={{ fontSize: 13.5, color: "var(--text-muted)" }}>We'll respond to your query within 1 business day.</div>
        <button onClick={() => setSent(false)} style={{ marginTop: 16, fontSize: 13, color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Send another</button>
      </div>
    );
  }
  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Your Name</label>
          <input placeholder="Vaibhav Rajawat" style={{ width: "100%", padding: "9px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontFamily: "inherit", background: "var(--neutral)", color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }}
            onFocus={e => (e.currentTarget.style.borderColor = "var(--primary)")}
            onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Email</label>
          <input placeholder="admin@cospace.in" style={{ width: "100%", padding: "9px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontFamily: "inherit", background: "var(--neutral)", color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }}
            onFocus={e => (e.currentTarget.style.borderColor = "var(--primary)")}
            onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")} />
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Type</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["Bug Report","Feature Request","Billing Issue","General Query"].map(t => (
            <button key={t} onClick={() => setType(t)}
              style={{ padding: "5px 12px", borderRadius: "var(--radius-sm)", border: `1px solid ${type === t ? "var(--primary)" : "var(--border)"}`, background: type === t ? "rgba(99,102,241,0.09)" : "var(--surface)", color: type === t ? "var(--primary)" : "var(--text-secondary)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{t}</button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Message</label>
        <textarea rows={5} placeholder="Describe your issue or question in detail…"
          style={{ width: "100%", padding: "9px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontFamily: "inherit", background: "var(--neutral)", color: "var(--text-primary)", outline: "none", resize: "vertical", boxSizing: "border-box" }}
          onFocus={e => (e.currentTarget.style.borderColor = "var(--primary)")}
          onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")} />
      </div>
      <button onClick={() => setSent(true)}
        style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 22px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
        <Send size={14} /> Send Message
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SupportPage() {
  const [faqCat, setFaqCat] = useState("Members");

  const allCats = FAQS.map(f => f.cat);
  const currentFaqs = FAQS.find(f => f.cat === faqCat)?.items ?? [];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>Help & Support</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Documentation, FAQs, system status and a direct line to our support team.</p>
      </div>

      {/* System Status Banner */}
      <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "16px 24px", marginBottom: 24, boxShadow: "var(--shadow-sm)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Zap size={18} color="#10B981" fill="#10B981" />
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>System Status</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#059669", background: "#D1FAE5", padding: "4px 12px", borderRadius: 999 }}>● Mostly Operational</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {STATUS_ITEMS.map(item => {
            const s = STATUS_STYLE[item.status];
            const Icon = s.icon;
            return (
              <div key={item.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--neutral)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon size={13} color={s.color} />
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)" }}>{item.name}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: s.bg, padding: "2px 8px", borderRadius: 999 }}>{item.status}</span>
                  <div style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 2 }}>{item.uptime} uptime</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20, alignItems: "start" }}>
        {/* Left: FAQ + Docs */}
        <div>
          {/* FAQ */}
          <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", overflow: "hidden", marginBottom: 20 }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BookOpen size={17} color="var(--primary)" />
                <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Frequently Asked Questions</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {allCats.map(c => (
                  <button key={c} onClick={() => setFaqCat(c)}
                    style={{ padding: "5px 12px", borderRadius: "var(--radius-sm)", border: `1px solid ${faqCat === c ? "var(--primary)" : "var(--border)"}`, background: faqCat === c ? "rgba(99,102,241,0.09)" : "var(--surface)", color: faqCat === c ? "var(--primary)" : "var(--text-secondary)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{c}</button>
                ))}
              </div>
            </div>
            {currentFaqs.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
          </div>

          {/* Documentation */}
          <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Documentation</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
              {DOCS.map((doc, i) => (
                <button key={i}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", border: "none", borderBottom: i < DOCS.length - 2 ? "1px solid var(--border-light)" : "none", borderRight: i % 2 === 0 ? "1px solid var(--border-light)" : "none", background: "var(--surface)", cursor: "pointer", fontFamily: "inherit", textAlign: "left", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--neutral)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--surface)"}>
                  <span style={{ fontSize: 22 }}>{doc.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>{doc.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{doc.desc}</div>
                  </div>
                  <ExternalLink size={13} color="var(--text-muted)" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Contact + Quick Tips */}
        <div>
          {/* Contact */}
          <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", overflow: "hidden", marginBottom: 16 }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
              <MessageSquare size={17} color="var(--primary)" />
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Contact Support</span>
            </div>
            <ContactForm />
          </div>

          {/* Response time SLA */}
          <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "18px 20px", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>Response Times</div>
            {[
              { label: "Bug Reports",     time: "< 4 hours",     icon: <AlertTriangle size={14} color="#EF4444" /> },
              { label: "Billing Issues",  time: "< 2 hours",     icon: <Clock size={14} color="#F59E0B" /> },
              { label: "Feature Requests",time: "1–2 business days", icon: <CheckCircle size={14} color="#10B981" /> },
              { label: "General Queries", time: "1 business day",icon: <MessageSquare size={14} color="#6366F1" /> },
            ].map(({ label, time, icon }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-light)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {icon}
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</span>
                </div>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)" }}>{time}</span>
              </div>
            ))}
            <div style={{ marginTop: 14, padding: "10px 12px", background: "var(--neutral)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
                📧 <strong>Direct email:</strong> support@cospace.in<br />
                📱 <strong>WhatsApp:</strong> +91 98765 00000<br />
                🕘 Support hours: Mon–Sat, 9 AM – 6 PM IST
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
