"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { getRole } from "@/lib/auth";
import { Eye, EyeOff, Loader2, Zap, CheckCircle, Clock, XCircle } from "lucide-react";

type Mode = "login" | "signup";
const SOURCES = ["Direct", "Instagram", "Google", "Referral", "Walk-in", "Other"];
const SPACE_TYPES = ["Dedicated Desk", "Manager Cabin", "Two-Seater Cabin", "Virtual Desk"];

const inp: React.CSSProperties = {
  width: "100%", padding: "11px 14px", border: "1px solid #E2E8F0",
  borderRadius: 10, fontSize: 14, fontFamily: "inherit",
  background: "#F8FAFC", color: "#0F172A", outline: "none",
  boxSizing: "border-box", transition: "border-color 0.2s",
};
const foc = (e: React.FocusEvent<any>) => (e.currentTarget.style.borderColor = "#6366F1");
const blu = (e: React.FocusEvent<any>) => (e.currentTarget.style.borderColor = "#E2E8F0");

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function PwField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  return (
    <Field label={label}>
      <div style={{ position: "relative" }}>
        <input type={show ? "text" : "password"} value={value} onChange={e => onChange(e.target.value)}
          style={{ ...inp, paddingRight: 40 }} onFocus={foc} onBlur={blu} autoComplete="new-password" />
        <button type="button" onClick={() => setShow(s => !s)}
          style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}>
          {show ? <EyeOff size={16} color="#94A3B8" /> : <Eye size={16} color="#94A3B8" />}
        </button>
      </div>
    </Field>
  );
}

type StatusBanner = "pending" | "rejected" | "success" | null;

