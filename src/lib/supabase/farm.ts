import type { SupabaseClient } from "@supabase/supabase-js";

// Returns the active farm for a user — either one they own or one shared with them.
export async function getActiveFarm(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Owned farm first
  const { data: owned } = await supabase
    .from("farms").select("*").eq("user_id", user.id).maybeSingle();
  if (owned) return owned;

  // Shared farm via farm_members (table may not exist yet — fail gracefully)
  try {
    const { data: mem } = await supabase
      .from("farm_members")
      .select("farm_id, farms(*)")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();
    if (mem?.farms) return mem.farms as Record<string, unknown>;
  } catch { /* table not yet created */ }

  return null;
}
