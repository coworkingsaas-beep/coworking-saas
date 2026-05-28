"use client";

import { useState } from "react";
import { Building2, Users, CheckCircle, LayoutGrid, List, Plus, Search } from "lucide-react";

// ── Roadmap 3.3: D1-D28 = Dedicated Desks, C1-C4 = Cabins ─────────────────
type SpaceType = "Seat" | "Cabin";
type SpaceStatus = "Occupied" | "Available";

interface Workspace {
  spaceId: string; spaceType: SpaceType; status: SpaceStatus;
  assignedMember: string | null; initials: string | null; color: string | null; notes: string;
}

const WORKSPACES: Workspace[] = [
  ...Array.from({ length: 28 }, (_, i) => {
    const num = i + 1;
    const occupied = [1,2,4,5,7,8,9,10,12,14,15,17,18,20,21,22,24,25,28].includes(num);
    const members = ["Rahul S.","Priya P.","Ankit M.","Kavya S.","Rohan G.","Sneha J.","Dev M.","Nisha K.","Arun T.","Meena R.","Vinay S.","Deepa L.","Suresh P.","Priti V.","Kunal B.","Ramesh D.","Ananya K.","Mohit S.","Tejas N."];
    const colors  = ["#6366F1","#F59E0B","#EF4444","#94A3B8","#10B981","#8B5CF6","#06B6D4","#F97316","#14B8A6","#EC4899","#84CC16","#6366F1","#F59E0B","#EF4444","#3B82F6","#10B981","#8B5CF6","#06B6D4","#F97316"];
    const initArr  = ["RS","PP","AM","KS","RG","SJ","DM","NK","AT","MR","VS","DL","SP","PV","KB","RD","AK","MS","TN"];
    const idx = occupied ? [1,2,4,5,7,8,9,10,12,14,15,17,18,20,21,22,24,25,28].indexOf(num) : 0;
    return {
      spaceId: `D${num}`, spaceType: "Seat" as SpaceType,
      status: (occupied ? "Occupied" : "Available") as SpaceStatus,
      assignedMember: occupied ? members[idx] : null,
      initials: occupied ? initArr[idx] : null,
      color: occupied ? colors[idx] : null,
      notes: "",
    };
  }),
  ...["C1","C2","C3","C4"].map((id, i) => ({
    spaceId: id, spaceType: "Cabin" as SpaceType,
    status: (i < 3 ? "Occupied" : "Available") as SpaceStatus,
    assignedMember: i < 3 ? ["Ankit M.","Rohan G.","Sneha J."][i] : null,
    initials: i < 3 ? ["AM","RG","SJ"][i] : null,
    color: i < 3 ? ["#EF4444","#10B981","#8B5CF6"][i] : null,
    notes: i === 0 ? "Two-Seater" : i === 1 ? "Manager Cabin" : i === 2 ? "Manager Cabin" : "",
  })),
];

