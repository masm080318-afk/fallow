"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Loader2, Cpu, Wifi, Package, Leaf } from "lucide-react";
import PublicNav from "@/components/layout/PublicNav";
import PublicFooter from "@/components/layout/PublicFooter";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", farm_size: "", location: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/preorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Submission failed");
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ minHeight: "40vh" }}>
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=1400&q=85"
            alt="Seedlings in soil"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/85" />
        </div>

        <div className="relative z-10 flex flex-col" style={{ minHeight: "40vh" }}>
          <PublicNav />
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-4" style={{ color: "var(--green-bright)" }}>Reserve your spot</p>
            <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight tracking-tight">
              Pre-order your<br />
              <span style={{ color: "var(--green-bright)" }}>Soilify Kit</span>
            </h1>
            <p className="mt-5 text-white/60 max-w-sm leading-relaxed">
              No payment now. We&apos;ll reach out with pricing and shipping once kits are ready.
            </p>
          </div>
        </div>
      </section>

      {/* ── Two-column: kit info + form ── */}
      <section className="dark-section px-6 py-20 flex-1">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left — kit breakdown */}
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-6" style={{ color: "var(--green-bright)" }}>What&apos;s in the kit</p>

            <div className="space-y-4">
              {[
                { icon: Cpu,     title: "ESP32 microcontroller",     desc: "Pre-flashed with Soilify firmware. Add your WiFi credentials and you're live." },
                { icon: Wifi,    title: "Capacitive soil sensor",     desc: "Accurate, corrosion-resistant. Reads moisture 0–100% every 30 seconds." },
                { icon: Package, title: "Everything to get started",  desc: "Cables, weatherproof housing, and a step-by-step setup guide included." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="glass-card-dark p-5 flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(125,212,79,0.12)" }}>
                    <Icon size={17} style={{ color: "var(--green-bright)" }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
                    <p className="text-sm text-white/55 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}

              <div className="glass-card-dark p-5 flex gap-4 items-start" style={{ borderColor: "rgba(125,212,79,0.2)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(125,212,79,0.12)" }}>
                  <Leaf size={17} style={{ color: "var(--green-bright)" }} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--green-bright)" }}>Software — always free</p>
                  <p className="text-sm text-white/55 leading-relaxed">
                    Dashboard, AI diagnosis, SMS alerts, charts, and ET0 irrigation math are free forever.
                    You only pay for the hardware.
                  </p>
                </div>
              </div>
            </div>

            {/* Price callout */}
            <div className="mt-8 rounded-2xl overflow-hidden relative h-36">
              <Image
                src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80"
                alt="Soil"
                fill
                sizes="50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ background: "rgba(10,20,8,0.75)" }}>
                <p className="text-5xl font-black" style={{ color: "var(--green-bright)" }}>$20</p>
                <p className="text-white/60 text-sm mt-1">One-time hardware cost</p>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div>
            {success ? (
              <div className="glass-card-dark rounded-2xl p-10 text-center">
                <CheckCircle2 size={48} className="mx-auto mb-4" style={{ color: "var(--green-bright)" }} />
                <h3 className="text-2xl font-black text-white mb-3">You&apos;re on the list!</h3>
                <p className="text-white/55 text-sm leading-relaxed mb-7">
                  We&apos;ll email <strong className="text-white">{form.email}</strong> with pre-order
                  details and shipping info as soon as kits are ready.
                </p>
                <Link href="/" className="btn-hero-primary w-full py-3">Back to home</Link>
              </div>
            ) : (
              <form onSubmit={submit} className="glass-card-dark rounded-2xl p-8 space-y-5">
                <h2 className="text-xl font-black text-white mb-1">Reserve your kit</h2>
                <p className="text-sm text-white/45 mb-4">No payment required — we&apos;ll contact you when ready.</p>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/50">Full name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Jane Smith"
                    className="preorder-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/50">Email *</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="jane@yourfarm.com"
                    className="preorder-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/50">Farm size</label>
                    <select
                      value={form.farm_size}
                      onChange={e => setForm({ ...form, farm_size: e.target.value })}
                      className="preorder-input"
                    >
                      <option value="">Select…</option>
                      <option>Under 1 acre</option>
                      <option>1–5 acres</option>
                      <option>5–20 acres</option>
                      <option>20–50 acres</option>
                      <option>50+ acres</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/50">State / Country</label>
                    <input
                      value={form.location}
                      onChange={e => setForm({ ...form, location: e.target.value })}
                      placeholder="Texas, USA"
                      className="preorder-input"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/50">What do you grow? (optional)</label>
                  <textarea
                    rows={3}
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    placeholder="Tomatoes, corn, herbs…"
                    className="preorder-input resize-none"
                    style={{ minHeight: "unset" }}
                  />
                </div>

                {error && <p className="text-xs" style={{ color: "var(--red)" }}>{error}</p>}

                <button type="submit" disabled={loading} className="btn-hero-primary w-full py-3.5 text-base">
                  {loading
                    ? <><Loader2 size={15} className="animate-spin" /> Submitting…</>
                    : "Reserve my kit →"
                  }
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
