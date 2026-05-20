"use client";

import Link from "next/link";
import { Sprout, LogOut } from "lucide-react";
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
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-[var(--border)] px-5 py-3 flex items-center justify-between">
      <Link href="/dashboard" className="flex items-center gap-2">
        <Sprout className="text-green" size={22} />
        <span className="text-lg font-bold tracking-tight text-green">
          Fallow
        </span>
        {farmName && (
          <span className="hidden sm:inline text-sm text-muted ml-3 border-l border-[var(--border)] pl-3">
            {farmName}
          </span>
        )}
      </Link>
      <button
        onClick={signOut}
        className="text-muted hover:text-foreground transition-colors"
        aria-label="Sign out"
      >
        <LogOut size={18} />
      </button>
    </header>
  );
}
