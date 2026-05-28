"use client";

import { useState, useEffect, useCallback } from "react";
import { Building2, Users, CheckCircle, LayoutGrid, List, Plus, Search, X, Loader2, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface SpaceRow {
  id: string; code: string; label: string;
  type: "Desk" | "Cabin" | "Meeting Room";
  capacity: number; is_active: boolean;
  // joined from members
  memberId: string | null; memberName: string | null;
  initials: string | null; color: string | null;
}

interface MemberOption { id: string; name: string; initials: string; color: string; assigned_space: string | null; }

const COLORS = ["#6366F1","#F59E0B","#EF4444","#94A3B8","#10B981","#8B5CF6","#06B6D4","#F97316","#14B8A6","#EC4899"];

function KpiCard({ icon: Icon, iconColor, iconBg, label, value, sub }: any) {
  return (
    <div style={{ background:"var(--surface)", borderRadius:"var(--radius)", border:"1px solid var(--border)", padding:"20px 22px", boxShadow:"var(--shadow-sm)", transition:"box-shadow 0.2s,transform 0.2s" }}
      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.boxShadow="var(--shadow-md)";(e.currentTarget as HTMLElement).style.transform="translateY(-2px)"}}
      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.boxShadow="var(--shadow-sm)";(e.currentTarget as HTMLElement).style.transform="translateY(0)"}}>
      <div style={{width:44,height:44,borderRadius:10,background:iconBg,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14}}><Icon size={21} color={iconColor} strokeWidth={1.8}/></div>
      <div style={{fontSize:11.5,fontWeight:600,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>{label}</div>
      <div style={{fontSize:26,fontWeight:800,color:"var(--text-primary)"}}>{value}</div>
      {sub&&<div style={{fontSize:12,color:"var(--text-muted)",marginTop:4}}>{sub}</div>}
    </div>
  );
}

