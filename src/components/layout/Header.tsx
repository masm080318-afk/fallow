"use client";

import Link from "next/link";
import Image from "next/image";
import { LogOut, Settings, CircleHelp } from "lucide-react";
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
    <header
      className="sticky top-0 z-30 px-5 py-3 flex items-center justify-between"
      style={{
        background: "rgba(245,248,244,0.88)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderBottom: "1px solid rgba(92,158,42,0.12)",
        boxShadow: "0 1px 12px rgba(0,0,0,0.06)",
      }}
    >
      <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
        <Image
          src="/logo-icon.png"
          alt="Soilify Labs"
          width={28}
          height={28}
          className="shrink-0"
        />
        <span className="text-base font-black tracking-tight text-gradient whitespace-nowrap">Soilify Labs</span>
        {farmName && (
          <span
            className="hidden sm:inline text-xs ml-1 pl-3 font-medium truncate max-w-[140px]"
            style={{ borderLeft: "1px solid var(--border)", color: "var(--muted)" }}
          >
            {farmName}
          </span>
        )}
      </Link>

      <div className="flex items-center gap-0.5 shrink-0">
        <Link
          href="/dashboard/help"
          aria-label="Help"
          className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-150 hover:bg-black/5"
          style={{ color: "var(--muted)" }}
        >
          <CircleHelp size={17} />
        </Link>
        <Link
          href="/dashboard/settings"
          aria-label="Settings"
          className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-150 hover:bg-black/5"
          style={{ color: "var(--muted)" }}
        >
          <Settings size={17} />
        </Link>
        <button
          onClick={signOut}
          aria-label="Sign out"
          className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-150 hover:bg-black/5 !min-h-0 !p-0 !bg-transparent !border-0"
          style={{ color: "var(--muted)" }}
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
