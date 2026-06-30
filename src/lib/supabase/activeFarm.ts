import { createClient } from "@/lib/supabase/client";
import type { Farm } from "@/types";

export async function getClientActiveFarm(): Promise<{ farm: Farm; isOwner: boolean } | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: owned } = await supabase
    .from("farms").select("*").eq("user_id", user.id).maybeSingle();

  if (owned) {
    const { data: reading } = await supabase
      .from("readings").select("id").eq("farm_id", owned.id).limit(1).maybeSingle();
    if (reading) return { farm: owned as Farm, isOwner: true };
  }

  // Two-step lookup — nested selects on farm_members can silently return null
  try {
    const { data: mem } = await supabase
      .from("farm_members")
      .select("farm_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();
    if (mem?.farm_id) {
      const { data: shared } = await supabase
        .from("farms").select("*").eq("id", mem.farm_id).maybeSingle();
      if (shared) return { farm: shared as Farm, isOwner: false };
    }
  } catch { /* table not yet created */ }

  if (owned) return { farm: owned as Farm, isOwner: true };
  return null;
}
