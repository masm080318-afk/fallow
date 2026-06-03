"use client";

import { useRef, useState } from "react";
import { Sparkles, CheckCircle2, AlertTriangle, AlertOctagon, Loader2, Camera, Radio } from "lucide-react";
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
  const [photoLoading, setPhotoLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestMsg, setRequestMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

  const runPhotoDiagnosis = async (file: File) => {
    setPhotoLoading(true);
    setError(null);
    try {
      // Read file as base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Strip data URL prefix — only keep the base64 data
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/camera-ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farm_id: farmId, image: base64 }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Photo diagnosis failed");
      setDiagnosis(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
    setPhotoLoading(false);
  };

  const requestLivePhoto = async () => {
    setRequestLoading(true);
    setRequestMsg(null);
    setError(null);
    try {
      const res = await fetch("/api/camera-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farm_id: farmId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      setRequestMsg("📷 Photo requested — camera will capture within 30 seconds.");
      setTimeout(() => setRequestMsg(null), 15000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
    setRequestLoading(false);
  };

  const cfg = diagnosis ? (statusConfig[diagnosis.status] ?? statusConfig.Healthy) : null;
  const Icon = cfg?.icon;
  const busy = loading || photoLoading || requestLoading;

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
          <div className={`flex items-start gap-3 ${cfg.bg} rounded-xl p-3 mb-3`} style={{ border: "1px solid", borderColor: "rgba(255,255,255,0.05)" }}>
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
          Run a diagnosis based on soil readings, or take a photo of your crops for visual AI analysis.
        </p>
      )}

      {error && <p className="text-xs mb-3" style={{ color: "var(--red)" }}>{error}</p>}
      {requestMsg && <p className="text-xs mb-3 text-green">{requestMsg}</p>}

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) runPhotoDiagnosis(file);
          e.target.value = "";
        }}
      />

      {/* Buttons */}
      <div className="flex gap-2 mb-2">
        <button onClick={runDiagnosis} disabled={busy} className="btn-primary flex-1">
          {loading
            ? <><Loader2 size={14} className="animate-spin" /> Analyzing…</>
            : <><Sparkles size={14} /> {diagnosis ? "Re-run" : "Soil diagnosis"}</>}
        </button>
        <button onClick={() => fileRef.current?.click()} disabled={busy} className="btn-secondary flex-1" title="Upload a crop photo for visual AI analysis">
          {photoLoading
            ? <><Loader2 size={14} className="animate-spin" /> Analyzing…</>
            : <><Camera size={14} /> Photo diagnosis</>}
        </button>
      </div>

      {/* On-demand ESP32-CAM trigger */}
      <button onClick={requestLivePhoto} disabled={busy} className="btn-secondary w-full" title="Tells your ESP32-CAM to take a photo now">
        {requestLoading
          ? <><Loader2 size={14} className="animate-spin" /> Requesting…</>
          : <><Radio size={14} /> Request live camera photo</>}
      </button>
    </div>
  );
}
