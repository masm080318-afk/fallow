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
    <header className="sticky top-0 z-30 glass border-b border-[var(--border)] px-5 py-3 flex items-center justify-between">
      <Link href="/dashboard" className="flex items-center gap-2.5 group">
        <Image
          src="/logo.png"
          alt="Soilify Labs"
          width={30}
          height={30}
          className="rounded-md transition-transform duration-300 group-hover:scale-105"
        />
        <span className="text-base font-bold tracking-tight text-gradient">
          Soilify Labs
        </span>
        {farmName && (
          <span className="hidden sm:inline text-xs text-[var(--muted)] ml-1 border-l border-[var(--border)] pl-3 font-medium">
            {farmName}
          </span>
        )}
      </Link>

      <div className="flex items-center gap-1">
        <Link
          href="/dashboard/settings"
          className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors !min-h-0 !p-2 !bg-transparent !border-0 rounded-lg hover:bg-white/5"
          aria-label="Settings"
        >
          <Settings size={16} />
        </Link>
        <button
          onClick={signOut}
          className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors !min-h-0 !p-2 !bg-transparent !border-0 rounded-lg hover:bg-white/5"
          aria-label="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
