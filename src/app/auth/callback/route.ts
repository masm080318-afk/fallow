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
  // Set-Cookie header by /api/invite-oauth/[token] so it's always in the Cookie
  // request header here — server-readable, unaffected by browser privacy features.
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
      // Remove the new user's auto-created empty farm if they have one
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

      // Check for existing membership before inserting
      const { data: existing } = await svc
        .from("farm_members")
        .select("id")
        .eq("farm_id", farm.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!existing) {
        // Try with role column first; if that column doesn't exist, insert without it
        const { error: e1 } = await svc
          .from("farm_members")
          .insert({ farm_id: farm.id, user_id: user.id, role: "viewer" });

        if (e1) {
          const { error: e2 } = await svc
            .from("farm_members")
            .insert({ farm_id: farm.id, user_id: user.id });

          if (e2) {
            // Insert truly failed — surface error so the user can report it
            const msg = encodeURIComponent(e2.message);
            return NextResponse.redirect(
              `${baseUrl}/join/${pendingInvite}?error=${msg}`
            );
          }
        }
      }

      return NextResponse.redirect(`${baseUrl}/dashboard`);
    }

    // Farm not found with that token (expired / regenerated)
    if (!farm) {
      return NextResponse.redirect(
        `${baseUrl}/join/${pendingInvite}?error=This+invite+link+is+no+longer+valid.`
      );
    }
  }

  // Normal sign-in: check owned farm then shared membership
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
  } catch { /* farm_members not yet created */ }

  return NextResponse.redirect(`${baseUrl}/onboarding`);
}
