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
    <header className="sticky top-0 z-30 glass border-b border-[var(--border)] px-5 py-3 flex items-center justify-between">
      <Link href="/dashboard" className="flex items-center gap-2.5 group">
        <div className="relative">
          <Sprout
            className="text-green transition-all duration-300 group-hover:scale-110"
            size={22}
            style={{ filter: "drop-shadow(0 0 6px rgba(34,197,94,0.5))" }}
          />
        </div>
        <span
          className="text-lg font-black tracking-tight text-gradient"
        >
          Fallow
        </span>
        {farmName && (
          <span className="hidden sm:inline text-xs text-muted ml-2 border-l border-[var(--border)] pl-3 font-medium">
            {farmName}
          </span>
        )}
      </Link>
      <button
        onClick={signOut}
        className="text-muted hover:text-foreground transition-all duration-200 hover:scale-110 !min-h-0 !p-2 !bg-transparent !border-0 rounded-lg hover:bg-white/5"
        aria-label="Sign out"
      >
        <LogOut size={17} />
      </button>
    </header>
  );
}
