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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${baseUrl}/login?error=auth`);

  // Owned farm
  const { data: farm } = await supabase
    .from("farms").select("id").eq("user_id", user.id).maybeSingle();
  if (farm) return NextResponse.redirect(`${baseUrl}/dashboard`);

  // Shared farm membership (two-query — nested select silently fails)
  const svc = createServiceClient();
  try {
    const { data: mem } = await svc
      .from("farm_members").select("farm_id").eq("user_id", user.id).limit(1).maybeSingle();
    if (mem?.farm_id) return NextResponse.redirect(`${baseUrl}/dashboard`);
  } catch { /* table not yet created */ }

  // No farm found — go to onboarding.
  // If the user came from an invite link, sessionStorage holds the token and
  // onboarding/page.tsx will call /api/farm/join automatically before showing any UI.
  return NextResponse.redirect(`${baseUrl}/onboarding`);
}
