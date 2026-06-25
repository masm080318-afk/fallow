"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Sprout, CheckCircle, XCircle, Loader } from "lucide-react";

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
        // Redirect to login, come back after
        setStatus("signing-in");
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: `${window.location.origin}/join/${token}` },
        });
        return;
      }

      setStatus("joining");
      const res = await fetch("/api/farm/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const json = await res.json();

      if (res.ok || res.status === 409) {
        setStatus("done");
        setMessage(`You now have access to ${json.farm_name}.`);
        setTimeout(() => router.replace("/dashboard"), 2000);
      } else {
        setStatus("error");
        setMessage(json.error ?? "Something went wrong.");
      }
    })();
  }, [token, router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "var(--background)" }}>
      <div className="flex flex-col items-center gap-5 max-w-sm text-center">
        <Image src="/logo-icon.png" alt="Soilify" width={56} height={56} />
        <h1 className="text-xl font-black">Join a Soilify Farm</h1>

        {status === "loading" || status === "signing-in" || status === "joining" ? (
          <>
            <Loader size={28} className="animate-spin" style={{ color: "var(--green)" }} />
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              {status === "signing-in" ? "Redirecting to sign-in…" : "Joining farm…"}
            </p>
          </>
        ) : status === "done" ? (
          <>
            <CheckCircle size={40} style={{ color: "var(--green)" }} />
            <p className="font-semibold">{message}</p>
            <p className="text-sm" style={{ color: "var(--muted)" }}>Taking you to the dashboard…</p>
          </>
        ) : (
          <>
            <XCircle size={40} style={{ color: "var(--red)" }} />
            <p className="font-semibold text-red-600">{message}</p>
            <a href="/" className="text-sm underline" style={{ color: "var(--green)" }}>Back to home</a>
          </>
        )}
      </div>
    </main>
  );
}
