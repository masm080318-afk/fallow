import { createClient } from "@/lib/supabase/client";
import type { Farm } from "@/types";

// Client-side helper: returns owned farm or shared farm for the current user.
export async function getClientActiveFarm(): Promise<{ farm: Farm; isOwner: boolean } | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Owned farm
  const { data: owned } = await supabase
    .from("farms").select("*").eq("user_id", user.id).maybeSingle();
  if (owned) return { farm: owned as Farm, isOwner: true };

  // Shared farm via farm_members
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

  return null;
}
