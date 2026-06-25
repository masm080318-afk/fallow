import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const svc = createServiceClient();

  // Delete owned farm (cascades to sensor_nodes, readings, alerts_log via FK)
  const { data: farm } = await svc.from("farms").select("id").eq("user_id", user.id).maybeSingle();
  if (farm) {
    await svc.from("readings").delete().eq("farm_id", farm.id);
    await svc.from("alerts_log").delete().eq("farm_id", farm.id);
    await svc.from("diagnoses").delete().eq("farm_id", farm.id);
    await svc.from("sensor_nodes").delete().eq("farm_id", farm.id);
    await svc.from("farms").delete().eq("id", farm.id);
  }

  // Remove from any shared farms
  try {
    await svc.from("farm_members").delete().eq("user_id", user.id);
  } catch { /* table may not exist */ }

  // Delete the auth user
  const { error } = await svc.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("Failed to delete auth user:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
