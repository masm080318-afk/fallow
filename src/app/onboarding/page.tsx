"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Sprout, ArrowRight, ArrowLeft, Copy, Check } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [farmName, setFarmName] = useState("");
  const [phone, setPhone] = useState("");
  const [threshold, setThreshold] = useState(30);
  const [nodeId, setNodeId] = useState("");
  const [nodeName, setNodeName] = useState("North field");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("farms").select("id").eq("user_id", user.id).maybeSingle()
        .then(({ data: farm }) => { if (farm) router.replace("/dashboard"); });
    });
  }, [router]);

  const ingestUrl =
    typeof window !== "undefined" ? `${window.location.origin}/api/ingest` : "/api/ingest";

  const copy = () => {
    navigator.clipboard.writeText(ingestUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const finish = async () => {
    setLoading(true); setError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Not signed in."); setLoading(false); return; }

    const { data: farm, error: farmErr } = await supabase
      .from("farms").insert({ user_id: user.id, name: farmName, phone: phone || null, alert_threshold: threshold })
      .select("id").single();
    if (farmErr || !farm) { setError(farmErr?.message ?? "Failed to create farm."); setLoading(false); return; }

    if (nodeId.trim()) {
      const { error: nodeErr } = await supabase.from("sensor_nodes").insert({
        farm_id: farm.id, node_id: nodeId.trim(), name: nodeName.trim() || "Sensor 1",
      });
      if (nodeErr) { setError(nodeErr.message); setLoading(false); return; }
    }

    router.push("/dashboard");
    router.refresh();
  };

  const glassInputClass = "w-full rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150 outline-none";
  const glassInputStyle = {
    background: "rgba(255,255,255,0.09)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "#fff",
    minHeight: 44,
  };
  const glassInputFocus = {
    borderColor: "rgba(125,212,79,0.5)",
    boxShadow: "0 0 0 3px rgba(125,212,79,0.1)",
  };

  const GlassInput = ({
    value, onChange, placeholder, type = "text", autoFocus,
  }: {
    value: string; onChange: (v: string) => void; placeholder?: string;
    type?: string; autoFocus?: boolean;
  }) => {
    const [focused, setFocused] = useState(false);
    return (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={glassInputClass}
        style={{ ...glassInputStyle, ...(focused ? glassInputFocus : {}), minHeight: 44 }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    );
  };

  const steps = [
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
    {
      title: "SMS alert number",
      subtitle: "Optional — we'll text when soil gets dry.",
      body: (
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-white/45">Mobile number</label>
          <GlassInput value={phone} onChange={setPhone} placeholder="+1 555 123 4567" type="tel" />
          <p className="text-xs text-white/35 mt-2">
            We&apos;ll text you only when soil drops below your threshold. No spam.
          </p>
        </div>
      ),
      canNext: true,
    },
    {
      title: "Alert threshold",
      subtitle: "SMS fires when moisture drops below this level.",
      body: (
        <div className="space-y-4">
          <div className="text-center py-4">
            <span className="text-6xl font-black" style={{ color: "var(--green-bright)" }}>{threshold}</span>
            <span className="text-xl text-white/55 ml-2">% moisture</span>
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
          <p className="text-xs text-white/40 text-center">30% is a good default for most row crops.</p>
        </div>
      ),
      canNext: true,
    },
    {
      title: "Connect your sensor",
      subtitle: "Flash firmware and point it at this URL.",
      body: (
        <div className="space-y-4">
          <p className="text-sm text-white/50">
            Flash your ESP32 with the Soilify firmware and point it at:
          </p>
          <div className="flex items-center gap-2">
            <code
              className="flex-1 rounded-xl px-3 py-2.5 text-xs break-all font-mono"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.75)" }}
            >
              {ingestUrl}
            </code>
            <button
              onClick={copy}
              className="flex items-center justify-center w-10 h-10 rounded-xl transition-all !min-h-0 !p-0 !border-0 shrink-0"
              style={{ background: "rgba(125,212,79,0.12)", color: "var(--green-bright)" }}
              aria-label="copy"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
            </button>
          </div>
          <div className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/45">Node ID (from firmware)</label>
              <GlassInput value={nodeId} onChange={setNodeId} placeholder="e.g. ESP32-AABBCC" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/45">Sensor name</label>
              <GlassInput value={nodeName} onChange={setNodeName} placeholder="e.g. North field" />
            </div>
          </div>
        </div>
      ),
      canNext: true,
    },
    {
      title: "You're all set!",
      subtitle: "Readings will appear as soon as your sensor checks in.",
      body: (
        <div className="py-4 flex flex-col items-center gap-4 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(125,212,79,0.25), rgba(92,158,42,0.1))",
              border: "1px solid rgba(125,212,79,0.3)",
              boxShadow: "0 0 24px rgba(125,212,79,0.2)",
            }}
          >
            <Sprout size={28} style={{ color: "var(--green-bright)" }} />
          </div>
          <p className="text-sm text-white/55 leading-relaxed">
            {farmName && <><strong className="text-white">{farmName}</strong> is ready.<br /></>}
            We&apos;ll show readings the moment your sensor comes online.
          </p>
        </div>
      ),
      canNext: true,
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

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
              style={{
                background: i <= step
                  ? "var(--green-bright)"
                  : "rgba(255,255,255,0.12)",
              }}
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
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 disabled:opacity-30 !min-h-0"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              <ArrowLeft size={15} /> Back
            </button>

            {isLast ? (
              <button
                onClick={finish}
                disabled={loading}
                className="flex items-center gap-2 flex-1 justify-center px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 disabled:opacity-50 !min-h-0"
                style={{
                  background: "linear-gradient(135deg, #5c9e2a, #4a8020)",
                  color: "#fff",
                  boxShadow: "0 4px 16px rgba(92,158,42,0.35)",
                }}
              >
                {loading ? "Saving…" : "Go to dashboard"} {!loading && <ArrowRight size={15} />}
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
