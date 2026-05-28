import { supabase } from "./supabase";

export type Role = "admin" | "user" | "pending" | "unauthenticated";

export interface AuthState {
  role: Role;
  email: string | null;
  userId: string | null;
}

/**
 * Determines the current user's role by:
 * 1. Checking Supabase Auth session
 * 2. Checking admin_users table (authoritative)
 * 3. Checking signup_leads approval status
 * 4. Checking members table
 */
export async function getRole(): Promise<AuthState> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { role: "unauthenticated", email: null, userId: null };

  const email  = user.email ?? null;
  const userId = user.id;

  // 1. Check admin whitelist (most authoritative)
  const { data: adminRecord } = await supabase
    .from("admin_users")
    .select("id")
    .eq("email", email ?? "")
    .maybeSingle();

  if (adminRecord) return { role: "admin", email, userId };

  // 2. Check signup_leads status
  const { data: lead } = await supabase
    .from("signup_leads")
    .select("verification_status")
    .eq("email", email ?? "")
    .maybeSingle();

  if (lead) {
    if (lead.verification_status === "Approved") return { role: "user", email, userId };
    // Pending or Rejected → pending (can't access anything)
    return { role: "pending", email, userId };
  }

  // 3. Direct member (added by admin, no signup_lead)
  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("email", email ?? "")
    .maybeSingle();

  if (member) return { role: "user", email, userId };

  // Authenticated but unrecognized → treat as pending
  return { role: "pending", email, userId };
}
