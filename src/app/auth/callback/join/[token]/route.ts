import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Handles the OAuth callback for invite-link joins.
// The invite token lives in the URL PATH so it survives the full redirect chain —
// Supabase never strips path segments, only query params can get dropped.
//
// Flow: /join/TOKEN → OAuth (redirectTo: /auth/callback/join/TOKEN) → here → /dashboard
export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/auth/callback/join/[token]">
) {
  const { token } = await ctx.params;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  const forwardedHost = request.headers.get("x-forwarded-host");
  const baseUrl =
    process.env.NODE_ENV === "production" && forwardedHost
      ? `https://${forwardedHost}`
      : new URL(request.url).origin;

  if (!code || !token) {
    return NextResponse.redirect(`${baseUrl}/login?error=auth`);
  }

  // Exchange the OAuth code for a session
  const supabase = await createClient();
  const { error: authError } = await supabase.auth.exchangeCodeForSession(code);
  if (authError) return NextResponse.redirect(`${baseUrl}/login?error=auth`);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${baseUrl}/login?error=auth`);

  const svc = createServiceClient();

  // Look up the farm by invite token
  const { data: farm } = await svc
    .from("farms")
    .select("id, name, user_id")
    .eq("invite_token", token)
    .maybeSingle();

  if (!farm) {
    // Token is invalid or revoked — send to onboarding with an error flag
    return NextResponse.redirect(`${baseUrl}/onboarding?invite_error=invalid`);
  }

  // If the signed-in user already owns the farm, just go to dashboard
  if (farm.user_id === user.id) {
    return NextResponse.redirect(`${baseUrl}/dashboard`);
  }

  // Delete the joiner's empty farm (created during a previous onboarding attempt)
  // so the shared farm becomes their active one
  const { data: ownFarm } = await svc
    .from("farms")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (ownFarm) {
    const { data: hasReading } = await svc
      .from("readings")
      .select("id")
      .eq("farm_id", ownFarm.id)
      .limit(1)
      .maybeSingle();
    if (!hasReading) {
      await svc.from("farms").delete().eq("id", ownFarm.id);
    }
  }

  // Upsert membership (no-op if already a member)
  const { data: existing } = await svc
    .from("farm_members")
    .select("id")
    .eq("farm_id", farm.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) {
    await svc
      .from("farm_members")
      .insert({ farm_id: farm.id, user_id: user.id, role: "viewer" });
  }

  return NextResponse.redirect(`${baseUrl}/dashboard`);
}
