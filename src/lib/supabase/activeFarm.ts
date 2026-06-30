import { createClient } from "@/lib/supabase/client";
import type { Farm } from "@/types";

export async function getClientActiveFarm(): Promise<{ farm: Farm; isOwner: boolean } | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: owned } = await supabase
    .from("farms").select("*").eq("user_id", user.id).maybeSingle();

  if (owned) {
    // If the owned farm has at least one reading it's the real farm — use it.
    const { data: reading } = await supabase
      .from("readings").select("id").eq("farm_id", owned.id).limit(1).maybeSingle();
    if (reading) return { farm: owned as Farm, isOwner: true };
    // Owned farm exists but is empty — fall through to check shared farms below.
  }

  try {
    const { data: mem } = await supabase
      .from("farm_members")
      .select("farms(*)")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shared = (mem as any)?.farms;
    if (shared) return { farm: shared as Farm, isOwner: false };
  } catch { /* table not yet created */ }

  // Fall back to owned even if empty (owner with no sensor yet)
  if (owned) return { farm: owned as Farm, isOwner: true };

  return null;
}
