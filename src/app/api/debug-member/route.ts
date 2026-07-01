import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Diagnostic route — remove after debugging invite flow
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "not signed in", userError });
  }

  const svc = createServiceClient();

  const [
    { data: ownedFarm, error: ownedErr },
    { data: memAnon, error: memAnonErr },
    { data: memSvc, error: memSvcErr },
    { data: allMembers, error: allMembersErr },
  ] = await Promise.all([
    svc.from("farms").select("id,name").eq("user_id", user.id).maybeSingle(),
    supabase.from("farm_members").select("farm_id").eq("user_id", user.id).limit(1).maybeSingle(),
    svc.from("farm_members").select("farm_id").eq("user_id", user.id).limit(1).maybeSingle(),
    svc.from("farm_members").select("user_id,farm_id,role").limit(20),
  ]);

  let sharedFarm = null;
  let sharedFarmErr = null;
  const farmId = memAnon?.farm_id ?? memSvc?.farm_id;
  if (farmId) {
    const { data, error } = await svc.from("farms").select("id,name").eq("id", farmId).maybeSingle();
    sharedFarm = data;
    sharedFarmErr = error;
  }

  return NextResponse.json({
    userId: user.id,
    ownedFarm,
    ownedErr,
    memAnon,
    memAnonErr,
    memSvc,
    memSvcErr,
    allMembers,
    allMembersErr,
    sharedFarm,
    sharedFarmErr,
  });
}
