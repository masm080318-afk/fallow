import Link from "next/link";
import Image from "next/image";

export default function PublicFooter() {
  return (
    <footer className="border-t border-white/10 px-6 py-8" style={{ background: "#0d1a0a" }}>
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo-icon.png" alt="" width={24} height={24} />
          <span className="text-sm font-bold text-white/80">Soilify Labs</span>
        </Link>
        <div className="flex gap-7 text-xs text-white/40">
          <Link href="/about"   className="hover:text-white/70 transition-colors">About</Link>
          <Link href="/mission" className="hover:text-white/70 transition-colors">Mission</Link>
          <Link href="/contact" className="hover:text-white/70 transition-colors">Contact</Link>
          <Link href="/login"   className="hover:text-white/70 transition-colors">Sign in</Link>
        </div>
        <p className="text-xs text-white/30">© 2025 Soilify Labs</p>
      </div>
    </footer>
  );
}
