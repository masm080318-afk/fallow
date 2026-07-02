import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/farm/pairing-code — returns the farm's gateway pairing code,
// generating one the first time it's requested. The user types this code
// on the gateway's captive-portal setup page; the gateway then sends it
// with every reading so /api/ingest knows which farm the data belongs to.
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const svc = createServiceClient();
  const { data: farm } = await svc
    .from("farms")
    .select("id, pairing_code")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!farm) return NextResponse.json({ error: "No farm found" }, { status: 404 });

  if (farm.pairing_code) return NextResponse.json({ code: farm.pairing_code });

  // Generate a unique 6-digit code (unique index guards collisions; retry a few times)
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const { error } = await svc
      .from("farms")
      .update({ pairing_code: code })
      .eq("id", farm.id);
    if (!error) return NextResponse.json({ code });
  }

  return NextResponse.json({ error: "Could not generate a code, try again" }, { status: 500 });
}
