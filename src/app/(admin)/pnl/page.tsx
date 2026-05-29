"use client";

import { useState } from "react";
import {
  TrendingUp, TrendingDown, IndianRupee, BarChart3,
  Plus, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { useSettings } from "@/lib/useSettings";

// ── Roadmap 3.6 ──────────────────────────────────────────────────────────────
type EntryType = "Income" | "Expense";
type Category  = "Rent" | "Utilities" | "Salary" | "Misc";

interface PnLEntry {
  id: string; date: string; type: EntryType; category: Category;
  amount: number; notes: string; linkedPayment: string | null;
  month: string; year: number;
}

const ENTRIES: PnLEntry[] = [
  // May Income
  { id: "PL-001", date: "03 May 2026", type: "Income",  category: "Rent",      amount: 8500,  notes: "Rahul Sharma — May rent",      linkedPayment: "PMT-001", month: "May", year: 2026 },
  { id: "PL-002", date: "01 May 2026", type: "Income",  category: "Rent",      amount: 4500,  notes: "Rohan Gupta — May rent",       linkedPayment: "PMT-005", month: "May", year: 2026 },
  { id: "PL-003", date: "02 Apr 2026", type: "Income",  category: "Rent",      amount: 1500,  notes: "Kavya Singh — Apr rent",       linkedPayment: "PMT-004", month: "Apr", year: 2026 },
  { id: "PL-004", date: "15 May 2026", type: "Expense", category: "Utilities", amount: 3200,  notes: "Electricity bill — May",       linkedPayment: null,      month: "May", year: 2026 },
  { id: "PL-005", date: "01 May 2026", type: "Expense", category: "Salary",    amount: 25000, notes: "Staff salaries — May",         linkedPayment: null,      month: "May", year: 2026 },
  { id: "PL-006", date: "05 May 2026", type: "Expense", category: "Utilities", amount: 1800,  notes: "Internet & broadband",         linkedPayment: null,      month: "May", year: 2026 },
  { id: "PL-007", date: "10 May 2026", type: "Expense", category: "Misc",      amount: 4500,  notes: "Housekeeping & maintenance",   linkedPayment: null,      month: "May", year: 2026 },
  { id: "PL-008", date: "01 May 2026", type: "Expense", category: "Rent",      amount: 45000, notes: "Office lease — May",           linkedPayment: null,      month: "May", year: 2026 },
  { id: "PL-009", date: "12 Apr 2026", type: "Expense", category: "Utilities", amount: 2900,  notes: "Electricity bill — Apr",       linkedPayment: null,      month: "Apr", year: 2026 },
  { id: "PL-010", date: "01 Apr 2026", type: "Expense", category: "Salary",    amount: 25000, notes: "Staff salaries — Apr",         linkedPayment: null,      month: "Apr", year: 2026 },
  { id: "PL-011", date: "01 Apr 2026", type: "Expense", category: "Rent",      amount: 45000, notes: "Office lease — Apr",           linkedPayment: null,      month: "Apr", year: 2026 },
  { id: "PL-012", date: "28 Apr 2026", type: "Income",  category: "Misc",      amount: 2000,  notes: "Printing & peripheral income", linkedPayment: null,      month: "Apr", year: 2026 },
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

type MonthSummary = { month: string; year: number; income: number; expense: number; profit: number; margin: number; };

function buildSummaries(entries: PnLEntry[]): MonthSummary[] {
  const map: Record<string, MonthSummary> = {};
  entries.forEach(e => {
    const key = `${e.month}-${e.year}`;
    if (!map[key]) map[key] = { month: e.month, year: e.year, income: 0, expense: 0, profit: 0, margin: 0 };
    if (e.type === "Income")  map[key].income  += e.amount;
    if (e.type === "Expense") map[key].expense += e.amount;
  });
  return Object.values(map).map(s => ({
    ...s,
    profit: s.income - s.expense,
    margin: s.income > 0 ? Math.round(((s.income - s.expense) / s.income) * 100) : 0,
  }));
}

const CAT_CONFIG: Record<Category, { bg: string; color: string }> = {
  Rent:      { bg: "#EDE9FE", color: "#6366F1" },
  Utilities: { bg: "#DBEAFE", color: "#3B82F6" },
  Salary:    { bg: "#FEF3C7", color: "#D97706" },
  Misc:      { bg: "#F1F5F9", color: "#64748B" },
};

function CategoryBadge({ cat }: { cat: Category }) {
  const c = CAT_CONFIG[cat];
  return <span style={{ fontSize: 11.5, fontWeight: 700, background: c.bg, color: c.color, padding: "3px 10px", borderRadius: 999 }}>{cat}</span>;
}

function Amount({ val, type, fmt }: { val: number; type: EntryType; fmt: (n: number) => string }) {
  const isIncome = type === "Income";
  return (
    <span style={{ fontWeight: 700, fontSize: 13.5, color: isIncome ? "#10B981" : "#EF4444", display: "flex", alignItems: "center", gap: 3 }}>
      {isIncome ? <ArrowUpRight size={14} strokeWidth={2.5} /> : <ArrowDownRight size={14} strokeWidth={2.5} />}
      {fmt(val)}
    </span>
  );
}

function KpiCard({ icon: Icon, iconColor, iconBg, label, value, trend, trendPositive }: any) {
  return (
    <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "18px 20px", boxShadow: "var(--shadow-sm)", transition: "box-shadow 0.2s, transform 0.2s" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={19} color={iconColor} strokeWidth={1.8} />
        </div>
        {trend !== undefined && (
          <span style={{ fontSize: 12, fontWeight: 700, color: trendPositive ? "#10B981" : "#EF4444", background: trendPositive ? "#D1FAE5" : "#FEE2E2", padding: "3px 8px", borderRadius: 6 }}>
            {trendPositive ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>{value}</div>
    </div>
  );
}

function MonthCard({ s, fmt }: { s: MonthSummary; fmt: (n: number) => string }) {
  const positive = s.profit >= 0;
  return (
    <div style={{ background: "var(--surface)", borderRadius: "var(--radius-sm)", border: `1px solid ${positive ? "var(--border)" : "#FEE2E220"}`, padding: "16px 18px", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{s.month} {s.year}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: positive ? "#10B981" : "#EF4444", background: positive ? "#D1FAE5" : "#FEE2E2", padding: "3px 8px", borderRadius: 6 }}>
          {positive ? "Profit" : "Loss"}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          { label: "Income",   val: s.income,  color: "#10B981" },
          { label: "Expenses", val: s.expense, color: "#EF4444" },
        ].map(({ label, val, color }) => (
          <div key={label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{label}</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color }}>{fmt(val)}</span>
            </div>
            <div style={{ height: 3, background: "var(--border)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min((val / Math.max(s.income, s.expense)) * 100, 100)}%`, background: color, borderRadius: 999 }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid var(--border)", marginTop: 12, paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12.5, fontWeight: 800, color: positive ? "#10B981" : "#EF4444" }}>
          {positive ? "+" : ""}{fmt(s.profit)}
        </span>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Margin: <strong style={{ color: positive ? "#10B981" : "#EF4444" }}>{s.margin}%</strong></span>
      </div>
    </div>
  );
}

const th = (label: string, extra?: React.CSSProperties) => (
  <th key={label} style={{ padding: "11px 14px", textAlign: "left", fontSize: 10.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", borderBottom: "1px solid var(--border)", background: "var(--neutral-dark)", ...extra }}>
    {label}
  </th>
);

// ── Page ─────────────────────────────────────────────────────────────────────
export default function PnLPage() {
  const { fmt } = useSettings();
  const [typeFilter, setTypeFilter] = useState("All");
  const [catFilter,  setCatFilter]  = useState("All");
  const [monthFilter, setMonthFilter] = useState("All");

  const filtered = ENTRIES.filter(e => {
    const tf = typeFilter === "All"  || e.type     === typeFilter;
    const cf = catFilter  === "All"  || e.category === catFilter;
    const mf = monthFilter === "All" || e.month    === monthFilter;
    return tf && cf && mf;
  });

  const totalIncome  = ENTRIES.filter(e => e.type === "Income" ).reduce((s, e) => s + e.amount, 0);
  const totalExpense = ENTRIES.filter(e => e.type === "Expense").reduce((s, e) => s + e.amount, 0);
  const netProfit    = totalIncome - totalExpense;
  const margin       = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

  const summaries = buildSummaries(ENTRIES);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 26, flexWrap: "wrap", gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2, marginBottom: 6 }}>P&L Report</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Income & expense ledger — monthly profit tracking and margin analysis.</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 20px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          <Plus size={15} /> Add Entry
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        <KpiCard icon={IndianRupee}  iconColor="#10B981" iconBg="#D1FAE5" label="Total Income"   value={fmt(totalIncome)}  trend={8}   trendPositive={true} />
        <KpiCard icon={TrendingDown} iconColor="#EF4444" iconBg="#FEE2E2" label="Total Expenses" value={fmt(totalExpense)} trend={3}   trendPositive={false} />
        <KpiCard icon={TrendingUp}   iconColor={netProfit >= 0 ? "#10B981" : "#EF4444"} iconBg={netProfit >= 0 ? "#D1FAE5" : "#FEE2E2"} label="Net Profit" value={`${netProfit >= 0 ? "+" : ""}${fmt(netProfit)}`} />
        <KpiCard icon={BarChart3}    iconColor="#6366F1" iconBg="#EDE9FE" label="Profit Margin"  value={`${margin}%`} />
      </div>

      {/* Month summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14, marginBottom: 24 }}>
        {summaries.map(s => <MonthCard key={`${s.month}-${s.year}`} s={s} fmt={fmt} />)}
      </div>

      {/* Table */}
      <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
        {/* Controls */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {["All","Income","Expense"].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} style={{ padding: "5px 12px", borderRadius: "var(--radius-sm)", border: `1px solid ${typeFilter === t ? "var(--primary)" : "var(--border)"}`, background: typeFilter === t ? "rgba(99,102,241,0.09)" : "var(--surface)", color: typeFilter === t ? "var(--primary)" : "var(--text-secondary)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{t}</button>
          ))}
          <div style={{ width: 1, height: 20, background: "var(--border)" }} />
          {["All","Rent","Utilities","Salary","Misc"].map(c => (
            <button key={c} onClick={() => setCatFilter(c)} style={{ padding: "5px 12px", borderRadius: "var(--radius-sm)", border: `1px solid ${catFilter === c ? (CAT_CONFIG[c as Category]?.color ?? "var(--primary)") : "var(--border)"}`, background: catFilter === c ? `${CAT_CONFIG[c as Category]?.bg ?? "#EDE9FE"}` : "var(--surface)", color: catFilter === c ? (CAT_CONFIG[c as Category]?.color ?? "var(--primary)") : "var(--text-secondary)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{c}</button>
          ))}
          <div style={{ width: 1, height: 20, background: "var(--border)" }} />
          <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
            style={{ padding: "5px 10px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 12.5, fontFamily: "inherit", background: "var(--surface)", color: "var(--text-secondary)", outline: "none", cursor: "pointer" }}>
            <option value="All">All Months</option>
            {MONTHS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 900 }}>
            <thead>
              <tr>
                {th("#", { width: 40 })}
                {th("Entry ID")}
                {th("Date")}
                {th("Type")}
                {th("Category")}
                {th("Amount")}
                {th("Month")}
                {th("Linked Payment")}
                {th("Notes", { minWidth: 220 })}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => {
                const bg = "var(--surface)";
                return (
                  <tr key={e.id}
                    onMouseEnter={r => (r.currentTarget as HTMLElement).querySelectorAll("td").forEach(c => (c as HTMLElement).style.background = "var(--neutral)")}
                    onMouseLeave={r => (r.currentTarget as HTMLElement).querySelectorAll("td").forEach(c => (c as HTMLElement).style.background = bg)}>
                    <td style={{ padding: "12px 14px", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", background: bg, borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap" }}>{i + 1}</td>
                    <td style={{ padding: "12px 14px", background: bg, borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "monospace", fontSize: 12.5, color: "var(--text-secondary)" }}>{e.id}</span>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "var(--text-primary)", background: bg, borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap" }}>{e.date}</td>
                    <td style={{ padding: "12px 14px", background: bg, borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: e.type === "Income" ? "#10B981" : "#EF4444", background: e.type === "Income" ? "#D1FAE5" : "#FEE2E2", padding: "3px 10px", borderRadius: 999 }}>
                        {e.type === "Income" ? "↑" : "↓"} {e.type}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", background: bg, borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap" }}><CategoryBadge cat={e.category} /></td>
                    <td style={{ padding: "12px 14px", background: bg, borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap" }}><Amount val={e.amount} type={e.type} fmt={fmt} /></td>
                    <td style={{ padding: "12px 14px", fontSize: 12.5, color: "var(--text-secondary)", background: bg, borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap" }}>{e.month} {e.year}</td>
                    <td style={{ padding: "12px 14px", background: bg, borderBottom: "1px solid var(--border-light)", whiteSpace: "nowrap" }}>
                      {e.linkedPayment
                        ? <span style={{ fontSize: 12, fontFamily: "monospace", color: "#6366F1" }}>→ {e.linkedPayment}</span>
                        : <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 12.5, color: "var(--text-muted)", background: bg, borderBottom: "1px solid var(--border-light)", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.notes}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={9} style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>No entries match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ padding: "13px 20px", background: "var(--neutral)", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 20 }}>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Showing <strong style={{ color: "var(--text-primary)" }}>{filtered.length}</strong> of <strong style={{ color: "var(--text-primary)" }}>{ENTRIES.length}</strong> entries</span>
            <span style={{ fontSize: 13, color: "#10B981", fontWeight: 700 }}>
              ↑ {fmt(filtered.filter(e => e.type === "Income").reduce((s, e) => s + e.amount, 0))}
            </span>
            <span style={{ fontSize: 13, color: "#EF4444", fontWeight: 700 }}>
              ↓ {fmt(filtered.filter(e => e.type === "Expense").reduce((s, e) => s + e.amount, 0))}
            </span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={{ width: 30, height: 30, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronLeft size={13} color="var(--text-secondary)" /></button>
            {[1].map(p => <button key={p} style={{ width: 30, height: 30, borderRadius: "var(--radius-sm)", border: "1px solid var(--primary)", background: "var(--primary)", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>{p}</button>)}
            <button style={{ width: 30, height: 30, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronRight size={13} color="var(--text-secondary)" /></button>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginTop: 20 }}>
        {(["Rent","Utilities","Salary","Misc"] as Category[]).map(cat => {
          const c = CAT_CONFIG[cat];
          const income  = ENTRIES.filter(e => e.category === cat && e.type === "Income").reduce((s, e) => s + e.amount, 0);
          const expense = ENTRIES.filter(e => e.category === cat && e.type === "Expense").reduce((s, e) => s + e.amount, 0);
          return (
            <div key={cat} style={{ background: "var(--surface)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{cat}</span>
                <span style={{ fontSize: 11.5, fontWeight: 700, background: c.bg, color: c.color, padding: "2px 8px", borderRadius: 999 }}>Category</span>
              </div>
              {income  > 0 && <div style={{ fontSize: 12.5, color: "#10B981", fontWeight: 700, marginBottom: 3 }}>↑ {fmt(income)}</div>}
              {expense > 0 && <div style={{ fontSize: 12.5, color: "#EF4444", fontWeight: 700 }}>↓ {fmt(expense)}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
