import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // "next" lets callers specify where to go after auth (e.g. /join/TOKEN)
  const next = searchParams.get("next");

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

  // If caller supplied a `next` URL, respect it (used by invite/join flow)
  if (next) {
    return NextResponse.redirect(`${baseUrl}${next}`);
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${baseUrl}/login?error=auth`);
  }

  // Check owned farm
  const { data: farm } = await supabase
    .from("farms").select("id").eq("user_id", user.id).maybeSingle();
  if (farm) return NextResponse.redirect(`${baseUrl}/dashboard`);

  // Check shared farm membership
  const svc = createServiceClient();
  try {
    const { data: mem } = await svc
      .from("farm_members").select("id").eq("user_id", user.id).limit(1).maybeSingle();
    if (mem) return NextResponse.redirect(`${baseUrl}/dashboard`);
  } catch { /* table not yet created */ }

  return NextResponse.redirect(`${baseUrl}/onboarding`);
}
