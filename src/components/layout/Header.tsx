"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, MessageSquare, HelpCircle, Search, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName,  setUserName]  = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email ?? null);
        setUserName(user.user_metadata?.name ?? user.email?.split("@")[0] ?? "Admin");
      }
    });
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };
  return (
    <header
      style={{
        height: "var(--header-height)",
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        padding: "0 28px",
        gap: 16,
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Search */}
      <div
        style={{
          flex: 1,
          maxWidth: 480,
          position: "relative",
        }}
      >
        <Search
          size={15}
          color="var(--tertiary)"
          style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
        />
        <input
          type="text"
          placeholder="Search for members, bookings, or spaces..."
          style={{
            width: "100%",
            padding: "9px 12px 9px 36px",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            fontSize: 13.5,
            color: "var(--text-primary)",
            background: "var(--neutral)",
            outline: "none",
            fontFamily: "inherit",
            transition: "border-color 0.15s ease",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        />
      </div>

      <div style={{ flex: 1 }} />

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {[
          { Icon: Bell, badge: true },
          { Icon: MessageSquare, badge: false },
          { Icon: HelpCircle, badge: false },
        ].map(({ Icon, badge }, i) => (
          <button
            key={i}
            style={{
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: "none",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              position: "relative",
              transition: "background 0.15s ease",
              color: "var(--text-secondary)",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "var(--neutral-dark)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "transparent")
            }
          >
            <Icon size={18} strokeWidth={1.8} />
            {badge && (
              <span
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 7,
                  height: 7,
                  background: "var(--danger)",
                  borderRadius: "50%",
                  border: "1.5px solid var(--surface)",
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 28, background: "var(--border)" }} />

      {/* User + Logout */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3, textAlign: "right" }}>
            {userName ?? "Admin"}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", textAlign: "right", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {userEmail ?? "Space Manager"}
          </div>
        </div>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
          {(userName ?? "A")[0].toUpperCase()}
        </div>
        <button onClick={logout} title="Log out"
          style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: "pointer", transition: "all 0.15s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#FEE2E2"; (e.currentTarget as HTMLElement).style.borderColor = "#EF4444"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}>
          <LogOut size={15} color="#EF4444"/>
        </button>
      </div>
    </header>
  );
}
