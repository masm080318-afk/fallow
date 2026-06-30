import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  const forwardedHost = request.headers.get("x-forwarded-host");
  const baseUrl =
    process.env.NODE_ENV === "production" && forwardedHost
      ? `https://${forwardedHost}`
      : origin;

  if (!code) return NextResponse.redirect(`${baseUrl}/login?error=auth`);

  // Exchange the OAuth code for a session. The PKCE verifier was stored in a
  // Set-Cookie header by /api/invite-oauth/[token], so it arrives here in the
  // Cookie request header and the server client can read it reliably.
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(`${baseUrl}/login?error=auth`);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${baseUrl}/login?error=auth`);

  const svc = createServiceClient();
  const cookieStore = await cookies();

  // If this sign-in was triggered by an invite link, complete the join now.
  const pendingInvite = cookieStore.get("pending_invite")?.value;
  if (pendingInvite) {
    cookieStore.delete("pending_invite");

    const { data: farm } = await svc
      .from("farms")
      .select("id, name, user_id")
      .eq("invite_token", pendingInvite)
      .maybeSingle();

    if (farm && farm.user_id !== user.id) {
      // Remove the new user's auto-created empty farm so they don't own two
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
  }

  // Normal sign-in: redirect to dashboard if they already have a farm or membership
  const { data: ownFarm } = await svc
    .from("farms")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (ownFarm) return NextResponse.redirect(`${baseUrl}/dashboard`);

  try {
    const { data: mem } = await svc
      .from("farm_members")
      .select("farm_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();
    if (mem?.farm_id) return NextResponse.redirect(`${baseUrl}/dashboard`);
  } catch { /* farm_members may not exist yet */ }

  return NextResponse.redirect(`${baseUrl}/onboarding`);
}
