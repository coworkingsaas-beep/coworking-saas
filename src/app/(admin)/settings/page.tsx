"use client";
import { useState } from "react";
import { Building2, CreditCard, Bell, Shield, Palette, Save, ChevronRight } from "lucide-react";

const TABS = [
  { id: "profile",       label: "Space Profile",    icon: Building2 },
  { id: "payments",      label: "Payments",         icon: CreditCard },
  { id: "notifications", label: "Notifications",    icon: Bell },
  { id: "access",        label: "Access & Security",icon: Shield },
  { id: "appearance",    label: "Appearance",       icon: Palette },
];

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

function Input({ defaultValue, placeholder }: { defaultValue?: string; placeholder?: string }) {
  return (
    <input defaultValue={defaultValue} placeholder={placeholder}
      style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontFamily: "inherit", background: "var(--neutral)", color: "var(--text-primary)", outline: "none" }}
      onFocus={e => (e.currentTarget.style.borderColor = "var(--primary)")}
      onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")} />
  );
}

function Toggle({ defaultChecked, label }: { defaultChecked?: boolean; label?: string }) {
  const [on, setOn] = useState(defaultChecked ?? false);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {label && <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</span>}
      <button onClick={() => setOn(!on)} style={{ width: 44, height: 24, borderRadius: 999, background: on ? "var(--primary)" : "var(--border)", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
        <span style={{ position: "absolute", top: 3, left: on ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
      </button>
    </div>
  );
}

function Select({ options, defaultValue }: { options: string[]; defaultValue?: string }) {
  return (
    <select defaultValue={defaultValue}
      style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontFamily: "inherit", background: "var(--neutral)", color: "var(--text-primary)", outline: "none", cursor: "pointer" }}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
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
      <Section title="Capacity" sub="Space inventory configuration">
        <Field label="Total Desk Seats" sub="D1 to D28 by default"><Input defaultValue="28" /></Field>
        <Field label="Total Cabins" sub="C1 to C4 by default"><Input defaultValue="4" /></Field>
        <Field label="Meeting Rooms" sub="MR-A, MR-B etc."><Input defaultValue="2" /></Field>
      </Section>
    </>
  );
}

function PaymentsTab() {
  return (
    <>
      <Section title="Billing Defaults" sub="Applied when creating new payment records">
        <Field label="Currency" sub="All amounts displayed in this currency"><Select options={["INR — ₹", "USD — $", "EUR — €"]} defaultValue="INR — ₹" /></Field>
        <Field label="Monthly Due Date" sub="Day of month payments are due"><Select options={["1st","5th","7th","10th","15th"]} defaultValue="5th" /></Field>
        <Field label="Default Seat Rent (₹)" sub="Pre-filled for new members"><Input defaultValue="4500" /></Field>
        <Field label="Default Cabin Rent (₹)"><Input defaultValue="14000" /></Field>
        <Field label="Security Deposit Multiplier" sub="e.g. 2 = 2× monthly rent"><Input defaultValue="2" /></Field>
      </Section>
      <Section title="Overdue Rules">
        <Field label="Grace Period (days)" sub="Days after due date before marking overdue"><Input defaultValue="3" /></Field>
        <Field label="Auto-flag Overdue" sub="Automatically mark as overdue after grace period"><Toggle defaultChecked={true} /></Field>
        <Field label="Late Fee (₹)" sub="Optional flat fee added after grace period"><Input defaultValue="0" /></Field>
      </Section>
      <Section title="Payment Modes">
        <Field label="Accept Cash"><Toggle defaultChecked={true} /></Field>
        <Field label="Accept UPI"><Toggle defaultChecked={true} /></Field>
        <Field label="Accept Bank Transfer"><Toggle defaultChecked={true} /></Field>
        <Field label="UPI ID" sub="For QR code on receipts"><Input defaultValue="cospace@okaxis" /></Field>
      </Section>
    </>
  );
}

function NotificationsTab() {
  return (
    <>
      <Section title="Payment Reminders" sub="Automated alerts for upcoming and overdue payments">
        <Field label="Send Payment Reminder" sub="3 days before due date"><Toggle defaultChecked={true} /></Field>
        <Field label="Send Overdue Alert" sub="When payment is past due date"><Toggle defaultChecked={true} /></Field>
        <Field label="Reminder Channel"><Select options={["Email", "WhatsApp", "Both", "Disabled"]} defaultValue="Both" /></Field>
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
      <Section title="Report Alerts">
        <Field label="Monthly P&L Summary" sub="Delivered on 1st of each month"><Toggle defaultChecked={true} /></Field>
        <Field label="Weekly Occupancy Report"><Toggle defaultChecked={false} /></Field>
        <Field label="Report Email"><Input defaultValue="admin@cospace.in" /></Field>
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
        <Field label="Session Timeout" sub="Auto-logout after inactivity"><Select options={["30 minutes", "1 hour", "4 hours", "Never"]} defaultValue="1 hour" /></Field>
        <Field label="Login Audit Log" sub="Track all admin sign-ins"><Toggle defaultChecked={true} /></Field>
      </Section>
    </>
  );
}

const THEMES = [
  { id: "system", label: "System", desc: "Follows OS preference" },
  { id: "light",  label: "Light",  desc: "Always light" },
  { id: "dark",   label: "Dark",   desc: "Always dark" },
];
const ACCENTS = ["#6366F1","#3B82F6","#10B981","#F59E0B","#EF4444","#8B5CF6","#06B6D4"];

function AppearanceTab() {
  const [theme, setTheme] = useState("system");
  const [accent, setAccent] = useState("#6366F1");
  return (
    <>
      <Section title="Theme" sub="Choose your preferred color mode">
        <div style={{ display: "flex", gap: 12, padding: "20px" }}>
          {THEMES.map(t => (
            <button key={t.id} onClick={() => setTheme(t.id)}
              style={{ flex: 1, padding: "16px", border: `2px solid ${theme === t.id ? "var(--primary)" : "var(--border)"}`, borderRadius: "var(--radius-sm)", background: theme === t.id ? "rgba(99,102,241,0.06)" : "var(--neutral)", cursor: "pointer", textAlign: "center", fontFamily: "inherit", transition: "all 0.15s" }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{t.id === "system" ? "⚙️" : t.id === "light" ? "☀️" : "🌙"}</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: theme === t.id ? "var(--primary)" : "var(--text-primary)" }}>{t.label}</div>
              <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </Section>
      <Section title="Accent Color" sub="Primary color used across the UI">
        <div style={{ padding: "20px", display: "flex", gap: 10, alignItems: "center" }}>
          {ACCENTS.map(c => (
            <button key={c} onClick={() => setAccent(c)}
              style={{ width: 36, height: 36, borderRadius: "50%", background: c, border: `3px solid ${accent === c ? "var(--text-primary)" : "transparent"}`, cursor: "pointer", transition: "all 0.15s", outline: "none" }} />
          ))}
          <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 8 }}>Current: <strong style={{ color: accent }}>{accent}</strong></span>
        </div>
      </Section>
      <Section title="Display">
        <Field label="Compact Table Rows" sub="Reduce row height for more data density"><Toggle defaultChecked={false} /></Field>
        <Field label="Show Serial Numbers" sub="# column in all tables"><Toggle defaultChecked={true} /></Field>
        <Field label="Date Format"><Select options={["DD MMM YYYY", "DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]} defaultValue="DD MMM YYYY" /></Field>
      </Section>
    </>
  );
}

const TAB_CONTENT: Record<string, React.ReactNode> = {
  profile:       <ProfileTab />,
  payments:      <PaymentsTab />,
  notifications: <NotificationsTab />,
  access:        <AccessTab />,
  appearance:    <AppearanceTab />,
};

export default function SettingsPage() {
  const [tab, setTab] = useState("profile");

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>Settings</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Configure your coworking space preferences, billing rules, and access control.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24, alignItems: "start" }}>
        {/* Sidebar */}
        <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", overflow: "hidden", boxShadow: "var(--shadow-sm)", position: "sticky", top: 80 }}>
          {TABS.map(t => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", border: "none", borderBottom: "1px solid var(--border-light)", background: active ? "rgba(99,102,241,0.07)" : "var(--surface)", cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s" }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "var(--neutral)"; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "var(--surface)"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <t.icon size={16} color={active ? "var(--primary)" : "var(--tertiary)"} strokeWidth={active ? 2.2 : 1.8} />
                  <span style={{ fontSize: 13.5, fontWeight: active ? 700 : 500, color: active ? "var(--primary)" : "var(--text-secondary)" }}>{t.label}</span>
                </div>
                {active && <ChevronRight size={14} color="var(--primary)" />}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div>
          {TAB_CONTENT[tab]}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8 }}>
            <button style={{ padding: "9px 20px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface)", color: "var(--text-secondary)", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
            <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 22px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              <Save size={14} /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
