import Link from "next/link";
import Image from "next/image";
import { Leaf, Cpu, Heart, Wifi, BarChart3, MessageSquare, Sprout, TreeDeciduous, Wheat } from "lucide-react";
import PublicNav from "@/components/layout/PublicNav";
import PublicFooter from "@/components/layout/PublicFooter";

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: "var(--paper)" }}>
      <PublicNav />

      {/* ── Hero ── */}
      <section className="px-6 py-24" style={{ background: "var(--ink)" }}>
        <div className="max-w-5xl mx-auto">
          <p className="section-label mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>Our story</p>
          <h1 className="font-display text-5xl sm:text-6xl text-white leading-[1.05] max-w-2xl">
            Affordable precision agriculture for the farms that feed their communities.
          </h1>
        </div>
      </section>

      {/* ── Origin story ── */}
      <section className="px-6 py-24" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-16 items-center">
          <div>
            <p className="section-label mb-4" style={{ color: "var(--accent)" }}>Where it started</p>
            <h2 className="font-display text-3xl sm:text-4xl mb-6 leading-tight" style={{ color: "var(--ink)" }}>
              The farmers who work hardest have the fewest tools.
            </h2>
            <p className="leading-relaxed mb-5" style={{ color: "var(--ink-soft)" }}>
              Large agricultural corporations can afford $10,000 soil monitoring systems.
              Small family farms — the ones growing food for their neighbors — are left guessing.
            </p>
            <p className="leading-relaxed" style={{ color: "var(--ink-soft)" }}>
              We asked: what if you could get the same real-time soil intelligence
              for $20 in hardware and a free app? Soilify Labs is the answer.
            </p>
          </div>

          <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <Image
              src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=85"
              alt="Small farm operation"
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── What we build ── */}
      <section className="px-6 py-24" style={{ background: "var(--paper)" }}>
        <div className="max-w-5xl mx-auto">
          <p className="section-label mb-2" style={{ color: "var(--accent)" }}>What we build</p>
          <h2 className="font-display text-3xl sm:text-4xl mb-4" style={{ color: "var(--ink)" }}>$20 hardware. Professional-grade intelligence.</h2>
          <p className="max-w-xl mb-14 leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            Our system pairs an ESP32 microcontroller with a capacitive soil sensor —
            both inexpensive, widely available, and easy to set up.
          </p>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: Cpu,           title: "ESP32 sensor",         desc: "Pre-flashed Soilify firmware. Pairs with your gateway. Sends readings every 15 minutes automatically." },
              { icon: Wifi,          title: "Real-time dashboard",  desc: "Live moisture data visible from any device. 24h and 7d charts, CSV export, and multi-node support." },
              { icon: MessageSquare, title: "AI agronomist",        desc: "AI-powered chat that combines soil readings with optional crop photos to diagnose exactly what your plants need." },
              { icon: BarChart3,     title: "ET₀ irrigation math",  desc: "FAO-56 Penman-Monteith evapotranspiration — the same agronomic equation used by large commercial operations." },
              { icon: Leaf,          title: "SMS alerts",           desc: "Texts the moment your soil drops below threshold. No app required to get alerted." },
              { icon: Heart,         title: "No subscription",      desc: "Software is free forever. One-time hardware cost only. No hidden fees, no trial periods, no lock-in." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card flex flex-col gap-3">
                <div className="icon-chip"><Icon size={16} /></div>
                <h3 className="font-display text-lg" style={{ color: "var(--ink)" }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section className="px-6 py-24" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto">
          <p className="section-label mb-2" style={{ color: "var(--accent)" }}>Who we&apos;re for</p>
          <h2 className="font-display text-3xl sm:text-4xl mb-4" style={{ color: "var(--ink)" }}>Small farms, big decisions.</h2>
          <p className="max-w-xl leading-relaxed mb-14" style={{ color: "var(--ink-soft)" }}>
            If you manage land with your own hands and want to make smarter decisions
            without spending a fortune, Soilify Labs was built for you.
          </p>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: Sprout,        title: "Family plots",      desc: "Feed your household and neighbors with data-driven watering decisions. No guesswork." },
              { icon: TreeDeciduous, title: "Community gardens", desc: "Manage shared land responsibly. Track moisture across multiple beds from one dashboard." },
              { icon: Wheat,         title: "Small commercial",  desc: "Under 50 acres and can't justify enterprise pricing? Same data quality, 500× cheaper." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card flex flex-col gap-3">
                <div className="icon-chip"><Icon size={16} /></div>
                <h3 className="font-display text-lg" style={{ color: "var(--ink)" }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-24" style={{ background: "var(--accent)" }}>
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl text-white mb-4 leading-tight">Ready to grow smarter?</h2>
            <p className="leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
              Pre-order your kit or learn more about the mission behind Soilify Labs.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:justify-self-end">
            <Link href="/contact" className="btn-hero-primary text-base">Pre-order your kit</Link>
            <Link href="/mission" className="btn-hero-secondary text-base">Our mission</Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
