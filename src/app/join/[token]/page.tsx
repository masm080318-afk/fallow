"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, XCircle, Loader } from "lucide-react";

export default function JoinFarmPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "signing-in" | "joining" | "done" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Not signed in — trigger Google OAuth.
        // redirectTo points at the dedicated server-side route which reads the
        // PKCE verifier from the HTTP Cookie header (reliable), does the code
        // exchange, inserts the farm_members row, and redirects to /dashboard.
        setStatus("signing-in");
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth/callback/join/${token}`,
          },
        });
        return;
      }

      // Signed in — call the join API
      setStatus("joining");
      const res = await fetch("/api/farm/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      let json: Record<string, string> = {};
      try { json = await res.json(); } catch { /* empty body */ }

      if (res.ok || res.status === 409) {
        setStatus("done");
        setMessage(`You now have access to ${json.farm_name ?? "the farm"}.`);
        setTimeout(() => router.replace("/dashboard"), 1500);
      } else {
        setStatus("error");
        setMessage(json.error ?? `Join failed (${res.status}). Please try the link again.`);
      }
    })();
  }, [token, router]);

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "var(--background)" }}
    >
      <div className="flex flex-col items-center gap-5 max-w-sm text-center">
        <Image src="/logo-icon.png" alt="Soilify" width={56} height={56} />
        <h1 className="text-xl font-black">Join a Soilify Farm</h1>

        {status === "loading" || status === "signing-in" || status === "joining" ? (
          <>
            <Loader size={28} className="animate-spin" style={{ color: "var(--green)" }} />
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              {status === "signing-in" ? "Redirecting to Google…" : "Joining farm…"}
            </p>
          </>
        ) : status === "done" ? (
          <>
            <CheckCircle size={40} style={{ color: "var(--green)" }} />
            <p className="font-semibold">{message}</p>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Taking you to the dashboard…
            </p>
          </>
        ) : (
          <>
            <XCircle size={40} style={{ color: "var(--red)" }} />
            <p className="font-semibold" style={{ color: "var(--red)" }}>
              {message}
            </p>
            <a href={`/join/${token}`} className="text-sm underline" style={{ color: "var(--green)" }}>
              Try again
            </a>
          </>
        )}
      </div>
    </main>
  );
}
