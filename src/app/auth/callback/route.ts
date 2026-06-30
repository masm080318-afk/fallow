import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  const forwardedHost = request.headers.get("x-forwarded-host");
  const baseUrl =
    process.env.NODE_ENV === "production" && forwardedHost
      ? `https://${forwardedHost}`
      : origin;

  if (error) {
    return NextResponse.redirect(`${baseUrl}/login?error=auth`);
  }

  // Read pending_invite from raw Cookie header — works in every Next.js version,
  // no next/headers import needed.
  const rawCookies = request.headers.get("cookie") ?? "";
  const pendingInvite = rawCookies
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("pending_invite="))
    ?.slice("pending_invite=".length);

  if (pendingInvite) {
    // Do the join right here so we never need to redirect back to /join/TOKEN.
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const svc = createServiceClient();
      try {
        const { data: farm } = await svc
          .from("farms")
          .select("id, user_id")
          .eq("invite_token", pendingInvite)
          .maybeSingle();

        if (farm && farm.user_id !== user.id) {
          // Delete the empty placeholder farm the user got from onboarding, if any
          const { data: ownFarm } = await svc
            .from("farms").select("id").eq("user_id", user.id).maybeSingle();
          if (ownFarm) {
            const { data: hasReading } = await svc
              .from("readings").select("id").eq("farm_id", ownFarm.id).limit(1).maybeSingle();
            if (!hasReading) {
              await svc.from("farms").delete().eq("id", ownFarm.id);
            }
          }

          // Add to farm_members if not already there
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
        }
      } catch { /* farm_members table or invite_token column not yet created */ }
    }

    const res = NextResponse.redirect(`${baseUrl}/dashboard`);
    // Clear the invite cookie
    res.cookies.set("pending_invite", "", { maxAge: 0, path: "/" });
    return res;
  }

  // Normal login — check where to send the user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${baseUrl}/login?error=auth`);

  const { data: farm } = await supabase
    .from("farms").select("id").eq("user_id", user.id).maybeSingle();
  if (farm) return NextResponse.redirect(`${baseUrl}/dashboard`);

  const svc = createServiceClient();
  try {
    const { data: mem } = await svc
      .from("farm_members").select("id").eq("user_id", user.id).limit(1).maybeSingle();
    if (mem) return NextResponse.redirect(`${baseUrl}/dashboard`);
  } catch { /* table not yet created */ }

  return NextResponse.redirect(`${baseUrl}/onboarding`);
}
