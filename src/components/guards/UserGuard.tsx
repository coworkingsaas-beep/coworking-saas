"use client";
import { useEffect, useState } from "react";
import { getRole } from "@/lib/auth";
import { Loader2, Clock, XCircle } from "lucide-react";

interface Props { children: React.ReactNode; }

export default function UserGuard({ children }: Props) {
  const [status, setStatus] = useState<"loading" | "allowed" | "pending" | "rejected" | "unauthenticated">("loading");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  useEffect(() => {
    getRole().then(async ({ role, email }) => {
      if (role === "admin") {
        // Admin trying to access user routes → redirect to admin dashboard
        window.location.href = "/dashboard";
        return;
      }
      if (role === "unauthenticated") { setStatus("unauthenticated"); return; }
      if (role === "user") { setStatus("allowed"); return; }

      // Pending — check reason
      if (role === "pending" && email) {
        const { supabase } = await import("@/lib/supabase");
        const { data: lead } = await supabase
          .from("signup_leads")
          .select("verification_status,rejection_reason")
          .eq("email", email)
          .maybeSingle();
        if (lead?.verification_status === "Rejected") {
          setRejectionReason(lead.rejection_reason ?? null);
          setStatus("rejected");
          return;
        }
      }
      setStatus("pending");
    });
  }, []);

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", flexDirection: "column", gap: 16 }}>
        <Loader2 size={40} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }}/>
        <span style={{ fontSize: 14, color: "var(--text-muted)" }}>Loading your dashboard…</span>
      </div>
    );
  }

  if (status === "unauthenticated") {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  const statusScreen = status === "pending" || status === "rejected";
  if (statusScreen) {
    const isPending = status === "pending";
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: 24 }}>
        <div style={{ maxWidth: 440, textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: isPending ? "#FEF3C7" : "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            {isPending ? <Clock size={34} color="#D97706" strokeWidth={1.8}/> : <XCircle size={34} color="#EF4444" strokeWidth={1.8}/>}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 10 }}>
            {isPending ? "Account Under Review" : "Account Not Approved"}
          </div>
          <div style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 24 }}>
            {isPending
              ? "Your request is under process. Please wait for admin verification before accessing the dashboard."
              : (rejectionReason ?? "Your account was not approved. Please contact the admin for more information.")}
          </div>
          <a href="/login" style={{ padding: "10px 24px", background: "#6366F1", color: "#fff", borderRadius: 10, textDecoration: "none", fontSize: 14, fontWeight: 700 }}>
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
