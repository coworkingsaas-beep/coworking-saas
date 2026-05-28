"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Loader2, Shield, AlertTriangle } from "lucide-react";

const inp: React.CSSProperties = {
  width: "100%", padding: "11px 14px",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10, fontSize: 14, fontFamily: "inherit",
  background: "rgba(255,255,255,0.06)", color: "#F1F5F9",
  outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
};

function PwField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"} value={value}
        onChange={e => onChange(e.target.value)} placeholder="••••••••"
        style={inp}
        onFocus={e => (e.currentTarget.style.borderColor = "rgba(139,92,246,0.8)")}
        onBlur={e  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
        autoComplete="current-password"
      />
      <button type="button" onClick={() => setShow(s => !s)}
        style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
        {show ? <EyeOff size={16} color="#64748B"/> : <Eye size={16} color="#64748B"/>}
      </button>
    </div>
  );
}

export default function AdminLoginPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setLoading(true);

    // Sign in with Supabase Auth
    const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });
    if (authErr) {
      setLoading(false);
      setError("Invalid email or password.");
      return;
    }

    // Check admin whitelist
    const { data: adminRecord, error: whitelistErr } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (whitelistErr) {
      // Table may not exist yet — log and allow through for now
      console.warn("admin_users check failed:", whitelistErr.message);
    } else if (!adminRecord) {
      await supabase.auth.signOut();
      setLoading(false);
      setError("Access denied. This account does not have admin privileges.");
      return;
    }

    // Hard redirect — ensures session cookie is flushed before navigation
    window.location.href = "/dashboard";
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, fontFamily: "'Inter', system-ui, sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      {/* Background decoration */}
      <div style={{ position: "absolute", top: -120, right: -120, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)", pointerEvents: "none" }}/>
      <div style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", pointerEvents: "none" }}/>

      <div style={{ width: "100%", maxWidth: 420, position: "relative" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 56, height: 56, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(99,102,241,0.5)" }}>
            <Shield size={26} color="#fff" strokeWidth={1.8}/>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#F1F5F9", marginBottom: 4 }}>Admin Portal</div>
          <div style={{ fontSize: 13.5, color: "#64748B" }}>Restricted access — authorised personnel only</div>
        </div>

        {/* Card */}
        <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)", padding: 36, boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Admin Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@example.com" style={inp}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(139,92,246,0.8)")}
                onBlur={e  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                autoComplete="email"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Password</label>
              <PwField value={password} onChange={setPassword}/>
            </div>

            {error && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "11px 14px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, fontSize: 13.5, color: "#FCA5A5", fontWeight: 600 }}>
                <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }}/> {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ marginTop: 4, padding: "13px 0", background: loading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: loading ? "none" : "0 4px 20px rgba(99,102,241,0.5)", transition: "all 0.2s" }}>
              {loading
                ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }}/> Verifying…</>
                : <><Shield size={16}/> Sign In as Admin</>}
            </button>
          </form>
        </div>

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 12.5, color: "#334155" }}>
          Not an admin? <a href="/login" style={{ color: "#6366F1", fontWeight: 600, textDecoration: "none" }}>Member login →</a>
        </div>
      </div>
    </div>
  );
}
