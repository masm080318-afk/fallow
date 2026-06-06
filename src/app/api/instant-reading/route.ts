import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user's farm
  const { data: farm } = await supabase
    .from("farms")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!farm) {
    return NextResponse.json({ error: "No farm found" }, { status: 404 });
  }

  // Set instant_reading_requested flag
  const { error } = await supabase
    .from("farms")
    .update({ instant_reading_requested: true })
    .eq("id", farm.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    message: "Sensor will send reading when it wakes up (within 15 minutes)",
  });
}
