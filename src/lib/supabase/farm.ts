// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getActiveFarm(supabase: any) {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (mem?.farms) return (mem as any).farms;
  } catch { /* table not yet created */ }

  return null;
}