function StatusScreen({ type, reason }: { type: StatusBanner; reason?: string }) {
  const config = {
    pending: {
      icon: Clock,
      iconBg: "#FEF3C7",
      iconColor: "#D97706",
      title: "Account Under Review",
      msg: "Your request is under process. Please wait for admin verification. You'll be notified once approved.",
      borderColor: "#FDE68A",
      bg: "#FFFBEB",
    },
    rejected: {
      icon: XCircle,
      iconBg: "#FEE2E2",
      iconColor: "#EF4444",
      title: "Account Not Approved",
      msg: reason ?? "Your account request was not approved. Please contact the admin for more information.",
      borderColor: "#FCA5A5",
      bg: "#FFF1F2",
    },
    success: {
      icon: CheckCircle,
      iconBg: "#D1FAE5",
      iconColor: "#059669",
      title: "Signup Successful!",
      msg: "Your account has been submitted for admin review. You'll receive access once approved.",
      borderColor: "#6EE7B7",
      bg: "#F0FDF4",
    },
  }[type!]!;

  const Icon = config.icon;
  return (
    <div style={{ padding: "32px 28px", background: config.bg, border: `1px solid ${config.borderColor}`, borderRadius: 16, textAlign: "center" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: config.iconBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        <Icon size={30} color={config.iconColor} strokeWidth={1.8} />
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginBottom: 8 }}>{config.title}</div>
      <div style={{ fontSize: 14, color: "#64748B", lineHeight: 1.6 }}>{config.msg}</div>
      {type === "pending" || type === "rejected" ? (
        <button onClick={() => window.location.reload()} style={{ marginTop: 20, padding: "9px 20px", background: "#6366F1", color: "#fff", border: "none", borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          Try Logging In Again
        </button>
      ) : null}
    </div>
  );
}

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusScreen, setStatusScreen] = useState<{ type: StatusBanner; reason?: string } | null>(null);

  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Signup fields
  const [form, setForm] = useState({
    name: "", phone: "", email: "", password: "", confirmPassword: "",
    company: "", date_of_birth: "", joining_date: new Date().toISOString().split("T")[0],
    space_type: "", team_size: "1", source: "Direct",
  });
  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setLoading(true);

    const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });
    if (authErr) { setLoading(false); setError(authErr.message); return; }

    // Use getRole() as single source of truth
    const { role } = await getRole();

    if (role === "admin") {
      window.location.href = "/dashboard";
      return;
    }
    if (role === "user") {
      window.location.href = "/user/dashboard";
      return;
    }
    if (role === "pending") {
      // Check reason
      const { data: lead } = await supabase
        .from("signup_leads")
        .select("verification_status,rejection_reason")
        .eq("email", email)
        .maybeSingle();
      await supabase.auth.signOut();
      setLoading(false);
      if (lead?.verification_status === "Rejected") {
        setStatusScreen({ type: "rejected", reason: lead.rejection_reason ?? undefined });
      } else {
        setStatusScreen({ type: "pending" });
      }
      return;
    }

    // Unknown state — sign out for safety
    await supabase.auth.signOut();
    setLoading(false);
    setError("Account not recognized. Please contact the admin.");
  };

  // ── SIGNUP ────────────────────────────────────────────────────────────────
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    if (!form.name.trim()) return setError("Full name is required.");
    if (!form.phone.trim()) return setError("Phone number is required.");
    if (!form.email.trim()) return setError("Email is required.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    if (form.password !== form.confirmPassword) return setError("Passwords don't match.");
    setLoading(true);

    // Duplicate check in signup_leads
    const { data: existingLead } = await supabase.from("signup_leads").select("id,verification_status").eq("email", form.email).maybeSingle();
    if (existingLead) {
      setLoading(false);
      if (existingLead.verification_status === "Pending") {
        setStatusScreen({ type: "pending" }); return;
      }
      if (existingLead.verification_status === "Rejected") {
        setStatusScreen({ type: "rejected" }); return;
      }
      return setError("An account with this email already exists. Please log in.");
    }

    // Duplicate check in members
    const { data: existingMember } = await supabase.from("members").select("id").eq("email", form.email).maybeSingle();
    if (existingMember) { setLoading(false); return setError("An account with this email already exists. Please log in."); }

    // Create Supabase Auth user
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { name: form.name } },
    });
    if (authErr) { setLoading(false); return setError(authErr.message); }

    // Insert into signup_leads (NOT members)
    const { error: leadErr } = await supabase.from("signup_leads").insert({
      auth_user_id: authData.user?.id ?? null,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim().toLowerCase(),
      company: form.company || null,
      date_of_birth: form.date_of_birth || null,
      space_type: form.space_type || null,
      team_size: parseInt(form.team_size) || 1,
      source: form.source,
      verification_status: "Pending",
      signed_up_at: new Date().toISOString(),
    });

    // Always sign out — user cannot access anything until approved
    await supabase.auth.signOut();

    setLoading(false);
    if (leadErr) { setError(leadErr.message); return; }
    setStatusScreen({ type: "success" });
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #EEF2FF 0%, #F8FAFC 50%, #F0FDF4 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: mode === "signup" ? 640 : 440 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, justifyContent: "center" }}>
          <div style={{ width: 42, height: 42, background: "#6366F1", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(99,102,241,0.4)" }}>
            <Zap size={22} color="#fff" fill="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#0F172A" }}>CoSpace Admin</div>
            <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500 }}>Management Suite</div>
          </div>
        </div>

        {/* Status screens */}
        {statusScreen ? (
          <StatusScreen type={statusScreen.type} reason={statusScreen.reason} />
        ) : (
          <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 8px 40px rgba(0,0,0,0.10)", border: "1px solid #E2E8F0", overflow: "hidden" }}>
            {/* Tab Toggle */}
            <div style={{ display: "flex", borderBottom: "1px solid #E2E8F0" }}>
              {(["login", "signup"] as Mode[]).map(m => (
                <button key={m} type="button" onClick={() => { setMode(m); setError(null); }}
                  style={{ flex: 1, padding: "16px 0", border: "none", background: mode === m ? "#fff" : "#F8FAFC", fontSize: 14, fontWeight: mode === m ? 700 : 500, color: mode === m ? "#6366F1" : "#94A3B8", cursor: "pointer", fontFamily: "inherit", borderBottom: mode === m ? "2px solid #6366F1" : "2px solid transparent", transition: "all 0.15s" }}>
                  {m === "login" ? "Log In" : "Sign Up"}
                </button>
              ))}
            </div>

            <div style={{ padding: 32 }}>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>{mode === "login" ? "Welcome back" : "Request Access"}</h1>
                <p style={{ fontSize: 13.5, color: "#94A3B8" }}>{mode === "login" ? "Sign in to your account." : "Submit your details — admin will review and approve your access."}</p>
              </div>

              {error && <div style={{ padding: "12px 14px", background: "#FEE2E2", borderRadius: 10, marginBottom: 20, fontSize: 13.5, color: "#991B1B", fontWeight: 600 }}>{error}</div>}

              {/* LOGIN FORM */}
              {mode === "login" && (
                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <Field label="Email Address">
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inp} onFocus={foc} onBlur={blu} autoComplete="email" />
                  </Field>
                  <PwField label="Password" value={password} onChange={setPassword} />
                  <button type="submit" disabled={loading} style={{ marginTop: 8, padding: "13px 0", background: loading ? "#A5B4FC" : "#6366F1", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 14px rgba(99,102,241,0.35)" }}>
                    {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Signing in…</> : "Sign In"}
                  </button>
                </form>
              )}

              {/* SIGNUP FORM */}
              {mode === "signup" && (
                <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ padding: "10px 14px", background: "#EFF6FF", borderRadius: 10, border: "1px solid #BFDBFE", fontSize: 13, color: "#1E40AF", fontWeight: 500, display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <Clock size={14} style={{ flexShrink: 0, marginTop: 1 }} /> Your signup will be reviewed by the admin before you can access the platform.
                  </div>

                  <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em" }}>Account Credentials</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div style={{ gridColumn: "span 2" }}>
                      <Field label="Email Address *">
                        <input type="email" value={form.email} onChange={e => setF("email", e.target.value)} placeholder="you@example.com" style={inp} onFocus={foc} onBlur={blu} />
                      </Field>
                    </div>
                    <PwField label="Password *" value={form.password} onChange={v => setF("password", v)} />
                    <PwField label="Confirm Password *" value={form.confirmPassword} onChange={v => setF("confirmPassword", v)} />
                  </div>

                  <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 4 }}>Personal Details</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <Field label="Full Name *"><input value={form.name} onChange={e => setF("name", e.target.value)} placeholder="Rahul Sharma" style={inp} onFocus={foc} onBlur={blu} /></Field>
                    <Field label="Phone *"><input value={form.phone} onChange={e => setF("phone", e.target.value)} placeholder="+91 98765 43210" style={inp} onFocus={foc} onBlur={blu} /></Field>
                    <Field label="Company"><input value={form.company} onChange={e => setF("company", e.target.value)} placeholder="Acme Corp" style={inp} onFocus={foc} onBlur={blu} /></Field>
                    <Field label="Date of Birth"><input type="date" value={form.date_of_birth} onChange={e => setF("date_of_birth", e.target.value)} style={inp} onFocus={foc} onBlur={blu} /></Field>
                  </div>

                  <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 4 }}>Preferences</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <Field label="Space Type Interest">
                      <select value={form.space_type} onChange={e => setF("space_type", e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                        <option value="">— Select type —</option>
                        {SPACE_TYPES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </Field>
                    <Field label="Team Size"><input type="number" min="1" value={form.team_size} onChange={e => setF("team_size", e.target.value)} style={inp} onFocus={foc} onBlur={blu} /></Field>
                    <Field label="How did you hear about us?">
                      <select value={form.source} onChange={e => setF("source", e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                        {SOURCES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </Field>
                  </div>

                  <button type="submit" disabled={loading} style={{ marginTop: 10, padding: "13px 0", background: loading ? "#A5B4FC" : "#6366F1", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 14px rgba(99,102,241,0.35)" }}>
                    {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Submitting…</> : "Submit for Review"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#94A3B8" }}>
          {mode === "login"
            ? <span>Don&apos;t have an account? <button onClick={() => { setMode("signup"); setStatusScreen(null); }} style={{ background: "none", border: "none", color: "#6366F1", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>Sign up</button></span>
            : <span>Already registered? <button onClick={() => { setMode("login"); setStatusScreen(null); }} style={{ background: "none", border: "none", color: "#6366F1", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>Log in</button></span>
          }
        </p>
      </div>
    </div>
  );
}
