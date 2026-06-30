import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await request.json();
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const svc = createServiceClient();

  const { data: farm } = await svc.from("farms").select("id, name, user_id").eq("invite_token", token).maybeSingle();
  if (!farm) return NextResponse.json({ error: "Invalid or expired invite link." }, { status: 404 });

  if (farm.user_id === user.id) {
    return NextResponse.json({ error: "You already own this farm.", farm_name: farm.name }, { status: 409 });
  }

  // If the joiner has their own empty farm from onboarding, delete it so the shared
  // farm becomes their active one (no readings = safe to remove).
  const { data: ownFarm } = await svc
    .from("farms").select("id").eq("user_id", user.id).maybeSingle();
  if (ownFarm) {
    const { data: hasReading } = await svc
      .from("readings").select("id").eq("farm_id", ownFarm.id).limit(1).maybeSingle();
    if (!hasReading) {
      await svc.from("farms").delete().eq("id", ownFarm.id);
    }
  }

  // Check if already a member
  const { data: existing } = await svc
    .from("farm_members").select("id").eq("farm_id", farm.id).eq("user_id", user.id).maybeSingle();
  if (existing) {
    return NextResponse.json({ ok: true, farm_name: farm.name, already_member: true });
  }

  const { error } = await svc.from("farm_members").insert({ farm_id: farm.id, user_id: user.id, role: "viewer" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, farm_name: farm.name });
}
