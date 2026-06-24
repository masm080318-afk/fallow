"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Droplets, MessageSquare, Bell } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true); setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setLoading(false); }
  };

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center px-6 overflow-hidden">

      {/* Background photo */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1800&q=85"
          alt="Farm at golden hour"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/60 to-black/85" />
        {/* subtle vignette */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.45) 100%)" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm animate-fade-up">

        {/* Logo + wordmark */}
        <div className="flex flex-col items-center mb-10">
          <div className="animate-float">
            <Image
              src="/logo-icon.png"
              alt="Soilify Labs"
              width={72}
              height={72}
              className="drop-shadow-[0_0_24px_rgba(125,212,79,0.45)]"
              priority
            />
          </div>
          <h1 className="mt-4 text-2xl font-black text-white tracking-tight">Soilify Labs</h1>
          <p className="text-sm mt-1 text-white/45">Precision agriculture for small farms</p>
        </div>

        {/* Glass card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(24px) saturate(160%)",
            WebkitBackdropFilter: "blur(24px) saturate(160%)",
            border: "1px solid rgba(255,255,255,0.13)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <h2 className="text-lg font-bold text-white text-center mb-1">Sign in to your farm</h2>
          <p className="text-sm text-white/45 text-center mb-7">Monitor your soil from anywhere</p>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-xl font-semibold text-sm transition-all duration-200"
            style={{
              minHeight: 50,
              background: "rgba(255,255,255,0.92)",
              color: "#1c2c1a",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.92)")}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-[#c8d8c4] border-t-[var(--green)] rounded-full animate-spin" />
                Redirecting…
              </>
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {error && (
            <p className="text-sm mt-4 text-center rounded-xl py-2.5 px-3"
              style={{ color: "#ff8a8a", background: "rgba(192,57,43,0.15)", border: "1px solid rgba(192,57,43,0.25)" }}>
              {error}
            </p>
          )}

          {/* Feature pills */}
          <div className="flex items-center gap-3 mt-7 mb-5">
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.1)" }} />
            <span className="text-xs text-white/35 tracking-widest uppercase">what&apos;s included</span>
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.1)" }} />
          </div>

          <div className="space-y-3">
            {[
              { icon: Droplets,      text: "Live soil moisture from your sensor" },
              { icon: MessageSquare, text: "AI crop analysis with photos" },
              { icon: Bell,          text: "SMS alerts when soil gets dry" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(125,212,79,0.12)" }}>
                  <Icon size={13} style={{ color: "var(--green-bright)" }} />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-6 text-xs text-white/30">
          <span>Free software · No card needed</span>
          <span>·</span>
          <Link href="/" className="hover:text-white/55 transition-colors">Back to site</Link>
        </div>
      </div>
    </main>
  );
}
