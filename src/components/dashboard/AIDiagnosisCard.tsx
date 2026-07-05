"use client";

import { useRef, useState } from "react";
import { Sparkles, CheckCircle2, AlertTriangle, AlertOctagon, Loader2, Camera, Radio } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { Camera as NativeCamera, CameraResultType, CameraSource } from "@capacitor/camera";
import type { Diagnosis } from "@/types";
import CardHeader from "./CardHeader";

const statusConfig = {
  Healthy:      { icon: CheckCircle2,  color: "text-green",  bg: "rgba(46,107,31,0.08)",   border: "rgba(46,107,31,0.2)" },
  "Water Soon": { icon: AlertTriangle, color: "text-yellow", bg: "rgba(184,134,11,0.08)",  border: "rgba(184,134,11,0.2)" },
  "Water Now":  { icon: AlertOctagon,  color: "text-red",    bg: "rgba(192,57,43,0.08)",   border: "rgba(192,57,43,0.2)" },
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
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farm_id: farmId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Diagnosis failed");
      setDiagnosis(json);
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong"); }
    setLoading(false);
  };

  const runPhotoDiagnosisBase64 = async (base64: string) => {
    setPhotoLoading(true); setError(null);
    try {
      const res = await fetch("/api/camera-ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farm_id: farmId, image: base64 }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Photo diagnosis failed");
      setDiagnosis(json);
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong"); }
    setPhotoLoading(false);
  };

  const runPhotoDiagnosis = async (file: File) => {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    await runPhotoDiagnosisBase64(base64);
  };

  const handlePhotoButtonClick = async () => {
    if (!Capacitor.isNativePlatform()) {
      fileRef.current?.click();
      return;
    }
    // Native platform: use the real camera/photo-library picker instead of
    // the HTML file input, for a genuinely native capture experience.
    try {
      const photo = await NativeCamera.getPhoto({
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt,
        quality: 80,
        allowEditing: false,
      });
      if (photo.base64String) await runPhotoDiagnosisBase64(photo.base64String);
    } catch (e) {
      // User cancelling the picker throws — not a real error, ignore it.
      const msg = e instanceof Error ? e.message : String(e);
      if (!/cancel/i.test(msg)) setError("Couldn't open the camera.");
    }
  };

  const requestLivePhoto = async () => {
    setRequestLoading(true); setError(null); setRequestMsg(null);
    try {
      const res = await fetch("/api/camera-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farm_id: farmId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      setRequestMsg("Photo requested — camera will capture within 30 seconds.");
      setTimeout(() => setRequestMsg(null), 15000);
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong"); }
    setRequestLoading(false);
  };

  const cfg = diagnosis ? (statusConfig[diagnosis.status] ?? statusConfig.Healthy) : null;
  const Icon = cfg?.icon;
  const busy = loading || photoLoading || requestLoading;

  return (
    <div className="card">
      <CardHeader
        icon={Sparkles}
        title="Plant health"
        sub="AI analysis of soil trends & photos"
        right={
          diagnosis && cfg ? (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}
              style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
              {diagnosis.confidence} confidence
            </span>
          ) : undefined
        }
      />

      {/* Result */}
      {diagnosis && Icon && cfg ? (
        <>
          <div className="flex items-start gap-3 rounded-xl p-3 mb-3"
            style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
            <Icon className={`${cfg.color} shrink-0 mt-0.5`} size={20} />
            <div>
              <h3 className={`font-bold text-sm ${cfg.color}`}>{diagnosis.status}</h3>
              <p className="text-sm text-foreground/80 mt-1 leading-relaxed">{diagnosis.explanation}</p>
            </div>
          </div>
          <p className="text-xs text-muted mb-3">
            Last checked {new Date(diagnosis.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
          </p>
        </>
      ) : (
        <p className="text-muted text-sm mb-3">
          Run a soil diagnosis or take a photo of your crops for visual AI analysis.
        </p>
      )}

      {error && <p className="text-xs mb-3" style={{ color: "var(--red)" }}>{error}</p>}
      {requestMsg && <p className="text-xs mb-3 text-green font-medium">{requestMsg}</p>}

      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) runPhotoDiagnosis(f); e.target.value = ""; }} />

      <div className="flex gap-2 mb-2">
        <button onClick={runDiagnosis} disabled={busy} className="btn-primary flex-1">
          {loading ? <><Loader2 size={14} className="animate-spin" /> Analyzing…</> : <><Sparkles size={14} /> {diagnosis ? "Re-run" : "Soil diagnosis"}</>}
        </button>
        <button onClick={handlePhotoButtonClick} disabled={busy} className="btn-secondary flex-1">
          {photoLoading ? <><Loader2 size={14} className="animate-spin" /> Analyzing…</> : <><Camera size={14} /> Photo</>}
        </button>
      </div>
      <button onClick={requestLivePhoto} disabled={busy} className="btn-secondary w-full">
        {requestLoading ? <><Loader2 size={14} className="animate-spin" /> Requesting…</> : <><Radio size={14} /> Request live camera photo</>}
      </button>
    </div>
  );
}
