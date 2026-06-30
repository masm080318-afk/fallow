// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getActiveFarm(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: owned } = await supabase
    .from("farms").select("*").eq("user_id", user.id).maybeSingle();

  if (owned) {
    // If owned farm has readings it's the real farm — use it.
    const { data: reading } = await supabase
      .from("readings").select("id").eq("farm_id", owned.id).limit(1).maybeSingle();
    if (reading) return owned;
    // Owned farm is empty — fall through to shared farms.
  }

  try {
    const { data: mem } = await supabase
      .from("farm_members")
      .select("farm_id, farms(*)")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (mem?.farms) return (mem as any).farms;
  } catch { /* table not yet created */ }

  // Owner with no sensor yet — return owned farm
  if (owned) return owned;

  return null;
}
