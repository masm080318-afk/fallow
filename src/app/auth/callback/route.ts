import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Decide redirect: dashboard or onboarding based on farm existence.
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: farm } = await supabase
          .from("farms")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        const target = farm ? next : "/onboarding";
        return NextResponse.redirect(`${origin}${target}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
