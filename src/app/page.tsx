import Link from "next/link";
import Image from "next/image";
import { Droplets, Bell, Camera, LineChart, Zap, Smartphone, Shield } from "lucide-react";
import PublicNav from "@/components/layout/PublicNav";
import PublicFooter from "@/components/layout/PublicFooter";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col min-h-screen" style={{ background: "var(--paper)" }}>
      <PublicNav />

      {/* ── Hero ── */}
      <section className="px-6 pt-16 pb-24 sm:pt-24 sm:pb-32">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="section-label mb-4" style={{ color: "var(--accent)" }}>Built for small farms</p>
            <h1 className="font-display text-5xl sm:text-6xl leading-[1.05] mb-6" style={{ color: "var(--ink)" }}>
              Your soil,<br />
              <em style={{ color: "var(--accent)" }}>smarter.</em>
            </h1>
            <p className="text-lg leading-relaxed mb-8 max-w-md" style={{ color: "var(--ink-soft)" }}>
              The same precision tools large farms pay $10,000+ for —
              delivered to your door for <strong style={{ color: "var(--ink)" }}>$20</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact" className="btn-primary text-base">Pre-order your kit</Link>
              <Link href="/mission" className="btn-secondary text-base">Our mission</Link>
            </div>
            <p className="text-xs mt-6" style={{ color: "var(--ink-soft)" }}>
              Free software · $20 sensor hardware · Ships to your door
            </p>
          </div>

          <div className="relative h-80 lg:h-[480px] rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <Image
              src="https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1200&q=85"
              alt="Farm rows at golden hour"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4">
          {[
            { value: "$20",   label: "One-time hardware" },
            { value: "15 min", label: "Sensor read interval" },
            { value: "Free",  label: "Software, always" },
            { value: "5 min", label: "To first reading" },
          ].map(({ value, label }, i) => (
            <div key={label} className="py-8 px-6" style={i > 0 ? { borderLeft: "1px solid var(--border)" } : undefined}>
              <p className="font-display text-3xl" style={{ color: "var(--accent)" }}>{value}</p>
              <p className="text-xs mt-2 leading-tight" style={{ color: "var(--ink-soft)" }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Problem ── */}
      <section className="px-6 py-24" style={{ background: "var(--ink)" }}>
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-16 items-center">
          <div>
            <p className="section-label mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>The problem</p>
            <h2 className="font-display text-4xl sm:text-5xl text-white mb-6 leading-tight">
              Small farms water by guesswork.
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.6)" }}>
              Large agricultural operations run FAO-56 Penman-Monteith evapotranspiration models
              on $10,000+ systems. Small family farms check soil by feel, waste water,
              and lose crops to stress they never saw coming.
            </p>
            <p className="font-semibold leading-relaxed text-white">
              Soilify Labs delivers the same decision quality for $20.
            </p>
            <Link
              href="/mission"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white underline underline-offset-4 hover:no-underline"
            >
              Read our mission
            </Link>
          </div>

          <div className="relative h-80 sm:h-[440px] rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.15)" }}>
            <Image
              src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=900&q=85"
              alt="Farmer working the land"
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="px-6 py-24" style={{ background: "var(--surface)" }}>
        <div className="max-w-5xl mx-auto">
          <p className="section-label mb-2" style={{ color: "var(--accent)" }}>How it works</p>
          <h2 className="font-display text-4xl mb-16" style={{ color: "var(--ink)" }}>Up and running in minutes</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { n: "01", icon: Zap,        title: "Plug in your sensor",       desc: "Stake the sensor kit into your soil and plug in the gateway. Pair it from your phone — no soldering, no config files." },
              { n: "02", icon: Smartphone, title: "Open the dashboard",        desc: "Live moisture readings stream in every 15 minutes. View from any device. Share access with your whole family." },
              { n: "03", icon: Shield,     title: "Never miss a stress event", desc: "Set your moisture threshold. The moment soil drops below it, you get a text. React before your crops feel it." },
            ].map(({ n, icon: Icon, title, desc }) => (
              <div key={n} className="pt-6" style={{ borderTop: "2px solid var(--ink)" }}>
                <div className="flex items-center justify-between mb-6">
                  <div className="icon-chip"><Icon size={16} /></div>
                  <span className="font-display text-sm" style={{ color: "var(--ink-soft)" }}>{n}</span>
                </div>
                <h3 className="font-display text-lg mb-2" style={{ color: "var(--ink)" }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What you get ── */}
      <section className="px-6 py-24" style={{ background: "var(--paper)", borderTop: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto">
          <p className="section-label mb-2" style={{ color: "var(--accent)" }}>What you get</p>
          <h2 className="font-display text-4xl mb-16" style={{ color: "var(--ink)" }}>Everything your crops need</h2>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: Droplets,  title: "Live soil moisture",  desc: "Your field sensor reports every 15 minutes. Watch moisture change in real time from anywhere — field, office, or phone." },
              { icon: Bell,      title: "SMS alerts",          desc: "Get a text the moment soil drops below your threshold. React before your crops feel the stress. No app required." },
              { icon: Camera,    title: "AI crop analysis",    desc: "Photo of your plants + soil data = precise diagnosis from AI. Like having an agronomist available around the clock." },
              { icon: LineChart, title: "Trend charts",        desc: "See how moisture trends across the day, week, and month. Know exactly when your irrigation schedule is working." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card flex gap-4 items-start">
                <div className="icon-chip"><Icon size={16} /></div>
                <div>
                  <h3 className="font-display text-lg mb-2" style={{ color: "var(--ink)" }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-24" style={{ background: "var(--accent)" }}>
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-display text-4xl sm:text-5xl text-white leading-tight mb-4">
              Ready to know your soil?
            </h2>
            <p className="leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
              Join small farm families already on our waitlist.
              Hardware ships for $20. Software is free forever.
            </p>
          </div>
          <div className="sm:justify-self-end">
            <Link href="/contact" className="btn-hero-primary text-base">
              Pre-order your kit
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
