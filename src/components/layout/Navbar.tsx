"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LineChart, Bell, Settings, Sprout } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/charts", label: "Charts", icon: LineChart },
  { href: "/dashboard/assistant", label: "AI", icon: Sprout },
  { href: "/dashboard/alerts", label: "Alerts", icon: Bell },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 pb-[env(safe-area-inset-bottom)]">
      {/* Glass background */}
      <div className="glass border-t border-[var(--border)] mx-0">
        <ul className="grid grid-cols-5 max-w-lg mx-auto">
          {items.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className="relative flex flex-col items-center gap-1 py-3 text-xs transition-all duration-200 group"
                  style={{ color: active ? "var(--green)" : "var(--muted)" }}
                >
                  {/* Active pill */}
                  {active && (
                    <span
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-green"
                      style={{ boxShadow: "0 0 8px rgba(34,197,94,0.8)" }}
                    />
                  )}
                  <span
                    className="transition-all duration-200"
                    style={{
                      transform: active ? "scale(1.15)" : "scale(1)",
                      filter: active ? "drop-shadow(0 0 6px rgba(34,197,94,0.6))" : "none",
                    }}
                  >
                    <Icon size={20} />
                  </span>
                  <span
                    className="font-medium transition-all duration-200"
                    style={{ fontSize: "10px", opacity: active ? 1 : 0.7 }}
                  >
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
