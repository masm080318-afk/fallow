import Link from "next/link";
import Image from "next/image";
import { Droplets, Users, TrendingUp } from "lucide-react";
import PublicNav from "@/components/layout/PublicNav";
import PublicFooter from "@/components/layout/PublicFooter";

export default function MissionPage() {
  return (
    <main className="min-h-screen flex flex-col">

      {/* ── Hero — dramatic quote ── */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1800&q=85"
            alt="Farm rows"
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/85" />
        </div>

        <div className="relative z-10 flex flex-col flex-1">
          <PublicNav />

          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pb-20">
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-8" style={{ color: "var(--green-bright)" }}>Our mission</p>
            <blockquote className="max-w-3xl">
              <p className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.08] mb-6">
                &ldquo;Agriculture feeds the world.{" "}
                <span style={{ color: "var(--green-bright)" }}>Small farms feed their communities.</span>{" "}
                They deserve better tools.&rdquo;
              </p>
            </blockquote>
            <p className="text-white/55 max-w-md text-base leading-relaxed mt-4">
              We believe technology should reduce inequality in farming — not increase it.
            </p>
          </div>
        </div>
      </section>

      {/* ── The gap ── */}
      <section className="dark-section px-6 py-28">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold tracking-[0.2em] uppercase mb-14" style={{ color: "var(--green-bright)" }}>The problem we&apos;re solving</p>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="glass-card-dark p-8 text-center">
              <p className="text-5xl sm:text-6xl font-black mb-3" style={{ color: "var(--green-bright)" }}>$10,000+</p>
              <p className="text-white/55 text-sm leading-relaxed">Cost of commercial precision irrigation systems used by large farms</p>
            </div>
            <div className="glass-card-dark p-8 text-center">
              <p className="text-5xl sm:text-6xl font-black text-white mb-3">~90%</p>
              <p className="text-white/55 text-sm leading-relaxed">Of US farms are small family operations — most without any soil monitoring</p>
            </div>
            <div className="glass-card-dark p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 rounded-xl" style={{ background: "rgba(92,158,42,0.08)", border: "1px solid rgba(125,212,79,0.25)" }} />
              <p className="relative text-5xl sm:text-6xl font-black mb-3" style={{ color: "var(--green-bright)" }}>$20</p>
              <p className="relative text-white/70 text-sm font-semibold leading-relaxed">Soilify Labs sensor kit — same intelligence, 500× cheaper</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Three pillars — over farm photo ── */}
      <section className="relative py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&q=80"
            alt="Corn crop rows"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/60 to-black/80" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "var(--green-bright)" }}>What we stand for</p>
          <h2 className="text-center text-4xl font-black text-white mb-14">Three pillars</h2>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                icon: Droplets,
                title: "Affordability",
                desc: "Our sensor kits use off-the-shelf ESP32 hardware that costs around $20. The software is free. Precision agriculture shouldn't require a loan.",
              },
              {
                icon: Users,
                title: "Accessibility",
                desc: "Set up in one afternoon with no engineering background. If you can follow a recipe, you can set up Soilify Labs.",
              },
              {
                icon: TrendingUp,
                title: "Impact",
                desc: "Better watering decisions mean less water wasted, healthier crops, and more food from the same land — for the farmer and their community.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass-card-dark p-7 text-center flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(125,212,79,0.15)" }}>
                  <Icon size={22} style={{ color: "var(--green-bright)" }} />
                </div>
                <h3 className="font-bold text-white text-lg">{title}</h3>
                <p className="text-sm leading-relaxed text-white/60">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission statement long-form ── */}
      <section className="px-6 py-24 bg-white">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold tracking-[0.2em] uppercase mb-6" style={{ color: "var(--green)" }}>In our own words</p>
          <h2 className="text-3xl font-black mb-8 leading-tight">We want every small farm to have access to the same data that commercial operations take for granted.</h2>
          <div className="space-y-5 leading-relaxed" style={{ color: "var(--muted)" }}>
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
      <section className="dark-section px-6 py-24 text-center">
        <p className="text-xs font-bold tracking-[0.2em] uppercase mb-4" style={{ color: "var(--green-bright)" }}>Join us</p>
        <h2 className="text-3xl sm:text-4xl font-black text-white mb-5">Be among the first.</h2>
        <p className="text-white/55 mb-9 max-w-sm mx-auto">Pre-order a kit and join the small farm families already using Soilify Labs.</p>
        <Link href="/contact" className="btn-hero-primary px-12 py-4 text-base">Pre-order your kit</Link>
      </section>

      <PublicFooter />
    </main>
  );
}
