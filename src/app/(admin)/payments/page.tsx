"use client";
import { useState, useEffect } from "react";
import { CreditCard, AlertTriangle, CheckCircle, Clock, Search, Plus, ChevronLeft, ChevronRight, Loader2, IndianRupee, RefreshCw, Banknote } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Member } from "@/lib/supabase";
import RecordPaymentModal from "@/components/payments/RecordPaymentModal";

type PaymentMode = "Cash"|"UPI"|"Bank";
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const COLORS  = ["#6366F1","#F59E0B","#EF4444","#94A3B8","#10B981","#8B5CF6","#06B6D4","#F97316","#14B8A6","#EC4899"];
const DUE_DAY = 5;

interface Row {
  id:string; memberName:string; initials:string; color:string; memberId:string;
  month:string; year:number; rentAmount:number;
  paid:boolean; paymentDate:string|null; mode:PaymentMode|null;
  dueDate:string; isOverdue:boolean; daysOverdue:number; daysRemaining:number;
  reminderFlag:string;
}

function buildRows(members: Member[]): Row[] {
  const now   = new Date();
  const mIdx  = now.getMonth();
  const year  = now.getFullYear();
  const month = MONTHS[mIdx];
  const dueDate = new Date(year, mIdx, DUE_DAY);
  const todayD  = now.getDate();
  const daysDiff = Math.floor((now.getTime() - dueDate.getTime())/(1000*60*60*24));

  return members.map((m, i) => {
    const hasPaid    = m.renewal_date ? new Date(m.renewal_date) >= dueDate : false;
    const isOverdue  = !hasPaid && todayD > DUE_DAY + 3;
    const daysOverdue  = isOverdue ? Math.max(0, daysDiff - 3) : 0;
    const daysRemaining = hasPaid ? 0 : Math.max(0, DUE_DAY + 3 - todayD);
    let reminderFlag = "None";
    if (hasPaid) reminderFlag = "None";
    else if (isOverdue) reminderFlag = "Overdue Reminder";
    else if (todayD === DUE_DAY) reminderFlag = "Payment Due Today";
    else if (todayD >= DUE_DAY - 3) reminderFlag = "Reminder Due";
    const initials = m.name.split(" ").map((n:string)=>n[0]).join("").toUpperCase().slice(0,2);
    const color = COLORS[i%COLORS.length];
    return {
      id: `PMT-${String(i+1).padStart(3,"0")}`, memberName:m.name, initials, color, memberId:m.id,
      month, year, rentAmount:m.rent_amount,
      paid:hasPaid, paymentDate: hasPaid&&m.renewal_date ? new Date(m.renewal_date).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : null,
      mode:null, dueDate:`${String(DUE_DAY).padStart(2,"0")} ${month} ${year}`,
      isOverdue, daysOverdue, daysRemaining, reminderFlag,
    };
  });
}

