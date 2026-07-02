"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowRight, ArrowLeft, Copy, Check, MapPin, Wifi, Plug, KeyRound, Sparkles,
} from "lucide-react";

// ─── Glass input (module-level so it keeps focus across re-renders) ─────────
const glassInputClass =
  "w-full rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150 outline-none";
const glassInputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.09)",
  border: "1px solid rgba(255,255,255,0.14)",
  color: "#fff",
  minHeight: 44,
};
const glassInputFocus: React.CSSProperties = {
  borderColor: "rgba(125,212,79,0.5)",
  boxShadow: "0 0 0 3px rgba(125,212,79,0.1)",
};

function GlassInput({
  value, onChange, placeholder, type = "text", autoFocus,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; autoFocus?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className={glassInputClass}
      style={{ ...glassInputStyle, ...(focused ? glassInputFocus : {}) }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [farmName, setFarmName] = useState("");
  const [phone, setPhone] = useState("");
  const [threshold, setThreshold] = useState(30);

  // Location
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [locStatus, setLocStatus] = useState<"idle" | "getting" | "set" | "denied">("idle");
  const [manualLoc, setManualLoc] = useState(false);
  const [latText, setLatText] = useState("");
  const [lonText, setLonText] = useState("");

  // Farm creation + pairing
  const [creating, setCreating] = useState(false);
  const [pairCode, setPairCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: farm } = await supabase.from("farms").select("id").eq("user_id", user.id).maybeSingle();
      if (farm) { router.replace("/dashboard"); return; }
      try {
        const { data: mem } = await supabase.from("farm_members").select("farm_id").eq("user_id", user.id).maybeSingle();
        if (mem?.farm_id) { router.replace("/dashboard"); return; }
      } catch { /* table not yet created */ }
    });
  }, [router]);

  const useMyLocation = () => {
    if (!navigator.geolocation) { setManualLoc(true); return; }
    setLocStatus("getting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(Math.round(pos.coords.latitude * 10000) / 10000);
        setLon(Math.round(pos.coords.longitude * 10000) / 10000);
        setLocStatus("set");
      },
      () => { setLocStatus("denied"); setManualLoc(true); },
      { timeout: 10000 }
    );
  };

  // Create the farm, fetch the pairing code, then advance to the final step.
  const createFarmAndAdvance = async () => {
    setCreating(true); setError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Not signed in."); setCreating(false); return; }

    const manualLat = manualLoc && latText ? Number(latText) : null;
    const manualLon = manualLoc && lonText ? Number(lonText) : null;

    const { error: farmErr } = await supabase.from("farms").insert({
      user_id: user.id,
      name: farmName,
      phone: phone || null,
      alert_threshold: threshold,
      latitude: lat ?? (Number.isFinite(manualLat) ? manualLat : null),
      longitude: lon ?? (Number.isFinite(manualLon) ? manualLon : null),
    });
    if (farmErr) { setError(farmErr.message); setCreating(false); return; }

    try {
      const res = await fetch("/api/farm/pairing-code");
      const json = await res.json();
      if (res.ok && json.code) setPairCode(json.code);
    } catch { /* code also lives in Settings — not fatal */ }

    setStep(3);
    setCreating(false);
  };

  const copyCode = () => {
    if (!pairCode) return;
    navigator.clipboard.writeText(pairCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const locationSet = locStatus === "set" || (manualLoc && latText.trim() !== "" && lonText.trim() !== "");

  const steps = [
    // ── Step 0: Name ──
    {
      title: "Name your farm",
      subtitle: "This is how it'll appear in your dashboard.",
      body: (
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-white/45">Farm name</label>
          <GlassInput value={farmName} onChange={setFarmName} placeholder="e.g. Riverbend Acres" autoFocus />
        </div>
      ),
      canNext: farmName.trim().length > 1,
    },

    // ── Step 1: Location ──
    {
      title: "Where is your farm?",
      subtitle: "Powers the weather-based watering forecast.",
      body: (
        <div className="space-y-4">
          <button
            onClick={useMyLocation}
            disabled={locStatus === "getting"}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all !min-h-0"
            style={{
              background: locationSet && !manualLoc
                ? "rgba(125,212,79,0.15)"
                : "linear-gradient(135deg, rgba(125,212,79,0.22), rgba(92,158,42,0.12))",
              border: "1px solid rgba(125,212,79,0.35)",
              color: "var(--green-bright)",
            }}
          >
            <MapPin size={16} />
            {locStatus === "getting" ? "Finding you…" : locStatus === "set" ? "Location set" : "Use my location"}
            {locStatus === "set" && <Check size={16} />}
          </button>

          {locStatus === "set" && (
            <p className="text-xs text-white/40 text-center">
              {lat}, {lon} — you can fine-tune this later in Settings.
            </p>
          )}

          {locStatus === "denied" && (
            <p className="text-xs text-center" style={{ color: "#ffb4a8" }}>
              Couldn&apos;t get your location — enter it below or skip for now.
            </p>
          )}

          {!manualLoc ? (
            <button
              onClick={() => setManualLoc(true)}
              className="w-full text-xs text-white/40 underline !min-h-0 !p-0 !bg-transparent !border-0"
            >
              Enter coordinates manually
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <GlassInput value={latText} onChange={setLatText} placeholder="Latitude" type="number" />
              <GlassInput value={lonText} onChange={setLonText} placeholder="Longitude" type="number" />
            </div>
          )}

          <p className="text-xs text-white/35 text-center">
            Optional — but without it we can&apos;t tell you when to skip watering.
          </p>
        </div>
      ),
      canNext: true,
    },

    // ── Step 2: Alerts ──
    {
      title: "Dry-soil alerts",
      subtitle: "We'll text you when your soil needs attention.",
      body: (
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/45">
              Mobile number <span className="normal-case font-normal">(optional)</span>
            </label>
            <GlassInput value={phone} onChange={setPhone} placeholder="+1 555 123 4567" type="tel" />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/45">Alert when soil drops below</label>
            <div className="text-center py-1">
              <span className="text-5xl font-black" style={{ color: "var(--green-bright)" }}>{threshold}</span>
              <span className="text-lg text-white/55 ml-1.5">%</span>
            </div>
            <input
              type="range" min={10} max={70}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full !min-h-0 !p-0 !bg-transparent !border-0"
            />
            <div className="flex justify-between text-xs text-white/35">
              <span>10% (dry)</span><span>70% (wet)</span>
            </div>
            <p className="text-xs text-white/40 text-center">30% is a good default for most crops.</p>
          </div>
        </div>
      ),
      canNext: true,
    },

    // ── Step 3: Pair the gateway ──
    {
      title: "Pair your gateway",
      subtitle: "No wires, no codes to flash — just this.",
      body: (
        <div className="space-y-5">
          {/* The code */}
          <div
            className="rounded-2xl py-5 px-4 text-center relative"
            style={{
              background: "linear-gradient(135deg, rgba(125,212,79,0.16), rgba(92,158,42,0.06))",
              border: "1px solid rgba(125,212,79,0.3)",
              boxShadow: "0 0 32px rgba(125,212,79,0.12)",
            }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45 mb-2">Your pairing code</p>
            <div className="flex items-center justify-center gap-3">
              <span
                className="text-4xl font-black tracking-[0.25em]"
                style={{ color: "var(--green-bright)", textShadow: "0 0 24px rgba(125,212,79,0.4)" }}
              >
                {pairCode ?? "······"}
              </span>
              {pairCode && (
                <button
                  onClick={copyCode}
                  className="w-9 h-9 flex items-center justify-center rounded-lg !min-h-0 !p-0 !border-0 shrink-0"
                  style={{ background: "rgba(125,212,79,0.15)", color: "var(--green-bright)" }}
                  aria-label="Copy code"
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                </button>
              )}
            </div>
            {!pairCode && (
              <p className="text-xs text-white/40 mt-2">You can also find this code anytime in Settings.</p>
            )}
          </div>

          {/* Steps */}
          <div className="space-y-2.5">
            {[
              { icon: Plug, text: "Plug in your Soilify gateway near your WiFi router" },
              { icon: Wifi, text: "On your phone, join the WiFi network “Soilify-Setup”" },
              { icon: KeyRound, text: "Pick your home WiFi and type this code on the page that opens" },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl px-3.5 py-3"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(125,212,79,0.12)" }}>
                  <Icon size={14} style={{ color: "var(--green-bright)" }} />
                </div>
                <p className="text-xs text-white/65 leading-snug">
                  <span className="font-bold text-white/90 mr-1">{i + 1}.</span>{text}
                </p>
              </div>
            ))}
          </div>

          <p className="text-xs text-white/40 text-center flex items-center justify-center gap-1.5">
            <Sparkles size={12} style={{ color: "var(--green-bright)" }} />
            Sensors appear on your dashboard automatically — nothing to type.
          </p>
        </div>
      ),
      canNext: true,
    },
  ];

  const current = steps[step];
  const isPairStep = step === 3;
  const isAlertStep = step === 2;

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center px-6 py-10 overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&q=80"
          alt="Corn crop rows"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/65 to-black/88" />
      </div>

      <div className="relative z-10 w-full max-w-md">

        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <Image src="/logo-icon.png" alt="" width={28} height={28} />
          <span className="text-base font-black text-white tracking-tight">Soilify Labs</span>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{ background: i <= step ? "var(--green-bright)" : "rgba(255,255,255,0.12)" }}
            />
          ))}
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-7"
          style={{
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(24px) saturate(160%)",
            WebkitBackdropFilter: "blur(24px) saturate(160%)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07)",
          }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.18em] mb-1.5" style={{ color: "var(--green-bright)" }}>
            Step {step + 1} of {steps.length}
          </p>
          <h2 className="text-xl font-black text-white mb-1">{current.title}</h2>
          <p className="text-sm text-white/40 mb-6">{current.subtitle}</p>

          {current.body}

          {error && (
            <p
              className="text-sm mt-4 text-center rounded-xl py-2 px-3"
              style={{ color: "#ff8a8a", background: "rgba(192,57,43,0.15)", border: "1px solid rgba(192,57,43,0.25)" }}
            >
              {error}
            </p>
          )}

          <div className="flex justify-between items-center mt-7 gap-3">
            {!isPairStep && (
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0 || creating}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 disabled:opacity-30 !min-h-0"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                <ArrowLeft size={15} /> Back
              </button>
            )}

            {isPairStep ? (
              <button
                onClick={() => { router.push("/dashboard"); router.refresh(); }}
                className="flex items-center gap-2 flex-1 justify-center px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 !min-h-0"
                style={{
                  background: "linear-gradient(135deg, #5c9e2a, #4a8020)",
                  color: "#fff",
                  boxShadow: "0 4px 16px rgba(92,158,42,0.35)",
                }}
              >
                Go to dashboard <ArrowRight size={15} />
              </button>
            ) : isAlertStep ? (
              <button
                onClick={createFarmAndAdvance}
                disabled={creating}
                className="flex items-center gap-2 flex-1 justify-center px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 disabled:opacity-50 !min-h-0"
                style={{
                  background: "linear-gradient(135deg, #5c9e2a, #4a8020)",
                  color: "#fff",
                  boxShadow: "0 4px 16px rgba(92,158,42,0.35)",
                }}
              >
                {creating ? "Creating your farm…" : "Create my farm"} {!creating && <ArrowRight size={15} />}
              </button>
            ) : (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!current.canNext}
                className="flex items-center gap-2 flex-1 justify-center px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 disabled:opacity-30 !min-h-0"
                style={{
                  background: "linear-gradient(135deg, #5c9e2a, #4a8020)",
                  color: "#fff",
                  boxShadow: current.canNext ? "0 4px 16px rgba(92,158,42,0.35)" : "none",
                }}
              >
                Continue <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
