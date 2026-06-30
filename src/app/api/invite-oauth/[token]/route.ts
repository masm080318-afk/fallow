import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const forwardedHost = request.headers.get("x-forwarded-host");
  const baseUrl =
    process.env.NODE_ENV === "production" && forwardedHost
      ? `https://${forwardedHost}`
      : new URL(request.url).origin;

  // Collect all cookies that Supabase wants to set (including PKCE verifier).
  // Using a custom setAll so we can apply them directly to NextResponse —
  // this guarantees they appear in the Set-Cookie headers of the redirect
  // response rather than relying on Next.js's implicit cookie-merge behaviour.
  const cookiesToSet: Array<{
    name: string;
    value: string;
    options: Record<string, unknown>;
  }> = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach((c) => cookiesToSet.push(c));
        },
      },
    }
  );

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${baseUrl}/auth/callback`,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data?.url) {
    return NextResponse.redirect(`${baseUrl}/login?error=oauth`);
  }

  const response = NextResponse.redirect(data.url);

  // Apply PKCE verifier (and any other cookies Supabase wrote) to response
  cookiesToSet.forEach(({ name, value, options }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response.cookies.set(name, value, options as any);
  });

  // Store invite token so /auth/callback can complete the join after sign-in
  response.cookies.set("pending_invite", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return response;
}
