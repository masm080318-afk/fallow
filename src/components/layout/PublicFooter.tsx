import Link from "next/link";
import Image from "next/image";

export default function PublicFooter() {
  return (
    <footer className="px-6 py-8" style={{ background: "var(--ink)" }}>
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo-icon.png" alt="" width={24} height={24} />
          <span className="font-display text-sm text-white">Soilify Labs</span>
        </Link>
        <div className="flex gap-8 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
          <Link href="/about"   className="hover:text-white transition-colors">About</Link>
          <Link href="/mission" className="hover:text-white transition-colors">Mission</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/login"   className="hover:text-white transition-colors">Sign in</Link>
        </div>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>© 2026 Soilify Labs</p>
      </div>
    </footer>
  );
}