function Avatar({i,c}:{i:string;c:string}) {
  return <div style={{width:34,height:34,borderRadius:"50%",background:`${c}20`,border:`2px solid ${c}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:c,flexShrink:0}}>{i}</div>;
}
function StatusBadge({paid,overdue}:{paid:boolean;overdue:boolean}) {
  if(paid)    return <span style={{fontSize:11.5,fontWeight:700,background:"#D1FAE5",color:"#065F46",padding:"3px 10px",borderRadius:999}}>Paid</span>;
  if(overdue) return <span style={{fontSize:11.5,fontWeight:700,background:"#FEE2E2",color:"#991B1B",padding:"3px 10px",borderRadius:999}}>Overdue</span>;
  return        <span style={{fontSize:11.5,fontWeight:700,background:"#FEF3C7",color:"#92400E",padding:"3px 10px",borderRadius:999}}>Due</span>;
}
function ModeBadge({mode}:{mode:PaymentMode|null}) {
  if(!mode) return <span style={{color:"var(--text-muted)",fontSize:12}}>—</span>;
  const map:Record<PaymentMode,string>={Cash:"#059669",UPI:"#6366F1",Bank:"#3B82F6"};
  return <span style={{fontSize:11.5,fontWeight:700,color:map[mode],background:`${map[mode]}18`,padding:"3px 10px",borderRadius:999}}>{mode}</span>;
}
function ReminderBadge({flag}:{flag:string}) {
  if(flag==="None") return <span style={{color:"var(--text-muted)",fontSize:12}}>—</span>;
  const map:Record<string,{bg:string;color:string}>={
    "Reminder Due":{bg:"#DBEAFE",color:"#1D4ED8"},
    "Payment Due Today":{bg:"#FEF3C7",color:"#92400E"},
    "Overdue Reminder":{bg:"#FEE2E2",color:"#991B1B"},
  };
  const s=map[flag]||{bg:"#F1F5F9",color:"#64748B"};
  return <span style={{fontSize:11,fontWeight:700,background:s.bg,color:s.color,padding:"3px 8px",borderRadius:6}}>{flag}</span>;
}
function KpiCard({icon:Icon,iconColor,iconBg,label,value,badge,badgeColor}:any) {
  return (
    <div style={{background:"var(--surface)",borderRadius:"var(--radius)",border:"1px solid var(--border)",padding:"20px 22px",boxShadow:"var(--shadow-sm)",transition:"box-shadow 0.2s,transform 0.2s"}}
      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.boxShadow="var(--shadow-md)";(e.currentTarget as HTMLElement).style.transform="translateY(-2px)"}}
      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.boxShadow="var(--shadow-sm)";(e.currentTarget as HTMLElement).style.transform="translateY(0)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
        <div style={{width:44,height:44,borderRadius:10,background:iconBg,display:"flex",alignItems:"center",justifyContent:"center"}}><Icon size={21} color={iconColor} strokeWidth={1.8}/></div>
        {badge&&<span style={{fontSize:11.5,fontWeight:700,color:badgeColor,background:`${badgeColor}18`,padding:"3px 8px",borderRadius:6}}>{badge}</span>}
      </div>
      <div style={{fontSize:11.5,fontWeight:600,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>{label}</div>
      <div style={{fontSize:26,fontWeight:800,color:"var(--text-primary)"}}>{value}</div>
    </div>
  );
}

const W_NUM=52, W_NAME=200;

export default function PaymentsPage() {
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [monthFilter,  setMonthFilter]  = useState("All");
  const [members,      setMembers]      = useState<Member[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [prefillId,    setPrefillId]    = useState<string|undefined>();

  const load = () => {
    setLoading(true);
    supabase.from("members").select("*").eq("status","Active").order("created_at",{ascending:false})
      .then(({data})=>{ if(data) setMembers(data as Member[]); setLoading(false); });
  };
  useEffect(()=>{ load(); },[]);

  const rows = buildRows(members);
  const filtered = rows.filter(p=>{
    const q=search.toLowerCase();
    const mq=p.memberName.toLowerCase().includes(q)||p.id.toLowerCase().includes(q);
    const sf=statusFilter==="All"||(statusFilter==="Paid"&&p.paid)||(statusFilter==="Due"&&!p.paid&&!p.isOverdue)||(statusFilter==="Overdue"&&p.isOverdue);
    const mf=monthFilter==="All"||p.month===monthFilter;
    return mq&&sf&&mf;
  });

  const dueRows     = rows.filter(r=>!r.paid);
  const overdueRows = dueRows.filter(r=>r.isOverdue);
  const totalRev    = rows.filter(r=>r.paid).reduce((s,r)=>s+r.rentAmount,0);
  const pendingCount= rows.filter(r=>!r.paid).length;

  const thS: React.CSSProperties = {padding:"12px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.06em",whiteSpace:"nowrap",borderBottom:"1px solid var(--border)",background:"var(--neutral-dark)"};

  // Row urgency colour
  const rowBg = (r:Row) => {
    if(r.paid) return undefined;
    if(r.isOverdue) return "rgba(239,68,68,0.06)";
    if(r.daysRemaining<=3) return "rgba(239,68,68,0.06)";
    if(r.daysRemaining<7) return "rgba(245,158,11,0.07)";
    return undefined;
  };

  if(loading) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"60vh",gap:16}}>
      <Loader2 size={40} color="var(--primary)" style={{animation:"spin 1s linear infinite"}}/>
      <p style={{fontSize:14,color:"var(--text-muted)"}}>Loading payments…</p>
    </div>
  );

  return (
    <div>
      {showModal&&<RecordPaymentModal onClose={()=>{setShowModal(false);setPrefillId(undefined);}} onSaved={load} prefillMemberId={prefillId}/>}

      <div style={{marginBottom:28}}>
        <h1 style={{fontSize:28,fontWeight:800,color:"var(--text-primary)",marginBottom:6}}>Payment Tracking</h1>
        <p style={{fontSize:14,color:"var(--text-muted)"}}>Monthly payment ledger — track dues, overdues, and collect payments.</p>
      </div>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:28}}>
        <KpiCard icon={IndianRupee} iconColor="#10B981" iconBg="#D1FAE5" label="Revenue Collected" value={`₹${(totalRev/1000).toFixed(1)}k`}/>
        <KpiCard icon={AlertTriangle} iconColor="#EF4444" iconBg="#FEE2E2" label="Overdue" value={overdueRows.length} badge="Urgent" badgeColor="#EF4444"/>
        <KpiCard icon={Clock} iconColor="#F59E0B" iconBg="#FEF3C7" label="Pending" value={pendingCount}/>
        <KpiCard icon={CheckCircle} iconColor="#6366F1" iconBg="#EDE9FE" label="Paid This Month" value={rows.filter(r=>r.paid).length}/>
      </div>

      {/* Due Users summary table */}
      {dueRows.length>0&&(
        <div style={{background:"var(--surface)",borderRadius:"var(--radius)",border:"1px solid var(--border)",boxShadow:"var(--shadow-sm)",marginBottom:28,overflow:"hidden"}}>
          <div style={{padding:"16px 20px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontSize:15,fontWeight:700,color:"var(--text-primary)"}}>⚠️ Due &amp; Overdue Members</div>
            <div style={{display:"flex",gap:14,fontSize:12.5}}>
              <span style={{color:"#EF4444",fontWeight:700}}>● Red = Overdue or ≤3 days</span>
              <span style={{color:"#D97706",fontWeight:700}}>● Yellow = &lt;7 days remaining</span>
            </div>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr>
                  {["Member","Space","Rent Due","Due Date","Status","Days Overdue / Remaining","Action"].map(h=>(
                    <th key={h} style={thS}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dueRows.map(r=>{
                  const bg = r.isOverdue||r.daysRemaining<=3?"rgba(239,68,68,0.07)":r.daysRemaining<7?"rgba(245,158,11,0.08)":"var(--surface)";
                  const memberData = members.find(m=>m.id===r.memberId);
                  return (
                    <tr key={r.memberId} style={{background:bg}}>
                      <td style={{padding:"12px 16px",whiteSpace:"nowrap",background:bg}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <Avatar i={r.initials} c={r.color}/>
                          <span style={{fontWeight:700,fontSize:13.5,color:"var(--text-primary)"}}>{r.memberName}</span>
                        </div>
                      </td>
                      <td style={{padding:"12px 16px",fontSize:13,color:"var(--text-secondary)",background:bg}}>{memberData?.assigned_space||"—"}</td>
                      <td style={{padding:"12px 16px",fontWeight:700,fontSize:13.5,background:bg}}>₹{r.rentAmount.toLocaleString()}</td>
                      <td style={{padding:"12px 16px",fontSize:13,background:bg}}>{r.dueDate}</td>
                      <td style={{padding:"12px 16px",background:bg}}><StatusBadge paid={r.paid} overdue={r.isOverdue}/></td>
                      <td style={{padding:"12px 16px",background:bg}}>
                        {r.isOverdue
                          ? <span style={{fontWeight:700,color:"#EF4444",fontSize:13}}>{r.daysOverdue} day{r.daysOverdue!==1?"s":""} overdue</span>
                          : <span style={{fontWeight:700,color:r.daysRemaining<=3?"#EF4444":r.daysRemaining<7?"#D97706":"var(--text-secondary)",fontSize:13}}>
                              {r.daysRemaining} day{r.daysRemaining!==1?"s":""} remaining
                            </span>
                        }
                      </td>
                      <td style={{padding:"12px 16px",background:bg}}>
                        <button onClick={()=>{setPrefillId(r.memberId);setShowModal(true);}} style={{padding:"5px 14px",background:"var(--primary)",color:"#fff",border:"none",borderRadius:"var(--radius-sm)",fontSize:12.5,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                          Record
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main ledger table */}
      <div style={{background:"var(--surface)",borderRadius:"var(--radius)",border:"1px solid var(--border)",boxShadow:"var(--shadow-sm)",overflow:"hidden",marginBottom:28}}>
        <div style={{padding:"18px 24px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
            <div style={{position:"relative"}}>
              <Search size={14} color="var(--tertiary)" style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)"}}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search member or ID…"
                style={{paddingLeft:32,paddingRight:12,paddingTop:7,paddingBottom:7,border:"1px solid var(--border)",borderRadius:"var(--radius-sm)",fontSize:13.5,fontFamily:"inherit",background:"var(--neutral)",color:"var(--text-primary)",outline:"none",width:230}}
                onFocus={e=>(e.currentTarget.style.borderColor="var(--primary)")} onBlur={e=>(e.currentTarget.style.borderColor="var(--border)")}/>
            </div>
            {["All","Paid","Due","Overdue"].map(s=>(
              <button key={s} onClick={()=>setStatusFilter(s)} style={{padding:"6px 13px",borderRadius:"var(--radius-sm)",border:`1px solid ${statusFilter===s?"var(--primary)":"var(--border)"}`,background:statusFilter===s?"rgba(99,102,241,0.09)":"var(--surface)",color:statusFilter===s?"var(--primary)":"var(--text-secondary)",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{s}</button>
            ))}
            <select value={monthFilter} onChange={e=>setMonthFilter(e.target.value)} style={{padding:"6px 12px",border:"1px solid var(--border)",borderRadius:"var(--radius-sm)",fontSize:13,fontFamily:"inherit",background:"var(--surface)",color:"var(--text-secondary)",outline:"none",cursor:"pointer"}}>
              <option value="All">All Months</option>
              {MONTHS.map(m=><option key={m}>{m}</option>)}
            </select>
          </div>
          <button onClick={()=>setShowModal(true)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 18px",background:"var(--primary)",color:"#fff",border:"none",borderRadius:"var(--radius-sm)",fontSize:13.5,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
            <Plus size={15}/> Record Payment
          </button>
        </div>

        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"separate",borderSpacing:0,minWidth:1100,tableLayout:"fixed"}}>
            <colgroup>
              <col style={{width:W_NUM}}/><col style={{width:W_NAME}}/><col style={{width:130}}/><col style={{width:120}}/><col style={{width:120}}/><col style={{width:80}}/><col style={{width:130}}/><col style={{width:90}}/><col style={{width:120}}/><col style={{width:100}}/><col style={{width:130}}/><col style={{width:130}}/><col style={{width:160}}/>
            </colgroup>
            <thead>
              <tr>
                <th style={{...thS,position:"sticky",left:0,zIndex:3,width:W_NUM,minWidth:W_NUM,borderRight:"1px solid var(--border)"}}>#</th>
                <th style={{...thS,position:"sticky",left:W_NUM,zIndex:3,width:W_NAME,minWidth:W_NAME,boxShadow:"4px 0 10px -2px rgba(0,0,0,0.1)"}}>Member</th>
                <th style={thS}>Payment ID</th>
                <th style={thS}>Month / Year</th>
                <th style={thS}>Rent Amount</th>
                <th style={thS}>Paid?</th>
                <th style={thS}>Payment Date</th>
                <th style={thS}>Mode</th>
                <th style={thS}>Due Date</th>
                <th style={thS}>Status</th>
                <th style={thS}>Days Overdue</th>
                <th style={thS}>Days Remaining</th>
                <th style={thS}>Reminder Flag</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length===0&&<tr><td colSpan={13} style={{padding:48,textAlign:"center",color:"var(--text-muted)",fontSize:14}}>{members.length===0?"No active members found.":"No payments match filters."}</td></tr>}
              {filtered.map((p,i)=>{
                const bg = rowBg(p)??"var(--surface)";
                const tdB: React.CSSProperties = {padding:"12px 14px",whiteSpace:"nowrap",fontSize:13.5,color:"var(--text-primary)",background:bg,borderBottom:"1px solid var(--border-light)"};
                return (
                  <tr key={p.id}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).querySelectorAll("td").forEach(c=>(c as HTMLElement).style.filter="brightness(0.97)")}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).querySelectorAll("td").forEach(c=>(c as HTMLElement).style.filter="")}>
                    <td style={{...tdB,position:"sticky",left:0,zIndex:2,width:W_NUM,minWidth:W_NUM,borderRight:"1px solid var(--border-light)"}}><span style={{fontSize:12,fontWeight:700,color:"var(--text-muted)"}}>{i+1}</span></td>
                    <td style={{...tdB,position:"sticky",left:W_NUM,zIndex:2,width:W_NAME,minWidth:W_NAME,boxShadow:"4px 0 10px -2px rgba(0,0,0,0.1)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:9}}><Avatar i={p.initials} c={p.color}/><span style={{fontSize:13.5,fontWeight:700,color:"var(--primary)"}}>{p.memberName}</span></div>
                    </td>
                    <td style={tdB}><span style={{fontFamily:"monospace",fontSize:12.5,color:"var(--text-secondary)"}}>{p.id}</span></td>
                    <td style={tdB}>{p.month} {p.year}</td>
                    <td style={tdB}><strong>₹{p.rentAmount.toLocaleString()}</strong></td>
                    <td style={tdB}><span style={{fontWeight:700,color:p.paid?"#059669":"var(--text-muted)",fontSize:12}}>{p.paid?"✓":"✗"}</span></td>
                    <td style={tdB}>{p.paymentDate??"—"}</td>
                    <td style={tdB}><ModeBadge mode={p.mode}/></td>
                    <td style={tdB}>{p.dueDate}</td>
                    <td style={tdB}><StatusBadge paid={p.paid} overdue={p.isOverdue}/></td>
                    <td style={tdB}><span style={{color:p.daysOverdue>0?"#EF4444":"var(--text-muted)",fontWeight:p.daysOverdue>0?700:400}}>{p.daysOverdue>0?`${p.daysOverdue} days`:"—"}</span></td>
                    <td style={tdB}><span style={{color:p.paid?"var(--text-muted)":p.daysRemaining<=3?"#EF4444":p.daysRemaining<7?"#D97706":"var(--text-secondary)",fontWeight:!p.paid&&p.daysRemaining<7?700:400}}>{p.paid?"—":`${p.daysRemaining} days`}</span></td>
                    <td style={tdB}><ReminderBadge flag={p.reminderFlag}/></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{padding:"14px 24px",background:"var(--neutral)",borderTop:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:13.5,color:"var(--text-muted)"}}>Showing <strong style={{color:"var(--text-primary)"}}>{filtered.length}</strong> of <strong style={{color:"var(--text-primary)"}}>{rows.length}</strong> records</span>
          <div style={{display:"flex",gap:6}}>
            <button style={{width:32,height:32,borderRadius:"var(--radius-sm)",border:"1px solid var(--border)",background:"var(--surface)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><ChevronLeft size={14} color="var(--text-secondary)"/></button>
            <button style={{width:32,height:32,borderRadius:"var(--radius-sm)",border:"1px solid var(--primary)",background:"var(--primary)",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>1</button>
            <button style={{width:32,height:32,borderRadius:"var(--radius-sm)",border:"1px solid var(--border)",background:"var(--surface)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><ChevronRight size={14} color="var(--text-secondary)"/></button>
          </div>
        </div>
      </div>

      {/* Mode breakdown */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
        {(["Cash","UPI","Bank"] as PaymentMode[]).map(mode=>{
          const cfg:{[k:string]:{bg:string;color:string;icon:any}}={Cash:{bg:"#D1FAE5",color:"#059669",icon:Banknote},UPI:{bg:"#EDE9FE",color:"#6366F1",icon:RefreshCw},Bank:{bg:"#DBEAFE",color:"#3B82F6",icon:CreditCard}};
          const c=cfg[mode];
          return (
            <div key={mode} style={{background:"var(--surface)",borderRadius:"var(--radius)",border:"1px solid var(--border)",padding:"20px 22px",boxShadow:"var(--shadow-sm)"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                <div style={{width:40,height:40,borderRadius:10,background:c.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><c.icon size={19} color={c.color} strokeWidth={1.8}/></div>
                <span style={{fontSize:15,fontWeight:700,color:"var(--text-primary)"}}>{mode}</span>
              </div>
              <div style={{fontSize:22,fontWeight:800,color:"var(--text-primary)",marginBottom:4}}>₹0</div>
              <div style={{fontSize:12.5,color:"var(--text-muted)"}}>0 payments recorded</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
