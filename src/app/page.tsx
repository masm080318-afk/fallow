import Link from "next/link";
import Image from "next/image";
import { Droplets, Bell, Camera, LineChart, ChevronDown, Zap, Smartphone, Shield } from "lucide-react";
import PublicNav from "@/components/layout/PublicNav";
import PublicFooter from "@/components/layout/PublicFooter";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col min-h-screen">

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1800&q=90"
            alt="Farm rows at golden hour"
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/30 to-black/75" />
        </div>

        <div className="relative z-10 flex flex-col flex-1">
          <PublicNav />

          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pb-24">
            <div className="mb-6 inline-flex items-center gap-2 glass-card-dark rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--green-bright)" }} />
              <span className="text-white/85 text-xs font-semibold tracking-[0.2em] uppercase">Built for small farms</span>
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight mb-6 text-white leading-[1.04]">
              Your soil,<br />
              <span style={{ color: "var(--green-bright)" }}>smarter.</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/70 mb-10 max-w-lg mx-auto leading-relaxed">
              The same precision tools large farms pay $10,000+ for —
              delivered to your door for <strong className="text-white">$20</strong>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn-hero-primary text-base px-9 py-4">Pre-order your kit</Link>
              <Link href="/mission" className="btn-hero-secondary text-base px-9 py-4">Our mission →</Link>
            </div>

            <p className="text-xs mt-6 text-white/35 tracking-wide">
              Free software · $20 sensor hardware · Ships to your door
            </p>
          </div>

          <div className="relative z-10 flex justify-center pb-8 animate-bounce">
            <ChevronDown size={24} className="text-white/30" />
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="bg-white border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 divide-x divide-[var(--border)]">
          {[
            { value: "$20",    label: "One-time hardware" },
            { value: "30s",    label: "Sensor read interval" },
            { value: "Free",   label: "Software, always" },
            { value: "5 min",  label: "To first reading" },
          ].map(({ value, label }) => (
            <div key={label} className="py-8 px-6 text-center">
              <p className="text-3xl font-black text-gradient">{value}</p>
              <p className="text-xs mt-1.5 leading-tight" style={{ color: "var(--muted)" }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Problem ── */}
      <section className="dark-section px-6 py-28">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-14 items-center">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-4" style={{ color: "var(--green-bright)" }}>The problem</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 leading-tight">
              Small farms water<br />by guesswork.
            </h2>
            <p className="text-white/60 leading-relaxed mb-4">
              Large agricultural operations run FAO-56 Penman-Monteith evapotranspiration models
              on $10,000+ systems. Small family farms check soil by feel, waste water,
              and lose crops to stress they never saw coming.
            </p>
            <p className="text-white/85 font-semibold leading-relaxed">
              Soilify Labs delivers the same decision quality for $20.
            </p>
            <Link href="/mission" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--green-bright)" }}>
              Read our mission →
            </Link>
          </div>

          <div className="relative h-80 sm:h-[440px] rounded-2xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=900&q=85"
              alt="Farmer working the land"
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)" }} />
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="px-6 py-28 bg-white">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "var(--green)" }}>How it works</p>
          <h2 className="text-center text-4xl font-black mb-16 tracking-tight">Up and running in minutes</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { n: "01", icon: Zap,        title: "Plug in your sensor",    desc: "Stake the ESP32 kit into your soil. It connects to your Wi-Fi automatically — no soldering, no config files." },
              { n: "02", icon: Smartphone, title: "Open the dashboard",     desc: "Live moisture readings stream in every 30 seconds. View from any device. Share access with your whole team." },
              { n: "03", icon: Shield,     title: "Never miss a stress event", desc: "Set your moisture threshold. The moment soil drops below it, you get a text. React before your crops feel it." },
            ].map(({ n, icon: Icon, title, desc }) => (
              <div key={n} className="card relative overflow-hidden">
                <span className="absolute top-3 right-4 text-7xl font-black leading-none select-none" style={{ color: "var(--border)", opacity: 0.8 }}>{n}</span>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: "rgba(92,158,42,0.1)" }}>
                  <Icon size={22} style={{ color: "var(--green)" }} />
                </div>
                <h3 className="font-bold text-base mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features bento — glass over photo ── */}
      <section className="relative py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=85"
            alt="Golden hour wheat field"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/80" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "var(--green-bright)" }}>What you get</p>
          <h2 className="text-center text-4xl font-black text-white mb-14">Everything your crops need</h2>

          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { icon: Droplets,  title: "Live soil moisture",  desc: "Your ESP32 sensor sends readings every 30 seconds. Watch moisture change in real time from anywhere — field, office, or phone." },
              { icon: Bell,      title: "SMS alerts",          desc: "Get a text the moment soil drops below your threshold. React before your crops feel the stress. No app required." },
              { icon: Camera,    title: "AI crop analysis",    desc: "Photo of your plants + soil data = precise diagnosis from Claude. Like having an agronomist available 24/7." },
              { icon: LineChart, title: "24-hour charts",      desc: "See how moisture trends across the day, week, and month. Know exactly when your irrigation schedule is working." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass-card-dark p-6 flex gap-4 items-start">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(125,212,79,0.15)" }}>
                  <Icon size={20} style={{ color: "var(--green-bright)" }} />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1.5">{title}</h3>
                  <p className="text-sm leading-relaxed text-white/60">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden py-32 px-6 text-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1400&q=80"
            alt="Rich soil"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0" style={{ background: "rgba(10,20,8,0.88)" }} />
        </div>
        <div className="relative z-10 max-w-xl mx-auto">
          <p className="text-xs font-bold tracking-[0.2em] uppercase mb-4" style={{ color: "var(--green-bright)" }}>Join the waitlist</p>
          <h2 className="text-4xl sm:text-6xl font-black text-white mb-5 leading-tight">
            Ready to know<br />your soil?
          </h2>
          <p className="text-white/55 mb-10 text-base leading-relaxed max-w-sm mx-auto">
            Join small farm families already on our waitlist.
            Hardware ships for $20. Software is free forever.
          </p>
          <Link href="/contact" className="btn-hero-primary text-base px-12 py-4">
            Pre-order your kit →
          </Link>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
