import { createServerClient } from "@supabase/ssr";
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

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Logged-in users hitting / or /login go straight to dashboard.
  if (user && (path === "/" || (isAuthPage && !path.startsWith("/auth/callback")))) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (user && (path.startsWith("/dashboard") || path === "/onboarding")) {
    // Check farm existence to gate onboarding vs dashboard.
    const { data: farm } = await supabase
      .from("farms")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!farm && path.startsWith("/dashboard")) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
    if (farm && path === "/onboarding") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
