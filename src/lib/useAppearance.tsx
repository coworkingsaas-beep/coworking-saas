"use client";
import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";

export interface AppearanceSettings {
  theme: "light" | "dark" | "system";
  accent: string;
  compactRows: boolean;
  showSerialNumbers: boolean;
  dateFormat: string;
}

const DEFAULTS: AppearanceSettings = {
  theme: "light",
  accent: "#6366F1",
  compactRows: false,
  showSerialNumbers: true,
  dateFormat: "DD MMM YYYY",
};

const ACCENT_DARK: Record<string, string> = {
  "#6366F1": "#4F46E5",
  "#3B82F6": "#2563EB",
  "#10B981": "#059669",
  "#F59E0B": "#D97706",
  "#EF4444": "#DC2626",
  "#8B5CF6": "#7C3AED",
  "#06B6D4": "#0891B2",
};

interface AppearanceCtx {
  appearance: AppearanceSettings;
  setAppearance: (patch: Partial<AppearanceSettings>) => void;
}

const Ctx = createContext<AppearanceCtx>({
  appearance: DEFAULTS,
  setAppearance: () => {},
});

function applyTheme(s: AppearanceSettings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  // Accent
  root.style.setProperty("--primary", s.accent);
  root.style.setProperty("--primary-dark", ACCENT_DARK[s.accent] ?? s.accent);
  const lighter = s.accent + "33"; // ~20% opacity
  root.style.setProperty("--primary-lighter", lighter);

  // Dark mode
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = s.theme === "dark" || (s.theme === "system" && prefersDark);
  if (isDark) {
    root.style.setProperty("--bg", "#0F172A");
    root.style.setProperty("--surface", "#1E293B");
    root.style.setProperty("--border", "#334155");
    root.style.setProperty("--border-light", "#1E293B");
    root.style.setProperty("--neutral", "#1E293B");
    root.style.setProperty("--neutral-dark", "#0F172A");
    root.style.setProperty("--text-primary", "#F1F5F9");
    root.style.setProperty("--text-secondary", "#94A3B8");
    root.style.setProperty("--text-muted", "#64748B");
  } else {
    root.style.setProperty("--bg", "#F1F5F9");
    root.style.setProperty("--surface", "#FFFFFF");
    root.style.setProperty("--border", "#E2E8F0");
    root.style.setProperty("--border-light", "#F1F5F9");
    root.style.setProperty("--neutral", "#F8FAFC");
    root.style.setProperty("--neutral-dark", "#F1F5F9");
    root.style.setProperty("--text-primary", "#1E293B");
    root.style.setProperty("--text-secondary", "#64748B");
    root.style.setProperty("--text-muted", "#94A3B8");
  }
}

const LS_KEY = "cospace_appearance";

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [appearance, setAppearanceState] = useState<AppearanceSettings>(DEFAULTS);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const saved = { ...DEFAULTS, ...JSON.parse(raw) } as AppearanceSettings;
        setAppearanceState(saved);
        applyTheme(saved);
      } else {
        applyTheme(DEFAULTS);
      }
    } catch {
      applyTheme(DEFAULTS);
    }
  }, []);

  const setAppearance = useCallback((patch: Partial<AppearanceSettings>) => {
    setAppearanceState((prev) => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}
      applyTheme(next);
      return next;
    });
  }, []);

  return (
    <Ctx.Provider value={{ appearance, setAppearance }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAppearance() {
  return useContext(Ctx);
}
