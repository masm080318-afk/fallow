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
      <div className="glass border-t border-[var(--border)]" style={{ boxShadow: "0 -1px 12px rgba(0,0,0,0.06)" }}>
        <ul className="grid grid-cols-5 max-w-lg mx-auto">
          {items.map(({ href, label, icon: Icon }) => {
            const active = href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className="relative flex flex-col items-center gap-1 py-3 text-xs transition-colors duration-150"
                  style={{ color: active ? "var(--green)" : "var(--muted)" }}
                >
                  {active && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-green" />
                  )}
                  <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                  <span className="font-medium" style={{ fontSize: "10px", fontWeight: active ? 600 : 400 }}>
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
