"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

  // If this user already has a farm, skip straight to dashboard.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("farms")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data: farm }) => {
          if (farm) router.replace("/dashboard");
        });
    });
  }, [router]);

  const ingestUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/ingest`
      : "/api/ingest";

  const copy = () => {
    navigator.clipboard.writeText(ingestUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const finish = async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Not signed in.");
      setLoading(false);
      return;
    }

    const { data: farm, error: farmErr } = await supabase
      .from("farms")
      .insert({
        user_id: user.id,
        name: farmName,
        phone: phone || null,
        alert_threshold: threshold,
      })
      .select("id")
      .single();

    if (farmErr || !farm) {
      setError(farmErr?.message ?? "Failed to create farm.");
      setLoading(false);
      return;
    }

    if (nodeId.trim()) {
      const { error: nodeErr } = await supabase.from("sensor_nodes").insert({
        farm_id: farm.id,
        node_id: nodeId.trim(),
        name: nodeName.trim() || "Sensor 1",
      });
      if (nodeErr) {
        setError(nodeErr.message);
        setLoading(false);
        return;
      }
    }

    router.push("/dashboard");
    router.refresh();
  };

  const steps = [
    {
      title: "Name your farm",
      body: (
        <div className="space-y-3">
          <label className="text-sm text-muted">Farm name</label>
          <input
            value={farmName}
            onChange={(e) => setFarmName(e.target.value)}
            placeholder="e.g. Riverbend Acres"
            autoFocus
          />
        </div>
      ),
      canNext: farmName.trim().length > 1,
    },
    {
      title: "Phone for SMS alerts",
      body: (
        <div className="space-y-3">
          <label className="text-sm text-muted">
            Mobile number (optional, US format)
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 555 123 4567"
            type="tel"
          />
          <p className="text-xs text-muted">
            We&apos;ll text you only when your soil drops below the threshold.
          </p>
        </div>
      ),
      canNext: true,
    },
    {
      title: "Set your alert threshold",
      body: (
        <div className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-green">{threshold}</span>
            <span className="text-muted">% moisture</span>
          </div>
          <input
            type="range"
            min={10}
            max={70}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="!min-h-0 !p-0 !bg-transparent !border-0"
          />
          <p className="text-sm text-muted">
            Below this level you&apos;ll get an SMS. 30% is a good default for
            most row crops.
          </p>
        </div>
      ),
      canNext: true,
    },
    {
      title: "Connect your sensor",
      body: (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Flash your ESP32 with the Fallow firmware and point it at this URL:
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-[#0f0f0f] border border-[var(--border)] rounded-lg px-3 py-2 text-xs break-all">
              {ingestUrl}
            </code>
            <button
              onClick={copy}
              className="btn-secondary !px-3"
              aria-label="copy"
            >
              {copied ? (
                <Check size={16} className="text-green" />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>
          <div className="space-y-2 pt-2">
            <label className="text-sm text-muted">Node ID (from firmware)</label>
            <input
              value={nodeId}
              onChange={(e) => setNodeId(e.target.value)}
              placeholder="e.g. ESP32-AABBCC"
            />
            <label className="text-sm text-muted">Sensor name</label>
            <input
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
              placeholder="e.g. North field"
            />
          </div>
        </div>
      ),
      canNext: true,
    },
    {
      title: "You're all set",
      body: (
        <div className="space-y-3 text-center">
          <Sprout className="text-green mx-auto" size={48} />
          <p className="text-muted">
            We&apos;ll start showing readings as soon as your sensor checks in.
          </p>
        </div>
      ),
      canNext: true,
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Sprout className="text-green" size={24} />
          <span className="text-lg font-bold tracking-tight">Fallow</span>
        </div>

        <div className="flex gap-1 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-green" : "bg-[var(--border)]"
              }`}
            />
          ))}
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-5">{current.title}</h2>
          {current.body}

          {error && <p className="text-red text-sm mt-4">{error}</p>}

          <div className="flex justify-between mt-7">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="btn-secondary disabled:opacity-30"
            >
              <ArrowLeft size={16} /> Back
            </button>
            {isLast ? (
              <button
                onClick={finish}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? "Saving..." : "Go to dashboard"}
              </button>
            ) : (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!current.canNext}
                className="btn-primary disabled:opacity-50"
              >
                Continue <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
