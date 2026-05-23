"use client";

import { useState } from "react";
import { Sparkles, CheckCircle2, AlertTriangle, AlertOctagon, Loader2 } from "lucide-react";
import type { Diagnosis } from "@/types";

const statusConfig = {
  Healthy: { icon: CheckCircle2, color: "text-green", bg: "bg-green/10", border: "border-green/30" },
  "Water Soon": { icon: AlertTriangle, color: "text-yellow", bg: "bg-yellow/10", border: "border-yellow/30" },
  "Water Now": { icon: AlertOctagon, color: "text-red", bg: "bg-red/10", border: "border-red/30" },
} as const;

export default function AIDiagnosisCard({
  diagnosis: initialDiagnosis,
  farmId,
}: {
  diagnosis: Diagnosis | null;
  farmId: string;
}) {
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(initialDiagnosis);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDiagnosis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farm_id: farmId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Diagnosis failed");
      setDiagnosis(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
    setLoading(false);
  };

  const cfg = diagnosis ? (statusConfig[diagnosis.status] ?? statusConfig.Healthy) : null;
  const Icon = cfg?.icon;

  return (
    <div className={`card ${cfg?.border ?? ""}`} style={{ background: "linear-gradient(145deg, #141414, #0f0f0f)" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-muted text-xs uppercase tracking-wider font-semibold">
          <Sparkles size={14} /> AI Diagnosis
        </div>
        {diagnosis && (
          <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg?.color} ${cfg?.border}`}>
            {diagnosis.confidence} confidence
          </span>
        )}
      </div>

      {diagnosis && Icon && cfg ? (
        <>
          <div className={`flex items-start gap-3 ${cfg.bg} rounded-xl p-3 mb-3`} style={{ border: `1px solid`, borderColor: "rgba(255,255,255,0.05)" }}>
            <Icon className={`${cfg.color} shrink-0 mt-0.5`} size={22} />
            <div>
              <h3 className={`font-bold ${cfg.color}`}>{diagnosis.status}</h3>
              <p className="text-sm text-foreground/90 mt-1 leading-relaxed">
                {diagnosis.explanation}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted mb-3">
            Last checked {new Date(diagnosis.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
          </p>
        </>
      ) : (
        <p className="text-muted text-sm mb-3">
          Tap below to get an AI read on your current soil conditions.
        </p>
      )}

      {error && <p className="text-xs mb-3" style={{ color: "var(--red)" }}>{error}</p>}

      <button
        onClick={runDiagnosis}
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? (
          <><Loader2 size={15} className="animate-spin" /> Analyzing…</>
        ) : (
          <><Sparkles size={15} /> {diagnosis ? "Re-run diagnosis" : "Run AI diagnosis"}</>
        )}
      </button>
    </div>
  );
}
