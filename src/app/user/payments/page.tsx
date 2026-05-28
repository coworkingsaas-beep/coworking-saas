"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Member } from "@/lib/supabase";
import { CreditCard, Loader2, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface Payment { id: string; amount: number; mode: string; payment_date: string; month: string; year: number; status: string; notes: string | null; }

export default function UserPaymentsPage() {
  const [member,   setMember]   = useState<Member | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: m } = await supabase.from("members").select("*").eq("email", user.email!).maybeSingle();
      if (m) {
        setMember(m as Member);
        const { data: pay } = await supabase.from("payments").select("*").eq("member_id", m.id).order("payment_date", { ascending: false });
        setPayments((pay ?? []) as Payment[]);
      }
      setLoading(false);
    });
  }, []);

  const dueDate = member?.renewal_date ? new Date(member.renewal_date) : null;
  const today   = new Date();
  const daysLeft = dueDate ? Math.ceil((dueDate.getTime() - today.getTime()) / 86400000) : null;
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const thS: React.CSSProperties = { padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid var(--border)", background: "var(--neutral-dark)", whiteSpace: "nowrap" };
  const tdS: React.CSSProperties = { padding: "12px 16px", background: "var(--surface)", borderBottom: "1px solid var(--border-light)", fontSize: 13.5, color: "var(--text-primary)" };

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}><Loader2 size={36} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }}/></div>;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>Payments</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Your membership payment history and upcoming dues.</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { icon: CreditCard,   bg: "#EDE9FE", color: "#6366F1", label: "Monthly Rent",  value: member?.rent_amount ? `₹${member.rent_amount.toLocaleString()}` : "—" },
          { icon: CheckCircle,  bg: "#D1FAE5", color: "#059669", label: "Total Paid",     value: `₹${totalPaid.toLocaleString()}` },
          { icon: daysLeft !== null && daysLeft <= 7 ? AlertCircle : Clock,
            bg: daysLeft !== null && daysLeft <= 7 ? "#FEE2E2" : "#FEF3C7",
            color: daysLeft !== null && daysLeft <= 7 ? "#EF4444" : "#D97706",
            label: "Next Renewal",
            value: dueDate ? dueDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—",
          },
        ].map(({ icon: Icon, bg, color, label, value }) => (
          <div key={label} style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "20px 22px", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}><Icon size={21} color={color} strokeWidth={1.8}/></div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>{value}</div>
            {label === "Next Renewal" && daysLeft !== null && (
              <div style={{ fontSize: 12, marginTop: 4, color: daysLeft <= 3 ? "#EF4444" : daysLeft <= 7 ? "#D97706" : "var(--text-muted)", fontWeight: 600 }}>{daysLeft > 0 ? `${daysLeft} days remaining` : "Overdue!"}</div>
            )}
          </div>
        ))}
      </div>

      {/* Renewal alert */}
      {daysLeft !== null && daysLeft <= 7 && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "14px 18px", background: daysLeft <= 3 ? "#FEE2E2" : "#FEF3C7", borderRadius: "var(--radius-sm)", border: `1px solid ${daysLeft <= 3 ? "#FCA5A5" : "#FDE68A"}`, marginBottom: 24, fontSize: 13.5, color: daysLeft <= 3 ? "#991B1B" : "#92400E", fontWeight: 600 }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }}/>{daysLeft <= 3 ? `Your membership is ${daysLeft <= 0 ? "overdue" : `expiring in ${daysLeft} day${daysLeft > 1 ? "s" : ""}`}! Please contact the admin to renew.` : `Your membership renews in ${daysLeft} days. Please ensure your payment is ready.`}
        </div>
      )}

      {/* Security deposit */}
      {member?.security_deposit ? (
        <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "16px 20px", boxShadow: "var(--shadow-sm)", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)" }}>Security Deposit Paid</div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>One-time refundable deposit</div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#059669" }}>₹{member.security_deposit.toLocaleString()}</div>
        </div>
      ) : null}

      {/* Payment history */}
      <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Payment History</div>
        {payments.length === 0 ? (
          <div style={{ padding: "36px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13.5, fontStyle: "italic" }}>No payments recorded yet.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 600 }}>
              <thead><tr>{["Month", "Amount", "Mode", "Date", "Status"].map(h => <th key={h} style={thS}>{h}</th>)}</tr></thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).querySelectorAll("td").forEach(c => (c as HTMLElement).style.background = "var(--neutral)")}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).querySelectorAll("td").forEach(c => (c as HTMLElement).style.background = "var(--surface)")}>
                    <td style={tdS}><span style={{ fontWeight: 600 }}>{p.month} {p.year}</span></td>
                    <td style={tdS}><strong style={{ color: "#059669" }}>₹{p.amount.toLocaleString()}</strong></td>
                    <td style={tdS}><span style={{ fontSize: 12, fontWeight: 700, color: "#6366F1", background: "#EDE9FE", padding: "2px 8px", borderRadius: 6 }}>{p.mode}</span></td>
                    <td style={tdS}>{new Date(p.payment_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td style={tdS}><span style={{ fontSize: 11.5, fontWeight: 700, background: "#D1FAE5", color: "#065F46", padding: "3px 10px", borderRadius: 999 }}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
