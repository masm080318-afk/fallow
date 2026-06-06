import Link from "next/link";
import Image from "next/image";
import { Droplets, LineChart, Bell, Camera, Cpu, Wifi } from "lucide-react";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col min-h-screen">
      {/* Nav */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-[var(--border)] bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Soilify Labs" width={34} height={34} />
          <span className="text-lg font-bold tracking-tight text-gradient">Soilify Labs</span>
        </div>
        <Link href="/login" className="btn-secondary text-sm !min-h-0 py-2 px-4">
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 bg-white">
        <div className="mb-8 animate-float">
          <Image src="/logo.png" alt="Soilify Labs" width={88} height={88} className="mx-auto" />
        </div>
        <p className="text-xs font-bold tracking-[0.2em] uppercase mb-4" style={{ color: "var(--green)" }}>
          Where Agriculture Meets Innovation
        </p>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-5 max-w-2xl leading-tight" style={{ color: "var(--foreground)" }}>
          Smart soil monitoring<br />
          <span className="text-gradient">for every farm</span>
        </h1>
        <p className="text-base mb-10 max-w-md leading-relaxed" style={{ color: "var(--muted)" }}>
          Turn a $20 sensor into a connected field assistant — live moisture data,
          AI crop analysis, and SMS alerts in one place.
        </p>
        <Link href="/login" className="btn-primary text-base px-10 py-3.5">
          Get started free
        </Link>
        <p className="text-xs mt-3" style={{ color: "var(--muted)" }}>No credit card required</p>
      </section>

      {/* Features */}
      <section className="px-6 py-20 max-w-4xl mx-auto w-full">
        <p className="text-center text-xs font-bold tracking-widest uppercase mb-12" style={{ color: "var(--green)" }}>
          Everything you need
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: Droplets,  title: "Live moisture",   desc: "Sub-second readings streamed from your ESP32 sensor in the field." },
            { icon: LineChart, title: "AI diagnosis",    desc: "Claude analyzes soil data and crop photos to give precise watering advice." },
            { icon: Bell,      title: "SMS alerts",      desc: "Get a text the moment your soil drops below your threshold." },
            { icon: Camera,    title: "Visual analysis", desc: "Photo your crops for instant AI-powered visual plant health diagnosis." },
            { icon: Cpu,       title: "ESP32 ready",     desc: "Open-source firmware for soil and camera modules. Deploy in minutes." },
            { icon: Wifi,      title: "Multi-sensor",    desc: "Add unlimited sensor nodes across all your fields and crops." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(92,158,42,0.1)" }}>
                <Icon size={18} style={{ color: "var(--green)" }} />
              </div>
              <h3 className="font-semibold text-sm mb-1.5" style={{ color: "var(--foreground)" }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center px-6 bg-white border-t border-[var(--border)]">
        <Image src="/logo.png" alt="" width={48} height={48} className="mx-auto mb-5" />
        <h2 className="text-2xl font-bold mb-3" style={{ color: "var(--foreground)" }}>Ready to monitor your farm?</h2>
        <p className="text-sm mb-7" style={{ color: "var(--muted)" }}>Free to use. Set up in under 10 minutes.</p>
        <Link href="/login" className="btn-primary px-8 py-3.5">
          Get started free
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] px-6 py-5 text-center bg-white">
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          © 2025 Soilify Labs · Where Agriculture Meets Innovation
        </p>
      </footer>
    </main>
  );
}