function KpiCard({ icon: Icon, iconColor, iconBg, label, value, sub }: any) {
  return (
    <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "20px 22px", boxShadow: "var(--shadow-sm)", transition: "box-shadow 0.2s, transform 0.2s" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
        <Icon size={21} color={iconColor} strokeWidth={1.8} />
      </div>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// Grid card for a single space
function SpaceCard({ ws }: { ws: Workspace }) {
  const occupied = ws.status === "Occupied";
  const isCabin = ws.spaceType === "Cabin";
  return (
    <div style={{
      background: "var(--surface)", borderRadius: "var(--radius-sm)", border: `1.5px solid ${occupied ? (isCabin ? "#6366F130" : "#6366F118") : "var(--border)"}`,
      padding: "14px", boxShadow: occupied ? "var(--shadow-sm)" : "none",
      position: "relative", overflow: "hidden", transition: "all 0.18s",
      cursor: "default",
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = occupied ? "var(--shadow-sm)" : "none"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
    >
      {/* top bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: occupied ? (ws.color ?? "var(--primary)") : "var(--border)" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, marginTop: 4 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: occupied ? "var(--primary)" : "var(--text-muted)" }}>{ws.spaceId}</div>
        <span style={{
          fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 999,
          background: occupied ? "#EDE9FE" : "#F0FDF4", color: occupied ? "#6366F1" : "#059669",
        }}>
          {occupied ? "Occupied" : "Free"}
        </span>
      </div>

      {occupied && ws.assignedMember ? (
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${ws.color}22`, border: `2px solid ${ws.color}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: ws.color!, flexShrink: 0 }}>
            {ws.initials}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {ws.assignedMember}
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>Available</div>
      )}

      <div style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 8, fontWeight: 500 }}>
        {isCabin ? "🏢 Cabin" : "💺 Desk"}{ws.notes ? ` · ${ws.notes}` : ""}
      </div>
    </div>
  );
}

// Table row
function SpaceRow({ ws, idx }: { ws: Workspace; idx: number }) {
  const occupied = ws.status === "Occupied";
  return (
    <tr onMouseEnter={e => (e.currentTarget as HTMLElement).querySelectorAll("td").forEach(c => (c as HTMLElement).style.background = "var(--neutral)")}
      onMouseLeave={e => (e.currentTarget as HTMLElement).querySelectorAll("td").forEach(c => (c as HTMLElement).style.background = "var(--surface)")}>
      {[
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>{idx + 1}</span>,
        <strong style={{ color: "var(--primary)", fontSize: 14 }}>{ws.spaceId}</strong>,
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>{ws.spaceType === "Seat" ? "💺 Dedicated Desk" : "🏢 Cabin"}</span>,
        <span style={{ fontSize: 11.5, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: occupied ? "#EDE9FE" : "#F0FDF4", color: occupied ? "#6366F1" : "#059669" }}>{ws.status}</span>,
        occupied && ws.assignedMember ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${ws.color}22`, border: `2px solid ${ws.color}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: ws.color! }}>{ws.initials}</div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{ws.assignedMember}</span>
          </div>
        ) : <span style={{ color: "var(--text-muted)", fontSize: 13 }}>—</span>,
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{ws.notes || "—"}</span>,
      ].map((cell, ci) => (
        <td key={ci} style={{ padding: "12px 16px", whiteSpace: "nowrap", background: "var(--surface)", borderBottom: "1px solid var(--border-light)", ...(ci === 0 ? { position: "sticky" as const, left: 0, zIndex: 2 } : {}) }}>
          {cell}
        </td>
      ))}
    </tr>
  );
}

export default function WorkspacesPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = WORKSPACES.filter(ws => {
    const q = search.toLowerCase();
    const mq = ws.spaceId.toLowerCase().includes(q) || (ws.assignedMember ?? "").toLowerCase().includes(q);
    const tf = typeFilter === "All" || (typeFilter === "Desks" && ws.spaceType === "Seat") || (typeFilter === "Cabins" && ws.spaceType === "Cabin");
    const sf = statusFilter === "All" || ws.status === statusFilter;
    return mq && tf && sf;
  });

  const totalSpaces  = WORKSPACES.length;
  const occupied     = WORKSPACES.filter(w => w.status === "Occupied").length;
  const available    = WORKSPACES.filter(w => w.status === "Available").length;
  const occupancyPct = Math.round((occupied / totalSpaces) * 100);

  const desks  = filtered.filter(w => w.spaceType === "Seat");
  const cabins = filtered.filter(w => w.spaceType === "Cabin");

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2, marginBottom: 6 }}>Workspace Inventory</h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>All seats and cabins — the single source of truth for space assignments. D1–D28 · C1–C4</p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
        <KpiCard icon={Building2}   iconColor="#6366F1" iconBg="#EDE9FE" label="Total Spaces"      value={totalSpaces}    sub="28 desks · 4 cabins" />
        <KpiCard icon={Users}       iconColor="#EF4444" iconBg="#FEE2E2" label="Occupied"          value={occupied}       sub={`${occupancyPct}% capacity`} />
        <KpiCard icon={CheckCircle} iconColor="#10B981" iconBg="#D1FAE5" label="Available"         value={available}      sub="Ready to assign" />
        <KpiCard icon={LayoutGrid}  iconColor="#F59E0B" iconBg="#FEF3C7" label="Occupancy Rate"    value={`${occupancyPct}%`} sub="Target ≥ 85%" />
      </div>

      {/* Occupancy bar */}
      <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "20px 24px", marginBottom: 24, boxShadow: "var(--shadow-sm)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Overall Occupancy</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--primary)" }}>{occupied}/{totalSpaces} spaces</span>
        </div>
        <div style={{ height: 10, background: "var(--border)", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${occupancyPct}%`, background: "linear-gradient(90deg, var(--primary) 0%, var(--primary-light) 100%)", borderRadius: 999, transition: "width 0.6s ease" }} />
        </div>
        <div style={{ display: "flex", gap: 24, marginTop: 10 }}>
          {[
            { label: "Dedicated Desks", occ: WORKSPACES.filter(w => w.spaceType === "Seat" && w.status === "Occupied").length, total: 28 },
            { label: "Cabins", occ: WORKSPACES.filter(w => w.spaceType === "Cabin" && w.status === "Occupied").length, total: 4 },
          ].map(({ label, occ, total }) => (
            <div key={label} style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
              <strong style={{ color: "var(--text-primary)" }}>{label}:</strong> {occ}/{total} occupied ({Math.round((occ/total)*100)}%)
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <Search size={14} color="var(--tertiary)" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search space or member…"
              style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontFamily: "inherit", background: "var(--neutral)", color: "var(--text-primary)", outline: "none", width: 230 }}
              onFocus={e => (e.currentTarget.style.borderColor = "var(--primary)")}
              onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")} />
          </div>
          {["All","Desks","Cabins"].map(f => (
            <button key={f} onClick={() => setTypeFilter(f)} style={{ padding: "6px 13px", borderRadius: "var(--radius-sm)", border: `1px solid ${typeFilter === f ? "var(--primary)" : "var(--border)"}`, background: typeFilter === f ? "rgba(99,102,241,0.09)" : "var(--surface)", color: typeFilter === f ? "var(--primary)" : "var(--text-secondary)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{f}</button>
          ))}
          {["All","Occupied","Available"].map(f => (
            <button key={f} onClick={() => setStatusFilter(f)} style={{ padding: "6px 13px", borderRadius: "var(--radius-sm)", border: `1px solid ${statusFilter === f ? "var(--primary)" : "var(--border)"}`, background: statusFilter === f ? "rgba(99,102,241,0.09)" : "var(--surface)", color: statusFilter === f ? "var(--primary)" : "var(--text-secondary)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{f}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {[{ mode: "grid" as const, Icon: LayoutGrid }, { mode: "list" as const, Icon: List }].map(({ mode, Icon }) => (
            <button key={mode} onClick={() => setViewMode(mode)} style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${viewMode === mode ? "var(--primary)" : "var(--border)"}`, borderRadius: "var(--radius-sm)", background: viewMode === mode ? "rgba(99,102,241,0.09)" : "var(--surface)", cursor: "pointer" }}>
              <Icon size={16} color={viewMode === mode ? "var(--primary)" : "var(--text-secondary)"} strokeWidth={1.8} />
            </button>
          ))}
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            <Plus size={14} /> Add Space
          </button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <>
          {desks.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <span>💺 Dedicated Desks</span>
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>({desks.filter(d => d.status === "Occupied").length}/{desks.length} occupied)</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
                {desks.map(ws => <SpaceCard key={ws.spaceId} ws={ws} />)}
              </div>
            </div>
          )}
          {cabins.length > 0 && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <span>🏢 Cabins</span>
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>({cabins.filter(c => c.status === "Occupied").length}/{cabins.length} occupied)</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
                {cabins.map(ws => <SpaceCard key={ws.spaceId} ws={ws} />)}
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 700 }}>
              <thead>
                <tr style={{ background: "var(--neutral-dark)" }}>
                  {["#","Space ID","Type","Status","Assigned Member","Notes"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", borderBottom: "1px solid var(--border)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((ws, idx) => <SpaceRow key={ws.spaceId} ws={ws} idx={idx} />)}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>No spaces match your filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
