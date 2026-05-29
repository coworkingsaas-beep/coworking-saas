"use client";
import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";

// ── Types ─────────────────────────────────────────────────────────────────────
export type AlertType = "birthday" | "renewal" | "overdue" | "signup" | "system";

export interface Alert {
  id: string;
  type: AlertType;
  ref_id: string | null;
  title: string;
  body: string;
  due_date: string | null; // ISO date string
  is_read: boolean;
  created_at: string;
}

interface AlertsCtx {
  alerts: Alert[];
  unread: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  deleteAlert: (id: string) => Promise<void>;
}

const Ctx = createContext<AlertsCtx>({
  alerts: [], unread: 0, loading: true,
  refresh: async () => {},
  markRead: async () => {},
  markAllRead: async () => {},
  deleteAlert: async () => {},
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function daysBetween(a: Date, b: Date) {
  return Math.ceil((b.getTime() - a.getTime()) / 86400000);
}

function nextBirthday(dob: string): Date {
  const d = new Date(dob);
  const now = new Date();
  const next = new Date(now.getFullYear(), d.getMonth(), d.getDate());
  if (next < now) next.setFullYear(now.getFullYear() + 1);
  return next;
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function AlertsProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const syncAlerts = useCallback(async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Load members for birthday + renewal + overdue checks
    const { data: members } = await supabase
      .from("members")
      .select("id, name, date_of_birth, renewal_date, status")
      .eq("status", "Active");

    // 2. Load pending signup leads
    const { data: leads } = await supabase
      .from("signup_leads")
      .select("id, name, signed_up_at")
      .eq("verification_status", "Pending");

    const generatedAlerts: Omit<Alert, "id" | "created_at" | "is_read">[] = [];

    // Birthday alerts — 2 days before
    (members ?? []).forEach((m) => {
      if (!m.date_of_birth) return;
      const next = nextBirthday(m.date_of_birth);
      const days = daysBetween(today, next);
      if (days >= 0 && days <= 2) {
        generatedAlerts.push({
          type: "birthday",
          ref_id: m.id,
          title: `🎂 Birthday: ${m.name}`,
          body: days === 0 ? "Today is their birthday!" : `Birthday in ${days} day${days > 1 ? "s" : ""}`,
          due_date: next.toISOString().split("T")[0],
        });
      }
    });

    // Renewal alerts — due within 7 days
    (members ?? []).forEach((m) => {
      if (!m.renewal_date) return;
      const renewal = new Date(m.renewal_date);
      renewal.setHours(0, 0, 0, 0);
      const days = daysBetween(today, renewal);
      if (days >= 0 && days <= 7) {
        generatedAlerts.push({
          type: "renewal",
          ref_id: m.id,
          title: `🔄 Renewal Due: ${m.name}`,
          body: days === 0 ? "Renewal is due today!" : `Renewal due in ${days} day${days > 1 ? "s" : ""}`,
          due_date: m.renewal_date,
        });
      }
    });

    // Overdue alerts — renewal_date in the past
    (members ?? []).forEach((m) => {
      if (!m.renewal_date) return;
      const renewal = new Date(m.renewal_date);
      renewal.setHours(0, 0, 0, 0);
      const daysOverdue = daysBetween(renewal, today);
      if (daysOverdue > 0) {
        generatedAlerts.push({
          type: "overdue",
          ref_id: m.id,
          title: `⚠️ Overdue: ${m.name}`,
          body: `Payment overdue by ${daysOverdue} day${daysOverdue > 1 ? "s" : ""}`,
          due_date: m.renewal_date,
        });
      }
    });

    // Signup alerts
    (leads ?? []).forEach((l) => {
      generatedAlerts.push({
        type: "signup",
        ref_id: l.id,
        title: `👤 New Sign-up: ${l.name}`,
        body: `Pending review — signed up ${new Date(l.signed_up_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`,
        due_date: null,
      });
    });

    // Upsert into DB (key = type+ref_id, or just insert if no ref)
    if (generatedAlerts.length > 0) {
      // Get existing to avoid duplicates
      const { data: existing } = await supabase
        .from("alerts")
        .select("type, ref_id, id");

      const existingKeys = new Set((existing ?? []).map((a) => `${a.type}::${a.ref_id}`));

      const toInsert = generatedAlerts.filter(
        (a) => !existingKeys.has(`${a.type}::${a.ref_id}`)
      );

      if (toInsert.length > 0) {
        await supabase.from("alerts").insert(
          toInsert.map((a) => ({ ...a, is_read: false }))
        );
      }
    }

    // Load all alerts
    const { data: all } = await supabase
      .from("alerts")
      .select("*")
      .order("created_at", { ascending: false });

    setAlerts((all ?? []) as Alert[]);
    setLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    await syncAlerts();
  }, [syncAlerts]);

  useEffect(() => { syncAlerts(); }, [syncAlerts]);

  const markRead = useCallback(async (id: string) => {
    await supabase.from("alerts").update({ is_read: true }).eq("id", id);
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, is_read: true } : a));
  }, []);

  const markAllRead = useCallback(async () => {
    await supabase.from("alerts").update({ is_read: true }).eq("is_read", false);
    setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
  }, []);

  const deleteAlert = useCallback(async (id: string) => {
    await supabase.from("alerts").delete().eq("id", id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const unread = alerts.filter((a) => !a.is_read).length;

  return (
    <Ctx.Provider value={{ alerts, unread, loading, refresh, markRead, markAllRead, deleteAlert }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAlerts() {
  return useContext(Ctx);
}
