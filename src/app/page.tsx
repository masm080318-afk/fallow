import Link from "next/link";
import Image from "next/image";
import { Droplets, LineChart, Bell, Camera, Cpu } from "lucide-react";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col min-h-screen">
      {/* Nav */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Soilify Labs" width={36} height={36} className="rounded-lg" />
          <div>
            <span className="text-lg font-bold tracking-tight text-gradient">Soilify Labs</span>
          </div>
        </div>
        <Link href="/login" className="btn-secondary text-sm !min-h-0 py-2 px-4">
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="mb-8 animate-float">
          <Image src="/logo.png" alt="Soilify Labs" width={96} height={96} className="mx-auto rounded-2xl shadow-lg" style={{ boxShadow: "0 0 40px rgba(92,158,42,0.2)" }} />
        </div>

        <p className="text-xs font-semibold tracking-[0.2em] text-[var(--green)] uppercase mb-4">
          Where Agriculture Meets Innovation
        </p>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-5 max-w-2xl leading-tight">
          Smart soil monitoring<br />
          <span className="text-gradient">for every farm</span>
        </h1>

        <p className="text-base text-[var(--muted)] mb-10 max-w-lg leading-relaxed">
          Turn a $20 sensor into a connected field assistant. Real-time moisture data,
          AI-powered crop analysis, and SMS alerts — all in one place.
        </p>

        <Link href="/login" className="btn-primary text-base px-8 py-3.5">
          Get started free
        </Link>

        <p className="text-xs text-[var(--muted)] mt-4">No credit card required</p>
      </section>

      {/* Features */}
      <section className="px-6 pb-20 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: Droplets,
              title: "Live moisture",
              desc: "Sub-second updates streamed directly from your ESP32 sensor in the field.",
            },
            {
              icon: LineChart,
              title: "AI diagnosis",
              desc: "Claude analyzes soil readings and crop photos to give precise watering advice.",
            },
            {
              icon: Bell,
              title: "SMS alerts",
              desc: "Get a text the moment your soil drops below your threshold — not after.",
            },
            {
              icon: Camera,
              title: "Visual analysis",
              desc: "Point your phone camera at crops and get instant AI-powered visual diagnosis.",
            },
            {
              icon: Cpu,
              title: "ESP32 ready",
              desc: "Open-source firmware for soil sensors and camera modules. Deploy in minutes.",
            },
            {
              icon: Droplets,
              title: "Multi-farm",
              desc: "Manage multiple farms and sensor nodes from one account.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card hover:border-[var(--green-dim)] transition-colors">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                style={{ background: "rgba(92,158,42,0.1)" }}>
                <Icon size={18} className="text-green" />
              </div>
              <h3 className="font-semibold text-sm mb-1.5">{title}</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] px-6 py-5 text-center">
        <p className="text-xs text-[var(--muted)]">
          © 2025 Soilify Labs · <span className="text-gradient font-semibold">Where Agriculture Meets Innovation</span>
        </p>
      </footer>
    </main>
  );
}
