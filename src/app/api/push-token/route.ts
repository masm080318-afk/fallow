import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getUser(request: Request) {
  const svc = createServiceClient();

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const { data: { user } } = await svc.auth.getUser(token);
    if (user) return user;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ?? null;
}

// POST /api/push-token — register this device's push token for the signed-in user
export async function POST(request: Request) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token, platform } = await request.json();
  if (!token?.trim()) return NextResponse.json({ error: "token required" }, { status: 400 });

  const svc = createServiceClient();
  const { error } = await svc
    .from("device_push_tokens")
    .upsert(
      { user_id: user.id, token: token.trim(), platform: platform === "android" ? "android" : "ios" },
      { onConflict: "user_id,token" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
