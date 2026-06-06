import Link from "next/link";
import Image from "next/image";
import { Droplets, LineChart, Bell, Camera } from "lucide-react";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col min-h-screen">
      {/* Nav */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-[var(--border)] bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo-icon.png" alt="Soilify Labs" width={36} height={36} />
          <span className="text-base font-bold tracking-tight text-gradient">Soilify Labs</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium" style={{ color: "var(--muted)" }}>
          <Link href="/about" className="hover:text-[var(--green)] transition-colors">About</Link>
          <Link href="/mission" className="hover:text-[var(--green)] transition-colors">Our Mission</Link>
          <Link href="/contact" className="hover:text-[var(--green)] transition-colors">Contact</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/contact" className="btn-primary text-sm !min-h-0 py-2 px-4 hidden sm:flex">Pre-order</Link>
          <Link href="/login" className="btn-secondary text-sm !min-h-0 py-2 px-4">Sign in</Link>
        </div>
      </header>

      {/* Mobile nav */}
      <div className="sm:hidden flex items-center justify-center gap-6 py-3 border-b border-[var(--border)] bg-white text-xs font-medium" style={{ color: "var(--muted)" }}>
        <Link href="/about" className="hover:text-[var(--green)] transition-colors">About</Link>
        <Link href="/mission" className="hover:text-[var(--green)] transition-colors">Mission</Link>
        <Link href="/contact" className="hover:text-[var(--green)] transition-colors">Contact</Link>
      </div>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-28 bg-white">
        <div className="mb-8 animate-float">
          <Image src="/logo.png" alt="Soilify Labs" width={200} height={200} className="mx-auto" />
        </div>
        <p className="text-xs font-bold tracking-[0.2em] uppercase mb-4" style={{ color: "var(--green)" }}>
          Built for small farms
        </p>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-5 max-w-2xl leading-tight">
          Your soil, smarter.<br />
          <span className="text-gradient">Starting at $20.</span>
        </h1>
        <p className="text-base mb-10 max-w-md leading-relaxed" style={{ color: "var(--muted)" }}>
          Soilify Labs gives small farm families the same precision tools
          as large agricultural operations — without the enterprise price tag.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/contact" className="btn-primary text-base px-8 py-3.5">Pre-order your kit</Link>
          <Link href="/mission" className="btn-secondary text-base px-8 py-3.5">Our mission →</Link>
        </div>
        <p className="text-xs mt-4" style={{ color: "var(--muted)" }}>Free software · $20 sensor hardware · Ships to your door</p>
      </section>

      {/* Problem → Solution */}
      <section className="px-6 py-20" style={{ background: "var(--background)" }}>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "var(--green)" }}>The problem</p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Small farms water by guesswork</h2>
          <p className="leading-relaxed" style={{ color: "var(--muted)" }}>
            Large farms use $10,000+ precision irrigation systems. Small farm families check soil by feel,
            waste water, and sometimes lose crops to moisture stress they never saw coming.
            Soilify Labs changes that.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold tracking-widest uppercase mb-12" style={{ color: "var(--green)" }}>What you get</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { icon: Droplets,  title: "Live soil moisture",  desc: "Your ESP32 sensor sends readings every 30 seconds. Watch your moisture change in real time from anywhere." },
              { icon: Bell,      title: "SMS alerts",          desc: "Get a text the moment your soil drops below your threshold. React before your crops feel the stress." },
              { icon: Camera,    title: "AI crop analysis",    desc: "Take a photo of your plants. Our AI combines the image with your soil data for a precise diagnosis." },
              { icon: LineChart, title: "24-hour charts",      desc: "See how moisture trends across the day. Know when your irrigation schedule is working — or when it's not." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(92,158,42,0.1)" }}>
                  <Icon size={18} style={{ color: "var(--green)" }} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center px-6 border-t border-[var(--border)]" style={{ background: "var(--background)" }}>
        <h2 className="text-2xl font-bold mb-3">Ready to know your soil?</h2>
        <p className="text-sm mb-7" style={{ color: "var(--muted)" }}>Join small farm families already on our waitlist.</p>
        <Link href="/contact" className="btn-primary px-8 py-3.5">Pre-order your kit</Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] px-6 py-6 bg-white">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo-icon.png" alt="" width={24} height={24} />
            <span className="text-sm font-semibold text-gradient">Soilify Labs</span>
          </div>
          <div className="flex gap-6 text-xs" style={{ color: "var(--muted)" }}>
            <Link href="/about" className="hover:text-[var(--green)] transition-colors">About</Link>
            <Link href="/mission" className="hover:text-[var(--green)] transition-colors">Mission</Link>
            <Link href="/contact" className="hover:text-[var(--green)] transition-colors">Contact</Link>
            <Link href="/login" className="hover:text-[var(--green)] transition-colors">Sign in</Link>
          </div>
          <p className="text-xs" style={{ color: "var(--muted)" }}>© 2025 Soilify Labs</p>
        </div>
      </footer>
    </main>
  );
}
