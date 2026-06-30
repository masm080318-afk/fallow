// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getActiveFarm(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: owned } = await supabase
    .from("farms").select("*").eq("user_id", user.id).maybeSingle();

  if (owned) {
    const { data: reading } = await supabase
      .from("readings").select("id").eq("farm_id", owned.id).limit(1).maybeSingle();
    if (reading) return owned;
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
      if (shared) return shared;
    }
  } catch { /* table not yet created */ }

  if (owned) return owned;
  return null;
}
