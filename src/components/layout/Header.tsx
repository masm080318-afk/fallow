"use client";

import Link from "next/link";
import Image from "next/image";
import { LogOut, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Header({ farmName }: { farmName?: string }) {
  const router = useRouter();

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 glass border-b border-[var(--border)] px-5 py-3 flex items-center justify-between"
      style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
      <Link href="/dashboard" className="flex items-center gap-2.5">
        <Image src="/logo.png" alt="Soilify Labs" width={28} height={28} />
        <span className="text-base font-bold tracking-tight text-gradient">Soilify Labs</span>
        {farmName && (
          <span className="hidden sm:inline text-xs ml-1 border-l border-[var(--border)] pl-3 font-medium" style={{ color: "var(--muted)" }}>
            {farmName}
          </span>
        )}
      </Link>

      <div className="flex items-center gap-1">
        <Link href="/dashboard/settings" aria-label="Settings"
          className="!min-h-0 !p-2 !bg-transparent !border-0 rounded-lg hover:bg-black/5 transition-colors"
          style={{ color: "var(--muted)" }}>
          <Settings size={16} />
        </Link>
        <button onClick={signOut} aria-label="Sign out"
          className="!min-h-0 !p-2 !bg-transparent !border-0 rounded-lg hover:bg-black/5 transition-colors"
          style={{ color: "var(--muted)" }}>
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
