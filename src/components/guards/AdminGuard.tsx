"use client";
import { useEffect, useState } from "react";
import { getRole } from "@/lib/auth";
import { Loader2, ShieldOff } from "lucide-react";

interface Props { children: React.ReactNode; }

export default function AdminGuard({ children }: Props) {
  const [status, setStatus] = useState<"loading" | "allowed" | "denied" | "unauthenticated">("loading");

  useEffect(() => {
    getRole().then(({ role }) => {
      if (role === "admin")           setStatus("allowed");
      else if (role === "unauthenticated") setStatus("unauthenticated");
      else                            setStatus("denied");
    });
  }, []);

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", flexDirection: "column", gap: 16 }}>
        <Loader2 size={40} color="var(--primary)" style={{ animation: "spin 1s linear infinite" }}/>
        <span style={{ fontSize: 14, color: "var(--text-muted)" }}>Verifying access…</span>
      </div>
    );
  }

  if (status === "unauthenticated") {
    if (typeof window !== "undefined") window.location.href = "/admin/login";
    return null;
  }

  if (status === "denied") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", flexDirection: "column", gap: 20, fontFamily: "inherit" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ShieldOff size={34} color="#EF4444" strokeWidth={1.8}/>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>Access Denied</div>
          <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24, maxWidth: 360, lineHeight: 1.6 }}>
            You don&apos;t have admin privileges to view this page.
          </div>
          <a href="/user/dashboard" style={{ padding: "10px 24px", background: "var(--primary)", color: "#fff", borderRadius: "var(--radius-sm)", textDecoration: "none", fontSize: 14, fontWeight: 700 }}>
            Go to My Dashboard →
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
