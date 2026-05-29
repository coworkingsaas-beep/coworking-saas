"use client";
import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";

// ── Currency metadata ──────────────────────────────────────────────────────────
export const CURRENCIES: Record<string, { symbol: string; label: string; locale: string }> = {
  INR: { symbol: "₹",  label: "INR — ₹", locale: "en-IN" },
  USD: { symbol: "$",  label: "USD — $", locale: "en-US" },
  EUR: { symbol: "€",  label: "EUR — €", locale: "de-DE" },
  GBP: { symbol: "£",  label: "GBP — £", locale: "en-GB" },
  AED: { symbol: "د.إ", label: "AED — د.إ", locale: "ar-AE" },
  SGD: { symbol: "S$", label: "SGD — S$", locale: "en-SG" },
};

export interface AppSettings {
  currency: string;
  monthly_due_day: number;
  default_seat_rent: number;
  default_cabin_rent: number;
  deposit_multiplier: number;
  grace_period_days: number;
  auto_flag_overdue: boolean;
  late_fee: number;
  accept_cash: boolean;
  accept_upi: boolean;
  accept_bank_transfer: boolean;
  upi_id: string;
}

const DEFAULTS: AppSettings = {
  currency: "INR",
  monthly_due_day: 5,
  default_seat_rent: 4500,
  default_cabin_rent: 14000,
  deposit_multiplier: 2,
  grace_period_days: 3,
  auto_flag_overdue: true,
  late_fee: 0,
  accept_cash: true,
  accept_upi: true,
  accept_bank_transfer: true,
  upi_id: "cospace@okaxis",
};

// ── Context ────────────────────────────────────────────────────────────────────
interface SettingsCtx {
  settings: AppSettings;
  loading: boolean;
  reload: () => Promise<void>;
  saveSettings: (patch: Partial<AppSettings>) => Promise<void>;
  /** Format a number as a currency string using the current setting */
  fmt: (amount: number) => string;
  /** Just the symbol e.g. "₹" */
  symbol: string;
}

const Ctx = createContext<SettingsCtx>({
  settings: DEFAULTS,
  loading: true,
  reload: async () => {},
  saveSettings: async () => {},
  fmt: (n) => `₹${n.toLocaleString()}`,
  symbol: "₹",
});

// ── Provider ───────────────────────────────────────────────────────────────────
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("app_settings").select("key,value");
    if (!error && data) {
      const map = Object.fromEntries(data.map((r: { key: string; value: string }) => [r.key, r.value]));
      setSettings({
        currency:             map.currency              ?? DEFAULTS.currency,
        monthly_due_day:      parseInt(map.monthly_due_day)      || DEFAULTS.monthly_due_day,
        default_seat_rent:    parseInt(map.default_seat_rent)    || DEFAULTS.default_seat_rent,
        default_cabin_rent:   parseInt(map.default_cabin_rent)   || DEFAULTS.default_cabin_rent,
        deposit_multiplier:   parseInt(map.deposit_multiplier)   || DEFAULTS.deposit_multiplier,
        grace_period_days:    parseInt(map.grace_period_days)    || DEFAULTS.grace_period_days,
        auto_flag_overdue:    map.auto_flag_overdue    === "true",
        late_fee:             parseInt(map.late_fee)             || 0,
        accept_cash:          map.accept_cash          !== "false",
        accept_upi:           map.accept_upi           !== "false",
        accept_bank_transfer: map.accept_bank_transfer !== "false",
        upi_id:               map.upi_id               ?? DEFAULTS.upi_id,
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const saveSettings = useCallback(async (patch: Partial<AppSettings>) => {
    const rows = Object.entries(patch).map(([key, val]) => ({
      key,
      value: String(val),
    }));
    await supabase.from("app_settings").upsert(rows, { onConflict: "key" });
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  const currency = CURRENCIES[settings.currency] ?? CURRENCIES.INR;

  const fmt = useCallback(
    (amount: number) => {
      try {
        return new Intl.NumberFormat(currency.locale, {
          style: "currency",
          currency: settings.currency,
          maximumFractionDigits: 0,
        }).format(amount);
      } catch {
        return `${currency.symbol}${amount.toLocaleString()}`;
      }
    },
    [settings.currency, currency]
  );

  return (
    <Ctx.Provider value={{ settings, loading, reload, saveSettings, fmt, symbol: currency.symbol }}>
      {children}
    </Ctx.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────────
export function useSettings() {
  return useContext(Ctx);
}
