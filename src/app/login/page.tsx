"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Sprout } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); setLoading(false); }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Animated background orbs */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)",
          animation: "float 6s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%)",
          animation: "float 8s ease-in-out infinite reverse",
        }}
      />

      <div className="w-full max-w-sm relative animate-fade-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.05))",
              border: "1px solid rgba(34,197,94,0.3)",
              boxShadow: "0 0 30px rgba(34,197,94,0.2)",
            }}
          >
            <Sprout
              size={32}
              className="text-green animate-float"
              style={{ filter: "drop-shadow(0 0 8px rgba(34,197,94,0.6))" }}
            />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gradient">Fallow</h1>
          <p className="text-sm text-muted mt-1">Smart soil monitoring for real farms</p>
        </div>

        {/* Card */}
        <div
          className="card p-7"
          style={{
            background: "linear-gradient(145deg, #131313, #0e0e0e)",
            boxShadow: "0 0 40px rgba(0,0,0,0.6), 0 0 1px rgba(255,255,255,0.05) inset",
          }}
        >
          <h2 className="text-xl font-bold text-center mb-1">Welcome back</h2>
          <p className="text-sm text-muted text-center mb-7">Sign in to see your farm</p>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="btn-secondary w-full relative overflow-hidden group"
            style={{ minHeight: 52, borderRadius: "0.75rem" }}
          >
            {/* Hover shimmer */}
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)" }}
            />
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-muted border-t-green rounded-full animate-spin" />
                Redirecting...
              </span>
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
            <p className="text-red text-sm mt-4 text-center bg-red/10 rounded-lg py-2 px-3">{error}</p>
          )}

          <div className="flex items-center gap-3 mt-6 mb-4">
            <div className="h-px flex-1" style={{ background: "var(--border)" }} />
            <span className="text-xs text-muted">what you get</span>
            <div className="h-px flex-1" style={{ background: "var(--border)" }} />
          </div>

          <div className="space-y-2">
            {[
              "📡  Live soil moisture from your sensor",
              "🤖  AI plant health assistant",
              "📱  SMS alerts when soil gets dry",
            ].map((f) => (
              <div key={f} className="text-xs text-muted flex items-center gap-2 px-1">
                {f}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted text-center mt-5">
          By continuing you agree to receive SMS alerts about your farm.
        </p>
      </div>
    </main>
  );
}