// ── Reassign Modal ────────────────────────────────────────────────────────────
function ReassignModal({ space, members, onClose, onSaved }: {
  space: SpaceRow; members: MemberOption[];
  onClose: ()=>void; onSaved: ()=>void;
}) {
  const [selected, setSelected] = useState<string>(space.memberId ?? "");
  const [saving, setSaving]     = useState(false);
  const [saved,  setSaved2]     = useState(false);

  const save = async () => {
    setSaving(true);
    // If previously occupied by someone else, unassign them first
    if (space.memberId && space.memberId !== selected) {
      await supabase.from("members").update({ assigned_space: null }).eq("id", space.memberId);
    }
    if (selected) {
      // Unassign from their current space first
      const prev = members.find(m => m.id === selected);
      if (prev?.assigned_space && prev.assigned_space !== space.code) {
        // already handled by update below
      }
      await supabase.from("members").update({ assigned_space: space.code }).eq("id", selected);
    } else if (space.memberId) {
      await supabase.from("members").update({ assigned_space: null }).eq("id", space.memberId);
    }
    setSaving(false); setSaved2(true);
    setTimeout(() => { onSaved(); onClose(); }, 600);
  };

  const currentMember = members.find(m => m.id === space.memberId);
  const typeLabel = space.type === "Desk" ? "💺 Desk" : space.type === "Cabin" ? "🏢 Cabin" : "📋 Meeting Room";

  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:99,backdropFilter:"blur(2px)"}}/>
      <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:100,width:"min(440px,95vw)",background:"var(--surface)",borderRadius:"var(--radius)",border:"1px solid var(--border)",boxShadow:"0 24px 64px rgba(0,0,0,0.18)"}}>
        {/* Header */}
        <div style={{padding:"18px 20px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:"var(--text-primary)"}}>Reassign Space</div>
            <div style={{fontSize:12.5,color:"var(--text-muted)",marginTop:2}}>{typeLabel} · {space.code}</div>
          </div>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:"50%",border:"1px solid var(--border)",background:"var(--neutral)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            <X size={14} color="var(--text-muted)"/>
          </button>
        </div>
        {/* Body */}
        <div style={{padding:20}}>
          {currentMember && (
            <div style={{marginBottom:14,padding:"10px 14px",background:"#FEF3C7",borderRadius:"var(--radius-sm)",fontSize:13,color:"#92400E",fontWeight:600}}>
              Currently: {currentMember.name}
            </div>
          )}
          <label style={{display:"block",fontSize:12,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>
            Assign to Member
          </label>
          <select
            value={selected}
            onChange={e=>setSelected(e.target.value)}
            style={{width:"100%",padding:"10px 12px",border:"1px solid var(--border)",borderRadius:"var(--radius-sm)",fontSize:13.5,fontFamily:"inherit",background:"var(--neutral)",color:"var(--text-primary)",outline:"none",cursor:"pointer"}}
          >
            <option value="">— Leave Vacant —</option>
            {members.map(m=>(
              <option key={m.id} value={m.id}>
                {m.name}{m.assigned_space && m.assigned_space !== space.code ? ` (at ${m.assigned_space})` : ""}
              </option>
            ))}
          </select>
          {selected && selected !== space.memberId && members.find(m=>m.id===selected)?.assigned_space && members.find(m=>m.id===selected)?.assigned_space !== space.code && (
            <div style={{marginTop:8,fontSize:12,color:"#EF4444",fontWeight:600}}>
              ⚠️ This member is already at {members.find(m=>m.id===selected)?.assigned_space}. Reassigning will move them here.
            </div>
          )}
        </div>
        {/* Footer */}
        <div style={{padding:"14px 20px",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"flex-end",gap:10,background:"var(--neutral)"}}>
          <button onClick={onClose} style={{padding:"8px 18px",border:"1px solid var(--border)",borderRadius:"var(--radius-sm)",background:"var(--surface)",color:"var(--text-secondary)",fontSize:13.5,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
          <button onClick={save} disabled={saving} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 20px",background:saved?"#10B981":"var(--primary)",color:"#fff",border:"none",borderRadius:"var(--radius-sm)",fontSize:13.5,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"background 0.3s"}}>
            {saving?<Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/>:saved?<Check size={13}/>:null}
            {saving?"Saving…":saved?"Saved!":"Confirm"}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Space Card ────────────────────────────────────────────────────────────────
function SpaceCard({ ws, onClick }: { ws: SpaceRow; onClick: ()=>void }) {
  const occupied = !!ws.memberId;
  const isCabin  = ws.type === "Cabin";
  return (
    <div onClick={onClick} style={{background:"var(--surface)",borderRadius:"var(--radius-sm)",border:`1.5px solid ${occupied?(isCabin?"#6366F130":"#6366F118"):"var(--border)"}`,padding:"14px",boxShadow:occupied?"var(--shadow-sm)":"none",position:"relative",overflow:"hidden",transition:"all 0.18s",cursor:"pointer"}}
      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.boxShadow="var(--shadow-md)";(e.currentTarget as HTMLElement).style.transform="translateY(-1px)"}}
      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.boxShadow=occupied?"var(--shadow-sm)":"none";(e.currentTarget as HTMLElement).style.transform="translateY(0)"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:occupied?(ws.color??"var(--primary)"):"var(--border)"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10,marginTop:4}}>
        <div style={{fontSize:15,fontWeight:800,color:occupied?"var(--primary)":"var(--text-muted)"}}>{ws.code}</div>
        <span style={{fontSize:10.5,fontWeight:700,padding:"2px 7px",borderRadius:999,background:occupied?"#EDE9FE":"#F0FDF4",color:occupied?"#6366F1":"#059669"}}>
          {occupied?"Occupied":"Free"}
        </span>
      </div>
      {occupied&&ws.memberName?(
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <div style={{width:28,height:28,borderRadius:"50%",background:`${ws.color}22`,border:`2px solid ${ws.color}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:ws.color!,flexShrink:0}}>{ws.initials}</div>
          <div style={{fontSize:12,fontWeight:600,color:"var(--text-secondary)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ws.memberName}</div>
        </div>
      ):(
        <div style={{fontSize:12,color:"var(--text-muted)",fontStyle:"italic"}}>Available · click to assign</div>
      )}
      <div style={{fontSize:10.5,color:"var(--text-muted)",marginTop:8,fontWeight:500}}>
        {ws.type==="Desk"?"💺 Desk":ws.type==="Cabin"?"🏢 Cabin":"📋 Meeting Room"}
      </div>
    </div>
  );
}

export default function WorkspacesPage() {
  const [spaces,  setSpaces]   = useState<SpaceRow[]>([]);
  const [members, setMembers]  = useState<MemberOption[]>([]);
  const [loading, setLoading]  = useState(true);
  const [search,  setSearch]   = useState("");
  const [typeFilter,   setTypeFilter]   = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"grid"|"list">("grid");
  const [selected, setSelected] = useState<SpaceRow|null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: sp }, { data: mb }] = await Promise.all([
      supabase.from("spaces").select("*").eq("is_active", true).order("type").order("code"),
      supabase.from("members").select("id,name,assigned_space,status").eq("status","Active"),
    ]);
    const memberList: MemberOption[] = (mb??[]).map((m:any,i:number)=>({
      id: m.id, name: m.name,
      initials: m.name.split(" ").map((n:string)=>n[0]).join("").toUpperCase().slice(0,2),
      color: COLORS[i%COLORS.length],
      assigned_space: m.assigned_space,
    }));
    setMembers(memberList);
    const bySpace: Record<string,MemberOption> = {};
    memberList.forEach(m=>{ if(m.assigned_space) bySpace[m.assigned_space]=m; });
    const rows: SpaceRow[] = (sp??[]).map((s:any)=>{
      const m = bySpace[s.code];
      return { ...s, memberId:m?.id??null, memberName:m?.name??null, initials:m?.initials??null, color:m?.color??null };
    });
    setSpaces(rows);
    setLoading(false);
  }, []);

  useEffect(()=>{ load(); },[load]);

  const filtered = spaces.filter(s=>{
    const q = search.toLowerCase();
    const mq = s.code.toLowerCase().includes(q)||(s.memberName??"").toLowerCase().includes(q);
    const tf = typeFilter==="All"||(typeFilter==="Desks"&&s.type==="Desk")||(typeFilter==="Cabins"&&s.type==="Cabin")||(typeFilter==="Meeting Rooms"&&s.type==="Meeting Room");
    const sf = statusFilter==="All"||(statusFilter==="Occupied"&&!!s.memberId)||(statusFilter==="Available"&&!s.memberId);
    return mq&&tf&&sf;
  });

  const occupied     = spaces.filter(s=>!!s.memberId).length;
  const totalSpaces  = spaces.length;
  const available    = totalSpaces - occupied;
  const occupancyPct = totalSpaces>0?Math.round((occupied/totalSpaces)*100):0;
  const desks  = filtered.filter(s=>s.type==="Desk");
  const cabins = filtered.filter(s=>s.type==="Cabin");
  const mrooms = filtered.filter(s=>s.type==="Meeting Room");

  const thStyle: React.CSSProperties = {padding:"12px 16px",textAlign:"left",fontSize:11,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.06em",whiteSpace:"nowrap",borderBottom:"1px solid var(--border)",background:"var(--neutral-dark)"};
  const tdStyle: React.CSSProperties = {padding:"12px 16px",whiteSpace:"nowrap",background:"var(--surface)",borderBottom:"1px solid var(--border-light)"};

  if (loading) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"60vh",gap:16}}>
      <Loader2 size={40} color="var(--primary)" style={{animation:"spin 1s linear infinite"}}/>
      <p style={{fontSize:14,color:"var(--text-muted)"}}>Loading workspace data…</p>
    </div>
  );

  return (
    <div>
      {selected&&<ReassignModal space={selected} members={members} onClose={()=>setSelected(null)} onSaved={load}/>}

      <div style={{marginBottom:28}}>
        <h1 style={{fontSize:28,fontWeight:800,color:"var(--text-primary)",lineHeight:1.2,marginBottom:6}}>Workspace Inventory</h1>
        <p style={{fontSize:14,color:"var(--text-muted)"}}>Click any space to reassign members. Live data from Supabase.</p>
      </div>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:28}}>
        <KpiCard icon={Building2}   iconColor="#6366F1" iconBg="#EDE9FE" label="Total Spaces"   value={totalSpaces} sub={`${spaces.filter(s=>s.type==="Desk").length} desks · ${spaces.filter(s=>s.type==="Cabin").length} cabins`}/>
        <KpiCard icon={Users}       iconColor="#EF4444" iconBg="#FEE2E2" label="Occupied"       value={occupied} sub={`${occupancyPct}% capacity`}/>
        <KpiCard icon={CheckCircle} iconColor="#10B981" iconBg="#D1FAE5" label="Available"      value={available} sub="Ready to assign"/>
        <KpiCard icon={LayoutGrid}  iconColor="#F59E0B" iconBg="#FEF3C7" label="Occupancy Rate" value={`${occupancyPct}%`} sub="Target ≥ 85%"/>
      </div>

      {/* Occupancy bar */}
      <div style={{background:"var(--surface)",borderRadius:"var(--radius)",border:"1px solid var(--border)",padding:"20px 24px",marginBottom:24,boxShadow:"var(--shadow-sm)"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
          <span style={{fontSize:14,fontWeight:700,color:"var(--text-primary)"}}>Overall Occupancy</span>
          <span style={{fontSize:14,fontWeight:700,color:"var(--primary)"}}>{occupied}/{totalSpaces} spaces</span>
        </div>
        <div style={{height:10,background:"var(--border)",borderRadius:999,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${occupancyPct}%`,background:"linear-gradient(90deg,var(--primary) 0%,var(--primary-light,#818CF8) 100%)",borderRadius:999,transition:"width 0.6s ease"}}/>
        </div>
        <div style={{display:"flex",gap:24,marginTop:10}}>
          {[{label:"Desks",t:"Desk"},{label:"Cabins",t:"Cabin"},{label:"Meeting Rooms",t:"Meeting Room"}].map(({label,t})=>{
            const total=spaces.filter(s=>s.type===t).length;
            const occ=spaces.filter(s=>s.type===t&&!!s.memberId).length;
            return <div key={t} style={{fontSize:12.5,color:"var(--text-muted)"}}><strong style={{color:"var(--text-primary)"}}>{label}:</strong> {occ}/{total} occupied ({total>0?Math.round((occ/total)*100):0}%)</div>;
          })}
        </div>
      </div>

      {/* Controls */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{position:"relative"}}>
            <Search size={14} color="var(--tertiary)" style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)"}}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search space or member…"
              style={{paddingLeft:32,paddingRight:12,paddingTop:7,paddingBottom:7,border:"1px solid var(--border)",borderRadius:"var(--radius-sm)",fontSize:13.5,fontFamily:"inherit",background:"var(--neutral)",color:"var(--text-primary)",outline:"none",width:230}}
              onFocus={e=>(e.currentTarget.style.borderColor="var(--primary)")} onBlur={e=>(e.currentTarget.style.borderColor="var(--border)")}/>
          </div>
          {["All","Desks","Cabins","Meeting Rooms"].map(f=>(
            <button key={f} onClick={()=>setTypeFilter(f)} style={{padding:"6px 13px",borderRadius:"var(--radius-sm)",border:`1px solid ${typeFilter===f?"var(--primary)":"var(--border)"}`,background:typeFilter===f?"rgba(99,102,241,0.09)":"var(--surface)",color:typeFilter===f?"var(--primary)":"var(--text-secondary)",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{f}</button>
          ))}
          {["All","Occupied","Available"].map(f=>(
            <button key={f} onClick={()=>setStatusFilter(f)} style={{padding:"6px 13px",borderRadius:"var(--radius-sm)",border:`1px solid ${statusFilter===f?"var(--primary)":"var(--border)"}`,background:statusFilter===f?"rgba(99,102,241,0.09)":"var(--surface)",color:statusFilter===f?"var(--primary)":"var(--text-secondary)",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{f}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {[{mode:"grid" as const,Icon:LayoutGrid},{mode:"list" as const,Icon:List}].map(({mode,Icon})=>(
            <button key={mode} onClick={()=>setViewMode(mode)} style={{width:34,height:34,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${viewMode===mode?"var(--primary)":"var(--border)"}`,borderRadius:"var(--radius-sm)",background:viewMode===mode?"rgba(99,102,241,0.09)":"var(--surface)",cursor:"pointer"}}>
              <Icon size={16} color={viewMode===mode?"var(--primary)":"var(--text-secondary)"} strokeWidth={1.8}/>
            </button>
          ))}
          <button style={{display:"flex",alignItems:"center",gap:6,padding:"7px 16px",background:"var(--primary)",color:"#fff",border:"none",borderRadius:"var(--radius-sm)",fontSize:13.5,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
            <Plus size={14}/> Add Space
          </button>
        </div>
      </div>

      {viewMode==="grid"?(
        <>
          {desks.length>0&&(
            <div style={{marginBottom:28}}>
              <div style={{fontSize:14,fontWeight:700,color:"var(--text-secondary)",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
                <span>💺 Dedicated Desks</span>
                <span style={{fontSize:12,color:"var(--text-muted)",fontWeight:500}}>({desks.filter(d=>!!d.memberId).length}/{desks.length} occupied)</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10}}>
                {desks.map(ws=><SpaceCard key={ws.id} ws={ws} onClick={()=>setSelected(ws)}/>)}
              </div>
            </div>
          )}
          {cabins.length>0&&(
            <div style={{marginBottom:28}}>
              <div style={{fontSize:14,fontWeight:700,color:"var(--text-secondary)",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
                <span>🏢 Cabins</span>
                <span style={{fontSize:12,color:"var(--text-muted)",fontWeight:500}}>({cabins.filter(c=>!!c.memberId).length}/{cabins.length} occupied)</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10}}>
                {cabins.map(ws=><SpaceCard key={ws.id} ws={ws} onClick={()=>setSelected(ws)}/>)}
              </div>
            </div>
          )}
          {mrooms.length>0&&(
            <div>
              <div style={{fontSize:14,fontWeight:700,color:"var(--text-secondary)",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
                <span>📋 Meeting Rooms</span>
                <span style={{fontSize:12,color:"var(--text-muted)",fontWeight:500}}>({mrooms.filter(m=>!!m.memberId).length}/{mrooms.length} occupied)</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10}}>
                {mrooms.map(ws=><SpaceCard key={ws.id} ws={ws} onClick={()=>setSelected(ws)}/>)}
              </div>
            </div>
          )}
          {filtered.length===0&&<div style={{textAlign:"center",padding:48,color:"var(--text-muted)",fontSize:14}}>No spaces match your filters.</div>}
        </>
      ):(
        <div style={{background:"var(--surface)",borderRadius:"var(--radius)",border:"1px solid var(--border)",boxShadow:"var(--shadow-sm)",overflow:"hidden"}}>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"separate",borderSpacing:0,minWidth:700}}>
              <thead>
                <tr>
                  {["#","Code","Type","Status","Assigned Member","Action"].map(h=>(
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((ws,idx)=>{
                  const occ=!!ws.memberId;
                  return (
                    <tr key={ws.id}
                      onMouseEnter={e=>(e.currentTarget as HTMLElement).querySelectorAll("td").forEach(c=>(c as HTMLElement).style.background="var(--neutral)")}
                      onMouseLeave={e=>(e.currentTarget as HTMLElement).querySelectorAll("td").forEach(c=>(c as HTMLElement).style.background="var(--surface)")}>
                      <td style={tdStyle}><span style={{fontSize:12,fontWeight:700,color:"var(--text-muted)"}}>{idx+1}</span></td>
                      <td style={tdStyle}><strong style={{color:"var(--primary)",fontSize:14}}>{ws.code}</strong></td>
                      <td style={tdStyle}><span style={{fontSize:13,color:"var(--text-secondary)"}}>{ws.type==="Desk"?"💺 Desk":ws.type==="Cabin"?"🏢 Cabin":"📋 Meeting Room"}</span></td>
                      <td style={tdStyle}><span style={{fontSize:11.5,fontWeight:700,padding:"3px 10px",borderRadius:999,background:occ?"#EDE9FE":"#F0FDF4",color:occ?"#6366F1":"#059669"}}>{occ?"Occupied":"Available"}</span></td>
                      <td style={tdStyle}>
                        {occ&&ws.memberName?(
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{width:28,height:28,borderRadius:"50%",background:`${ws.color}22`,border:`2px solid ${ws.color}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:ws.color!}}>{ws.initials}</div>
                            <span style={{fontSize:13,fontWeight:600,color:"var(--text-primary)"}}>{ws.memberName}</span>
                          </div>
                        ):<span style={{color:"var(--text-muted)",fontSize:13}}>—</span>}
                      </td>
                      <td style={tdStyle}>
                        <button onClick={()=>setSelected(ws)} style={{padding:"5px 12px",border:"1px solid var(--border)",borderRadius:"var(--radius-sm)",background:"var(--neutral)",color:"var(--text-secondary)",fontSize:12.5,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                          {occ?"Reassign":"Assign"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length===0&&<tr><td colSpan={6} style={{padding:40,textAlign:"center",color:"var(--text-muted)"}}>No spaces match your filters.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
