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
    <header className="public-nav px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      <Link href="/" className="flex items-center gap-2.5">
        <Image src="/logo-icon.png" alt="Soilify Labs" width={36} height={36} className="drop-shadow-sm" />
        <span className="text-base font-bold tracking-tight text-white drop-shadow-sm">Soilify Labs</span>
      </Link>

      <nav className="hidden sm:flex items-center gap-7 text-sm font-medium">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="transition-colors duration-200"
            style={{ color: pathname === href ? "#fff" : "rgba(255,255,255,0.65)" }}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <Link href="/contact" className="btn-hero-primary text-sm !min-h-0 py-2 px-4 hidden sm:flex">Pre-order</Link>
        <Link href="/login" className="btn-hero-secondary text-sm !min-h-0 py-2 px-4">Sign in</Link>
      </div>
    </header>
  );
}
