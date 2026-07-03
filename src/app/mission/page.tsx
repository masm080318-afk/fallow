import Link from "next/link";
import { Droplets, Users, TrendingUp } from "lucide-react";
import PublicNav from "@/components/layout/PublicNav";
import PublicFooter from "@/components/layout/PublicFooter";

export default function MissionPage() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: "var(--paper)" }}>
      <PublicNav />

      {/* ── Hero — statement ── */}
      <section className="px-6 py-28" style={{ background: "var(--ink)" }}>
        <div className="max-w-4xl mx-auto">
          <p className="section-label mb-8" style={{ color: "rgba(255,255,255,0.5)" }}>Our mission</p>
          <blockquote>
            <p className="font-display text-3xl sm:text-5xl text-white leading-[1.1] mb-6">
              Agriculture feeds the world.{" "}
              <span style={{ color: "var(--accent)" }}>Small farms feed their communities.</span>{" "}
              They deserve better tools.
            </p>
          </blockquote>
          <p className="max-w-md text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            We believe technology should reduce inequality in farming — not increase it.
          </p>
        </div>
      </section>

      {/* ── The gap ── */}
      <section className="px-6 py-24" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto">
          <p className="section-label mb-14" style={{ color: "var(--accent)" }}>The problem we&apos;re solving</p>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { stat: "$10,000+", desc: "Cost of commercial precision irrigation systems used by large farms", accent: false },
              { stat: "~90%",     desc: "Of US farms are small family operations — most without any soil monitoring", accent: false },
              { stat: "$20",      desc: "Soilify Labs sensor kit — same intelligence, 500× cheaper", accent: true },
            ].map(({ stat, desc, accent }) => (
              <div
                key={stat}
                className="p-8"
                style={{
                  borderRadius: 16,
                  background: accent ? "var(--accent)" : "var(--surface)",
                  border: accent ? "none" : "1px solid var(--border)",
                }}
              >
                <p className="font-display text-5xl mb-3" style={{ color: accent ? "#fff" : "var(--accent)" }}>{stat}</p>
                <p className="text-sm leading-relaxed" style={{ color: accent ? "rgba(255,255,255,0.85)" : "var(--ink-soft)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Three pillars ── */}
      <section className="px-6 py-24" style={{ background: "var(--paper)" }}>
        <div className="max-w-5xl mx-auto">
          <p className="section-label mb-2" style={{ color: "var(--accent)" }}>What we stand for</p>
          <h2 className="font-display text-3xl sm:text-4xl mb-14" style={{ color: "var(--ink)" }}>Three pillars</h2>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: Droplets,   title: "Affordability", desc: "Our sensor kits use off-the-shelf ESP32 hardware that costs around $20. The software is free. Precision agriculture shouldn't require a loan." },
              { icon: Users,      title: "Accessibility", desc: "Set up in one afternoon with no engineering background. If you can follow a recipe, you can set up Soilify Labs." },
              { icon: TrendingUp, title: "Impact",        desc: "Better watering decisions mean less water wasted, healthier crops, and more food from the same land — for the farmer and their community." },
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

      {/* ── Mission statement long-form ── */}
      <section className="px-6 py-24" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
        <div className="max-w-2xl mx-auto">
          <p className="section-label mb-6" style={{ color: "var(--accent)" }}>In our own words</p>
          <h2 className="font-display text-3xl mb-8 leading-tight" style={{ color: "var(--ink)" }}>
            We want every small farm to have access to the same data that commercial operations take for granted.
          </h2>
          <div className="space-y-5 leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            <p>
              The FAO-56 Penman-Monteith equation — the gold standard for irrigation scheduling —
              has been freely available for decades. The problem was never the science.
              It was the $10,000 sensor networks required to gather the data it needs.
            </p>
            <p>
              Soilify Labs changes that. Our ESP32-based kit costs $20 and collects real-time
              soil moisture, which we combine with open weather APIs to compute daily
              evapotranspiration estimates directly in your dashboard.
            </p>
            <p>
              The software is free forever. Not free with a catch — just free. We make our
              money on the hardware. We believe the data, the AI, and the intelligence
              belong to the farmer.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-24" style={{ background: "var(--accent)" }}>
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl text-white mb-4 leading-tight">Be among the first.</h2>
            <p className="leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
              Pre-order a kit and join the small farm families already using Soilify Labs.
            </p>
          </div>
          <div className="sm:justify-self-end">
            <Link href="/contact" className="btn-hero-primary text-base">Pre-order your kit</Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
