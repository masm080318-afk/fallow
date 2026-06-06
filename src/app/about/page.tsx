import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Leaf, Cpu, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-[var(--border)] bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo-icon.png" alt="Soilify Labs" width={36} height={36} />
          <span className="text-base font-bold tracking-tight text-gradient">Soilify Labs</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium" style={{ color: "var(--muted)" }}>
          <Link href="/about" className="text-[var(--green)] font-semibold">About</Link>
          <Link href="/mission" className="hover:text-[var(--green)] transition-colors">Our Mission</Link>
          <Link href="/contact" className="hover:text-[var(--green)] transition-colors">Contact</Link>
        </nav>
        <Link href="/contact" className="btn-primary text-sm !min-h-0 py-2 px-4">Pre-order</Link>
      </header>

      {/* Hero */}
      <section className="bg-white px-6 py-20 text-center border-b border-[var(--border)]">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm mb-8 hover:text-[var(--green)] transition-colors" style={{ color: "var(--muted)" }}>
          <ArrowLeft size={14} /> Back to home
        </Link>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5">
          About <span className="text-gradient">Soilify Labs</span>
        </h1>
        <p className="text-lg max-w-xl mx-auto leading-relaxed" style={{ color: "var(--muted)" }}>
          We&apos;re a team building affordable precision agriculture tools
          for the small farms that feed their communities.
        </p>
      </section>

      {/* Story */}
      <section className="px-6 py-20 max-w-2xl mx-auto w-full">
        <div className="space-y-10">
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(92,158,42,0.1)" }}>
                <Leaf size={18} style={{ color: "var(--green)" }} />
              </div>
              <h2 className="text-xl font-bold">Where it started</h2>
            </div>
            <p className="leading-relaxed" style={{ color: "var(--muted)" }}>
              Soilify Labs was born from a simple frustration: the farmers who work the hardest
              have the fewest tools. Large agricultural corporations can afford $10,000
              soil monitoring systems. Small family farms — the ones growing food for their
              neighbors — are left guessing.
            </p>
            <p className="leading-relaxed mt-4" style={{ color: "var(--muted)" }}>
              We asked: what if you could get the same real-time soil intelligence
              for $20 in hardware and a free app?
            </p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(92,158,42,0.1)" }}>
                <Cpu size={18} style={{ color: "var(--green)" }} />
              </div>
              <h2 className="text-xl font-bold">What we build</h2>
            </div>
            <p className="leading-relaxed" style={{ color: "var(--muted)" }}>
              Our system pairs an ESP32 microcontroller with a capacitive soil moisture
              sensor — both inexpensive, widely available, and easy to set up. The sensor
              connects to your WiFi and streams data to the Soilify Labs app every 30 seconds.
            </p>
            <p className="leading-relaxed mt-4" style={{ color: "var(--muted)" }}>
              Layered on top is AI-powered diagnosis using Claude — combining soil readings
              with optional crop photos to give farmers advice that&apos;s as good as having
              an agronomist on call.
            </p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(92,158,42,0.1)" }}>
                <Heart size={18} style={{ color: "var(--green)" }} />
              </div>
              <h2 className="text-xl font-bold">Who we&apos;re for</h2>
            </div>
            <p className="leading-relaxed" style={{ color: "var(--muted)" }}>
              We build for small farms — family plots, community gardens, hobby farms,
              and small commercial growers. If you&apos;re managing land with your own hands
              and want to make smarter decisions without spending a fortune, Soilify Labs
              is made for you.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center border-t border-[var(--border)] bg-white">
        <h2 className="text-2xl font-bold mb-3">Want to learn more?</h2>
        <p className="text-sm mb-7" style={{ color: "var(--muted)" }}>Read about our mission or get in touch to pre-order your kit.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/mission" className="btn-primary px-6 py-3">Our mission →</Link>
          <Link href="/contact" className="btn-secondary px-6 py-3">Pre-order</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] px-6 py-5 bg-white text-center">
        <p className="text-xs" style={{ color: "var(--muted)" }}>© 2025 Soilify Labs · Where Agriculture Meets Innovation</p>
      </footer>
    </main>
  );
}
