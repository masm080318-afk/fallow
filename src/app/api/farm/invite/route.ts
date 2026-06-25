import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET  — returns (or generates) the farm's invite link
// DELETE — revokes the invite token
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: farm } = await supabase.from("farms").select("id, invite_token").eq("user_id", user.id).single();
  if (!farm) return NextResponse.json({ error: "No farm" }, { status: 404 });

  let token = farm.invite_token as string | null;
  if (!token) {
    // Generate a new token
    const svc = createServiceClient();
    const newToken = crypto.randomUUID();
    await svc.from("farms").update({ invite_token: newToken }).eq("id", farm.id);
    token = newToken;
  }

  return NextResponse.json({ token });
}

export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const svc = createServiceClient();
  const { data: farm } = await supabase.from("farms").select("id").eq("user_id", user.id).single();
  if (!farm) return NextResponse.json({ error: "No farm" }, { status: 404 });

  await svc.from("farms").update({ invite_token: null }).eq("id", farm.id);
  return NextResponse.json({ ok: true });
}
