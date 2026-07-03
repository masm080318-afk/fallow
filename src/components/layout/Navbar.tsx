"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LineChart, MessageSquare, Bell, Settings } from "lucide-react";

const items = [
  { href: "/dashboard",           label: "Home",     icon: Home },
  { href: "/dashboard/charts",    label: "Charts",   icon: LineChart },
  { href: "/dashboard/assistant", label: "AI",       icon: MessageSquare },
  { href: "/dashboard/alerts",    label: "Alerts",   icon: Bell },
  { href: "/dashboard/settings",  label: "Settings", icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 pb-[env(safe-area-inset-bottom)]">
      <div
        style={{
          background: "var(--paper)",
          borderTop: "1px solid var(--border)",
        }}
      >
        <ul className="grid grid-cols-5 max-w-lg mx-auto">
          {items.map(({ href, label, icon: Icon }) => {
            const active = href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className="relative flex flex-col items-center gap-1 py-3 text-xs transition-all duration-200"
                  style={{ color: active ? "var(--green)" : "var(--muted)" }}
                >
                  {active && (
                    <span
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                      style={{ background: "var(--green)" }}
                    />
                  )}
                  <span
                    className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200"
                    style={active ? {
                      background: "rgba(46,107,31,0.1)",
                    } : undefined}
                  >
                    <Icon size={19} strokeWidth={active ? 2.4 : 1.8} />
                  </span>
                  <span style={{ fontSize: "10px", fontWeight: active ? 600 : 400, lineHeight: 1, marginTop: -2 }}>
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
