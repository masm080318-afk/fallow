import Link from "next/link";
import Image from "next/image";
import { Leaf, Cpu, Heart, Wifi, BarChart3, MessageSquare } from "lucide-react";
import PublicNav from "@/components/layout/PublicNav";
import PublicFooter from "@/components/layout/PublicFooter";

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col">

      {/* ── Hero ── */}
      <section className="relative min-h-[70vh] flex flex-col overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=85"
            alt="Golden hour wheat field"
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
        </div>

        <div className="relative z-10 flex flex-col flex-1">
          <PublicNav />

          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pb-20 pt-8">
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-4" style={{ color: "var(--green-bright)" }}>Our story</p>
            <h1 className="text-5xl sm:text-7xl font-black text-white leading-tight tracking-tight">
              About<br />Soilify Labs
            </h1>
            <p className="mt-5 text-lg text-white/65 max-w-md leading-relaxed">
              We&apos;re building affordable precision agriculture for the small farms that feed their communities.
            </p>
          </div>
        </div>
      </section>

      {/* ── Origin story ── */}
      <section className="dark-section px-6 py-24">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-16 items-start">
          <div>
            <div className="glass-card-dark inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-6">
              <Leaf size={14} style={{ color: "var(--green-bright)" }} />
              <span className="text-xs font-semibold text-white/70 uppercase tracking-widest">Where it started</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-6 leading-tight">
              The farmers who work hardest have the fewest tools.
            </h2>
            <p className="text-white/60 leading-relaxed mb-5">
              Large agricultural corporations can afford $10,000 soil monitoring systems.
              Small family farms — the ones growing food for their neighbors — are left guessing.
            </p>
            <p className="text-white/60 leading-relaxed">
              We asked: what if you could get the same real-time soil intelligence
              for $20 in hardware and a free app? Soilify Labs is the answer.
            </p>
          </div>

          <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=85"
              alt="Small farm operation"
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)" }} />
          </div>
        </div>
      </section>

      {/* ── What we build ── */}
      <section className="px-6 py-24 bg-white">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3 text-center" style={{ color: "var(--green)" }}>What we build</p>
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-4 tracking-tight">$20 hardware. Professional-grade intelligence.</h2>
          <p className="text-center max-w-xl mx-auto mb-14 leading-relaxed" style={{ color: "var(--muted)" }}>
            Our system pairs an ESP32 microcontroller with a capacitive soil sensor —
            both inexpensive, widely available, and easy to set up.
          </p>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon: Cpu,           title: "ESP32 sensor",         desc: "Pre-flashed Soilify firmware. Connects to your WiFi. Sends readings every 30 seconds automatically." },
              { icon: Wifi,          title: "Real-time dashboard",  desc: "Live moisture data visible from any device. 24h and 7d charts, CSV export, and multi-node support." },
              { icon: MessageSquare, title: "AI agronomist",        desc: "Claude-powered chat that combines soil readings with optional crop photos to diagnose exactly what your plants need." },
              { icon: BarChart3,     title: "ET0 irrigation math",  desc: "FAO-56 Penman-Monteith evapotranspiration — the same agronomic equation used by large commercial operations." },
              { icon: Leaf,          title: "SMS alerts",           desc: "Twilio-powered texts the moment your soil drops below threshold. No app required to get alerted." },
              { icon: Heart,         title: "No subscription",      desc: "Software is free forever. One-time hardware cost only. No hidden fees, no trial periods, no lock-in." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(92,158,42,0.1)" }}>
                  <Icon size={18} style={{ color: "var(--green)" }} />
                </div>
                <h3 className="font-bold text-sm">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section className="px-6 py-24" style={{ background: "var(--background)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "var(--green)" }}>Who we&apos;re for</p>
          <h2 className="text-3xl sm:text-4xl font-black mb-5 tracking-tight">Small farms, big decisions.</h2>
          <p className="max-w-xl mx-auto leading-relaxed mb-14" style={{ color: "var(--muted)" }}>
            If you manage land with your own hands and want to make smarter decisions
            without spending a fortune, Soilify Labs was built for you.
          </p>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { emoji: "🌱", title: "Family plots",       desc: "Feed your household and neighbors with data-driven watering decisions. No guesswork." },
              { emoji: "🌿", title: "Community gardens",  desc: "Manage shared land responsibly. Track moisture across multiple beds from one dashboard." },
              { emoji: "🌾", title: "Small commercial",   desc: "Under 50 acres and can't justify enterprise pricing? Same data quality, 500× cheaper." },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="card text-center">
                <div className="text-4xl mb-4">{emoji}</div>
                <h3 className="font-bold mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="dark-section px-6 py-24 text-center">
        <p className="text-xs font-bold tracking-[0.2em] uppercase mb-4" style={{ color: "var(--green-bright)" }}>Get started</p>
        <h2 className="text-3xl sm:text-4xl font-black text-white mb-5">Ready to grow smarter?</h2>
        <p className="text-white/55 mb-9 max-w-sm mx-auto">Pre-order your kit or learn more about the mission behind Soilify Labs.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact" className="btn-hero-primary px-9 py-4 text-base">Pre-order your kit</Link>
          <Link href="/mission" className="btn-hero-secondary px-9 py-4 text-base">Our mission →</Link>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
