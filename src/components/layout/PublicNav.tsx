"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const links = [
  { href: "/about",   label: "About" },
  { href: "/mission", label: "Mission" },
  { href: "/contact", label: "Contact" },
];

export default function PublicNav() {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between"
      style={{ background: "var(--paper)", borderBottom: "1px solid var(--border)" }}
    >
      <Link href="/" className="flex items-center gap-2">
        <Image src="/logo-icon.png" alt="Soilify Labs" width={32} height={32} />
        <span className="font-display text-base" style={{ color: "var(--ink)" }}>Soilify Labs</span>
      </Link>

      <nav className="hidden sm:flex items-center gap-8 text-sm font-medium">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="transition-colors"
            style={{ color: pathname === href ? "var(--ink)" : "var(--ink-soft)" }}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <Link href="/contact" className="btn-primary text-sm !min-h-0 !py-2 !px-4 hidden sm:flex">Pre-order</Link>
        <Link href="/login" className="btn-secondary text-sm !min-h-0 !py-2 !px-4">Sign in</Link>
      </div>
    </header>
  );
}
