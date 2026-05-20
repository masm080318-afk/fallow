import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  // On Vercel the internal origin differs from the public URL.
  // x-forwarded-host is the real public hostname.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const baseUrl =
    process.env.NODE_ENV === "production" && forwardedHost
      ? `https://${forwardedHost}`
      : origin;

  if (error) {
    return NextResponse.redirect(`${baseUrl}/login?error=auth`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${baseUrl}/login?error=auth`);
  }

  const { data: farm } = await supabase
    .from("farms")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.redirect(`${baseUrl}${farm ? "/dashboard" : "/onboarding"}`);
}
