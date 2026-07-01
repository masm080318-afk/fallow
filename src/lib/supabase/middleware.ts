import { createServerClient } from "@supabase/ssr";
import { createClient as createSvcClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthPage =
    path.startsWith("/login") || path.startsWith("/auth/callback");
  const isProtected =
    path.startsWith("/dashboard") || path.startsWith("/onboarding");
  const isHome = path === "/";

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Logged-in users hitting / or /login go straight to dashboard.
  if (user && (isHome || (isAuthPage && !path.startsWith("/auth/callback")))) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (user && (path.startsWith("/dashboard") || path === "/onboarding")) {
    // Use service role so missing RLS policies don't block the farm lookup.
    const svc = createSvcClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
    const { data: ownedFarm } = await svc
      .from("farms")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    // Also accept users who joined via invite (farm_members row, no owned farm).
    let hasFarmAccess = !!ownedFarm;
    if (!hasFarmAccess) {
      const { data: mem } = await svc
        .from("farm_members")
        .select("farm_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();
      if (mem?.farm_id) hasFarmAccess = true;
    }

    if (!hasFarmAccess && path.startsWith("/dashboard")) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
    if (hasFarmAccess && path === "/onboarding") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
