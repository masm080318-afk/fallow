"use client";

import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import {
  Plug, Wifi, KeyRound, Droplets, Gauge, Sparkles, Radio,
  PlayCircle, MessageCircle, LifeBuoy,
} from "lucide-react";

const SETUP_STEPS = [
  { icon: Plug,     title: "Plug in your gateway", text: "Anywhere near your WiFi router. Give it a minute to start up." },
  { icon: Wifi,     title: "Join “Soilify-Setup” on your phone", text: "It's a WiFi network the gateway creates. A setup page opens by itself — like hotel WiFi." },
  { icon: KeyRound, title: "Enter your WiFi + pairing code", text: "Pick your home WiFi, type its password, and the 6-digit code from Settings → Gateway pairing code. Done — sensors appear on their own." },
];

const DASHBOARD_GUIDE = [
  { icon: Droplets, title: "The watering banner", text: "The big banner up top is your daily answer: water today (and how much), or skip. It combines live weather with your latest soil reading." },
  { icon: Gauge,    title: "The soil gauge", text: "Live moisture from your sensor. Red means dry, green is the sweet spot, blue means soaked. Updates every 15 minutes on its own." },
  { icon: Sparkles, title: "Plant health (AI)", text: "Runs your recent readings — or a photo of your crops — through AI and tells you if anything looks off." },
  { icon: Radio,    title: "Sensors", text: "Every sensor names itself and joins automatically once your gateway is set up. Rename them in Settings so “North field” means something." },
];

const FAQS = [
  { q: "How often does my sensor update?", a: "Every 15 minutes. Field sensors sleep between readings to stretch battery life to months, wake up, take a reading, send it, and sleep again." },
  { q: "Why does it say “Offline”?", a: "It means no reading has arrived for over 35 minutes. Usually it's the gateway: check it has power and your WiFi is up. If the gateway is fine, the sensor may be out of radio range or out of battery." },
  { q: "How does the watering advice work?", a: "We pull today's weather for your farm (temperature, humidity, wind, sun) and calculate how much water your crop loses to evaporation — the same FAO method agronomists use. Then we compare that against rain and your live soil reading. If the soil has enough, we tell you to skip." },
  { q: "How do I add another sensor?", a: "Just power it on within range of your gateway. It registers itself and shows up in Settings within 15 minutes as “New sensor” — tap the pencil to name it. Nothing to type." },
  { q: "How do I change my gateway's WiFi?", a: "Hold the PRG button on the gateway, tap RST, then release PRG. The “Soilify-Setup” network comes back and you can enter the new WiFi details." },
  { q: "What is the pairing code?", a: "A 6-digit code that links your gateway to your account — like a mailbox number for your farm's data. It's in Settings → Gateway pairing code, and you only ever type it once per gateway." },
  { q: "Can my family see the farm?", a: "Yes — Settings → Share farm access generates a link. Anyone who opens it and signs in with Google sees your farm's live dashboard." },
];

export default function HelpPage() {
  const router = useRouter();

  const replayTour = () => {
    try { localStorage.removeItem("soilify_tour_seen"); } catch { /* ignore */ }
    router.push("/dashboard");
  };

  return (
    <main className="px-4 sm:px-6 py-5 max-w-2xl mx-auto space-y-5 pb-8 stagger">

      {/* Page header */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center shrink-0"
          style={{ width: 44, height: 44, borderRadius: 8, background: "var(--accent)" }}
        >
          <LifeBuoy size={20} color="#fff" />
        </div>
        <div>
          <h1 className="font-display text-lg leading-tight">Help &amp; guide</h1>
          <p className="text-xs" style={{ color: "var(--muted)" }}>Everything you need, in plain language</p>
        </div>
      </div>

      {/* Quick start */}
      <div className="card">
        <p className="section-label mb-3">Set up in 3 steps</p>
        <div className="space-y-2.5">
          {SETUP_STEPS.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="flex items-start gap-3 tile p-3.5">
              <div className="icon-chip relative">
                <Icon size={15} />
                <span
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center text-white"
                  style={{ background: "var(--green)" }}
                >
                  {i + 1}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">{title}</p>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--muted)" }}>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reading the dashboard */}
      <div className="card">
        <p className="section-label mb-3">What am I looking at?</p>
        <div className="space-y-2.5">
          {DASHBOARD_GUIDE.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="icon-chip mt-0.5"><Icon size={15} /></div>
              <div>
                <p className="text-sm font-semibold leading-tight">{title}</p>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--muted)" }}>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <p className="section-label mb-3 px-1">Common questions</p>
        <div className="space-y-2">
          {FAQS.map(({ q, a }) => (
            <details key={q} className="faq">
              <summary>{q}</summary>
              <div className="faq-body">{a}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className={`grid gap-2 ${Capacitor.isNativePlatform() ? "grid-cols-1" : "grid-cols-2"}`}>
        <button onClick={replayTour} className="btn-secondary text-sm">
          <PlayCircle size={15} /> Replay the tour
        </button>
        {!Capacitor.isNativePlatform() && (
          <a href="/contact" className="btn-secondary text-sm">
            <MessageCircle size={15} /> Contact us
          </a>
        )}
      </div>
    </main>
  );
}
