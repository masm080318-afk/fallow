"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle2, Loader2, Package, Wifi, Cpu } from "lucide-react";

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
      {/* Nav */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-[var(--border)] bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo-icon.png" alt="Soilify Labs" width={36} height={36} />
          <span className="text-base font-bold tracking-tight text-gradient">Soilify Labs</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium" style={{ color: "var(--muted)" }}>
          <Link href="/about" className="hover:text-[var(--green)] transition-colors">About</Link>
          <Link href="/mission" className="hover:text-[var(--green)] transition-colors">Our Mission</Link>
          <Link href="/contact" className="text-[var(--green)] font-semibold">Contact</Link>
        </nav>
        <Link href="/login" className="btn-secondary text-sm !min-h-0 py-2 px-4">Sign in</Link>
      </header>

      {/* Hero */}
      <section className="bg-white px-6 py-16 text-center border-b border-[var(--border)]">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm mb-6 hover:text-[var(--green)] transition-colors" style={{ color: "var(--muted)" }}>
          <ArrowLeft size={14} /> Back to home
        </Link>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Pre-order your <span className="text-gradient">Soilify Kit</span>
        </h1>
        <p className="text-base max-w-md mx-auto leading-relaxed" style={{ color: "var(--muted)" }}>
          Be the first to get a Soilify Labs sensor kit delivered to your farm.
          We&apos;ll reach out with pricing and shipping details.
        </p>
      </section>

      <div className="px-6 py-16 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Kit details */}
        <div className="space-y-5">
          <h2 className="text-xl font-bold">What&apos;s in the kit</h2>

          {[
            { icon: Cpu,     title: "ESP32 microcontroller",   desc: "Pre-flashed with Soilify firmware. Just add your WiFi details." },
            { icon: Wifi,    title: "Capacitive soil sensor",  desc: "Accurate, corrosion-resistant. Measures moisture 0–100%." },
            { icon: Package, title: "Everything to get started", desc: "Cables, housing, and step-by-step setup guide included." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(92,158,42,0.1)" }}>
                <Icon size={17} style={{ color: "var(--green)" }} />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-0.5">{title}</h3>
                <p className="text-sm" style={{ color: "var(--muted)" }}>{desc}</p>
              </div>
            </div>
          ))}

          <div className="card" style={{ background: "rgba(92,158,42,0.06)", borderColor: "rgba(92,158,42,0.2)" }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--green)" }}>Software — always free</p>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              The Soilify Labs app, AI diagnosis, SMS alerts, and charts are free forever.
              You only pay for the hardware.
            </p>
          </div>
        </div>

        {/* Form */}
        <div>
          {success ? (
            <div className="card text-center py-12">
              <CheckCircle2 size={48} className="mx-auto mb-4" style={{ color: "var(--green)" }} />
              <h3 className="text-xl font-bold mb-2">You&apos;re on the list!</h3>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                We&apos;ll email you at <strong>{form.email}</strong> with pre-order details
                and a shipping estimate as soon as kits are ready.
              </p>
              <Link href="/" className="btn-primary mt-6 w-full">Back to home</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="card space-y-4">
              <h2 className="text-lg font-bold mb-2">Reserve your kit</h2>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Full name *</label>
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Jane Smith" />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Email *</label>
                  <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="jane@yourfarm.com" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>Farm size</label>
                  <select value={form.farm_size} onChange={e => setForm({ ...form, farm_size: e.target.value })}>
                    <option value="">Select…</option>
                    <option>Under 1 acre</option>
                    <option>1–5 acres</option>
                    <option>5–20 acres</option>
                    <option>20–50 acres</option>
                    <option>50+ acres</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>State / Country</label>
                  <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. Texas, USA" />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-medium" style={{ color: "var(--muted)" }}>What do you grow? (optional)</label>
                  <textarea rows={3} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                    placeholder="Tomatoes, corn, herbs…"
                    style={{ minHeight: "unset", resize: "none" }} />
                </div>
              </div>

              {error && <p className="text-xs" style={{ color: "var(--red)" }}>{error}</p>}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? <><Loader2 size={15} className="animate-spin" /> Submitting…</> : "Reserve my kit →"}
              </button>

              <p className="text-xs text-center" style={{ color: "var(--muted)" }}>
                No payment now. We&apos;ll contact you when kits are ready to ship.
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] px-6 py-5 bg-white text-center mt-auto">
        <p className="text-xs" style={{ color: "var(--muted)" }}>© 2025 Soilify Labs · Where Agriculture Meets Innovation</p>
      </footer>
    </main>
  );
}
