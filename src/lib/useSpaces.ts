import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface Space {
  id: string;
  code: string;
  label: string;
  type: "Desk" | "Cabin" | "Meeting Room";
  capacity: number;
  is_active: boolean;
}

export function useSpaces() {
  const [spaces, setSpaces]   = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("spaces")
      .select("*")
      .eq("is_active", true)
      .order("type")
      .order("code");
    setSpaces((data as Space[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  return { spaces, loading, refetch: fetch };
}

/** Returns codes already assigned to active members */
export async function getOccupiedSpaces(): Promise<string[]> {
  const { data } = await supabase
    .from("members")
    .select("assigned_space")
    .eq("status", "Active")
    .not("assigned_space", "is", null);
  return (data ?? []).map((r: any) => r.assigned_space as string).filter(Boolean);
}
