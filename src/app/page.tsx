import Link from "next/link";
import Image from "next/image";
import { Droplets, Bell, Camera, LineChart, ChevronDown, Smartphone, Zap, Shield } from "lucide-react";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col min-h-screen">
      {/* Nav */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-20">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo-icon.png" alt="Soilify Labs" width={36} height={36} />
          <span className="text-base font-bold tracking-tight text-white">Soilify Labs</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-white/70">
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/mission" className="hover:text-white transition-colors">Our Mission</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/contact" className="btn-hero-primary text-sm !min-h-0 py-2 px-4 hidden sm:flex">Pre-order</Link>
          <Link href="/login" className="btn-hero-secondary text-sm !min-h-0 py-2 px-4">Sign in</Link>
        </div>
      </header>

      {/* Mobile nav */}
      <div className="sm:hidden flex items-center justify-center gap-6 py-3 border-b border-white/10 bg-black/30 text-xs font-medium text-white/70">
        <Link href="/about" className="hover:text-white transition-colors">About</Link>
        <Link href="/mission" className="hover:text-white transition-colors">Mission</Link>
        <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
      </div>

      {/* Hero — cinematic full-bleed */}
      <section className="relative min-h-[88vh] flex flex-col items-center justify-center text-center px-6 py-24 overflow-hidden -mt-[73px] pt-[73px]">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1600&q=85"
            alt="Farm rows at golden hour"
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="mb-6 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5">
            <span className="w-2 h-2 rounded-full bg-[#7dd44f] animate-pulse" />
            <span className="text-white/90 text-xs font-semibold tracking-[0.2em] uppercase">Built for small farms</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6 text-white leading-[1.06]">
            Your soil,<br />
            <span style={{ color: "#7dd44f" }}>smarter.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/70 mb-10 max-w-md mx-auto leading-relaxed">
            The precision tools large farms pay $10,000+ for — in a $20 kit that ships straight to your door.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-hero-primary text-base px-8 py-3.5">Pre-order your kit</Link>
            <Link href="/mission" className="btn-hero-secondary text-base px-8 py-3.5">Our mission →</Link>
          </div>

          <p className="text-xs mt-6 text-white/40">Free software · $20 sensor hardware · Ships to your door</p>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
          <ChevronDown size={22} className="text-white/30" />
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 divide-x divide-[var(--border)]">
          {[
            { value: "$20", label: "One-time hardware cost" },
            { value: "30s", label: "Sensor reading interval" },
            { value: "Free", label: "Software, forever" },
            { value: "< 1 min", label: "Setup time" },
          ].map(({ value, label }) => (
            <div key={label} className="py-7 px-6 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-gradient">{value}</p>
              <p className="text-xs mt-1.5 leading-tight" style={{ color: "var(--muted)" }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Problem → Solution split */}
      <section className="px-6 py-24 bg-white">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "var(--green)" }}>The problem</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight">
              Small farms water<br />by guesswork
            </h2>
            <p className="leading-relaxed mb-4" style={{ color: "var(--muted)" }}>
              Large farms use $10,000+ precision irrigation systems. Small farm families check soil by feel,
              waste water, and sometimes lose entire crops to moisture stress they never saw coming.
            </p>
            <p className="leading-relaxed font-semibold" style={{ color: "var(--foreground)" }}>
              Soilify Labs changes that.
            </p>
            <Link href="/mission" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--green)" }}>
              Read our mission →
            </Link>
          </div>
          <div className="relative h-80 sm:h-[420px] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=900&q=85"
              alt="Farmer working the land"
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20" style={{ background: "var(--background)" }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "var(--green)" }}>How it works</p>
          <h2 className="text-center text-3xl font-bold mb-14">Up and running in minutes</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: "01", icon: Zap, title: "Plug in your sensor", desc: "Stick the ESP32 kit in your soil. It connects to Wi-Fi automatically." },
              { step: "02", icon: Smartphone, title: "Get instant readings", desc: "Open the app and watch live moisture data stream in every 30 seconds." },
              { step: "03", icon: Shield, title: "Never miss a stress event", desc: "Set your thresholds. Get a text the moment your crops need water." },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="card relative overflow-hidden">
                <span className="absolute top-4 right-5 text-6xl font-black leading-none" style={{ color: "var(--border)" }}>{step}</span>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(92,158,42,0.1)" }}>
                  <Icon size={22} style={{ color: "var(--green)" }} />
                </div>
                <h3 className="font-bold text-base mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features — bento grid */}
      <section className="px-6 pb-24 pt-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "var(--green)" }}>What you get</p>
          <h2 className="text-center text-3xl font-bold mb-14">Everything your crops need</h2>

          <div className="grid sm:grid-cols-2 gap-5">
            {/* Large card — moisture */}
            <div className="card relative overflow-hidden sm:row-span-1 flex flex-col gap-4" style={{ background: "var(--background)" }}>
              <div className="relative h-44 -mx-5 -mt-5 mb-2 overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=700&q=80"
                  alt="Corn crops"
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--background)]" />
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(92,158,42,0.12)" }}>
                  <Droplets size={18} style={{ color: "var(--green)" }} />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Live soil moisture</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>Your ESP32 sensor sends readings every 30 seconds. Watch your moisture change in real time from anywhere in the world.</p>
                </div>
              </div>
            </div>

            {/* Large card — seedlings / AI */}
            <div className="card relative overflow-hidden flex flex-col gap-4" style={{ background: "var(--background)" }}>
              <div className="relative h-44 -mx-5 -mt-5 mb-2 overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=700&q=80"
                  alt="Seedlings"
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--background)]" />
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(92,158,42,0.12)" }}>
                  <Camera size={18} style={{ color: "var(--green)" }} />
                </div>
                <div>
                  <h3 className="font-bold mb-1">AI crop analysis</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>Take a photo of your plants. Our AI combines the image with your soil data for a precise diagnosis of what your crop needs.</p>
                </div>
              </div>
            </div>

            {/* Small card — SMS */}
            <div className="card flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(92,158,42,0.12)" }}>
                <Bell size={18} style={{ color: "var(--green)" }} />
              </div>
              <div>
                <h3 className="font-bold mb-1">SMS alerts</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>Get a text the moment your soil drops below your threshold. React before your crops feel the stress.</p>
              </div>
            </div>

            {/* Small card — Charts */}
            <div className="card flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(92,158,42,0.12)" }}>
                <LineChart size={18} style={{ color: "var(--green)" }} />
              </div>
              <div>
                <h3 className="font-bold mb-1">24-hour charts</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>See how moisture trends across the day. Know when your irrigation schedule is working — or when it&apos;s not.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA — dark with photo */}
      <section className="relative overflow-hidden py-28 px-6 text-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1400&q=80"
            alt="Rich soil"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0" style={{ background: "rgba(15,28,12,0.82)" }} />
        </div>
        <div className="relative z-10 max-w-xl mx-auto">
          <p className="text-xs font-bold tracking-[0.2em] uppercase mb-4" style={{ color: "#7dd44f" }}>Join the waitlist</p>
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-5 leading-tight">
            Ready to know<br />your soil?
          </h2>
          <p className="text-white/60 mb-9 text-base leading-relaxed">
            Join small farm families already on our waitlist. Ships to your door for $20.
          </p>
          <Link href="/contact" className="btn-hero-primary text-base px-10 py-4">
            Pre-order your kit
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] px-6 py-6 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
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
