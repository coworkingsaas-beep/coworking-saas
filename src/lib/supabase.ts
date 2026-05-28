import { createClient } from "@supabase/supabase-js";

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, key);

// ── Types matching roadmap 3.1 ────────────────────────────────────────────────
export type SpaceType = "Dedicated Desk" | "Manager Cabin" | "Two-Seater Cabin" | "Virtual Desk";
export type MemberStatus = "Active" | "Inactive";
export type WelcomeStatus = "Pending" | "Sent";

export interface Member {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  date_of_birth: string | null;
  joining_date: string;
  renewal_date: string | null;
  space_type: SpaceType | null;
  assigned_space: string | null;
  security_deposit: number;
  rent_amount: number;
  team_size: number;
  total_prints_used: number;
  total_prints_allowed: number;
  discounted_member: boolean;
  source: string | null;
  status: MemberStatus;
  exit_reason: string | null;
  welcome_message_status: WelcomeStatus;
  duplicate_entry_flag: boolean;
  company: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type MemberInsert = Omit<Member, "id" | "created_at" | "updated_at">;
