"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { createClient } from "@/lib/supabase/client";
import { Droplets, MessageSquare, Bell } from "lucide-react";

// Custom URL scheme registered in Info.plist (CFBundleURLTypes). OAuth
// providers redirect here instead of to soilifylabs.com/auth/callback when
// running in the native app, since a plain https redirect after the OAuth
// round-trip through system Safari lands in Safari, not back in the app.
const NATIVE_REDIRECT = "com.soilifylabs.app://auth-callback";

type Provider = "google" | "apple";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // Google/Apple finish their sign-in in the system browser sheet (Browser.open
    // below), then redirect to our custom URL scheme. iOS hands that back to us
    // here. We forward the auth code to our existing /auth/callback route by
    // navigating the app's own webview there directly — same origin as where the
    // PKCE code verifier cookie was set, so the server-side exchange just works,
    // and we reuse all the existing invite/farm-routing logic for free.
    const sub = CapApp.addListener("appUrlOpen", async ({ url }) => {
      Browser.close().catch(() => {});
      const queryIndex = url.indexOf("?");
      const query = queryIndex === -1 ? "" : url.slice(queryIndex);
      if (!query) { setLoading(false); return; }
      window.location.href = `${window.location.origin}/auth/callback${query}`;
    });

    return () => { sub.then((s) => s.remove()); };
  }, []);

  const signIn = async (provider: Provider) => {
    setLoading(true); setError(null);
    const supabase = createClient();

    if (Capacitor.isNativePlatform()) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: NATIVE_REDIRECT, skipBrowserRedirect: true },
      });
      if (error) { setError(error.message); setLoading(false); return; }
      if (data?.url) {
        await Browser.open({ url: data.url, presentationStyle: "popover" });
      } else {
        setLoading(false);
      }
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setLoading(false); }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16" style={{ background: "var(--ink)" }}>
      <div className="w-full max-w-sm animate-fade-up">

        {/* Brand */}
        <div className="flex items-center gap-2 mb-8">
          <Image src="/logo-icon.png" alt="Soilify Labs" width={40} height={40} priority />
          <div>
            <h1 className="font-display text-xl text-white leading-tight">Soilify Labs</h1>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>Precision agriculture for small farms</p>
          </div>
        </div>

        {/* Panel */}
        <div
          className="rounded-2xl p-8"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.14)" }}
        >
          <h2 className="font-display text-lg text-white mb-1">Sign in to your farm</h2>
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.45)" }}>Monitor your soil from anywhere.</p>

          <div className="space-y-2">
            <button
              onClick={() => signIn("google")}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg font-semibold text-sm transition-colors bg-white text-[var(--ink)] hover:bg-[var(--paper)] active:bg-[var(--border)] disabled:opacity-50"
              style={{ minHeight: 48 }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
                  Redirecting…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            {Capacitor.isNativePlatform() && (
              <button
                onClick={() => signIn("apple")}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-lg font-semibold text-sm transition-colors bg-black text-white hover:bg-neutral-800 active:bg-neutral-900 disabled:opacity-50"
                style={{ minHeight: 48 }}
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 384 512" fill="currentColor">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141 4 184.8 4 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 37.6 59 129.3 107.2 127.8 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-84.1 102.6-121.8-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                </svg>
                Continue with Apple
              </button>
            )}
          </div>

          {error && (
            <p className="text-sm mt-4 rounded-lg py-2 px-4"
              style={{ color: "#E8A896", background: "rgba(168,68,42,0.18)", border: "1px solid rgba(168,68,42,0.35)" }}>
              {error}
            </p>
          )}

          <div className="h-px my-6" style={{ background: "rgba(255,255,255,0.12)" }} />

          <ul className="space-y-4">
            {[
              { icon: Droplets,      text: "Live soil moisture from your sensor" },
              { icon: MessageSquare, text: "AI crop analysis with photos" },
              { icon: Bell,          text: "SMS alerts when soil gets dry" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-4 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                <Icon size={16} className="shrink-0" style={{ color: "rgba(255,255,255,0.4)" }} />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-2 mt-6 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
          <span>Free software · No card needed</span>
          {!Capacitor.isNativePlatform() && (
            <>
              <span>·</span>
              <Link href="/" className="underline hover:text-white transition-colors">Back to site</Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
