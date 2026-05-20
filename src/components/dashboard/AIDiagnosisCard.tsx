"use client";

import { Sparkles, CheckCircle2, AlertTriangle, AlertOctagon } from "lucide-react";
import type { Diagnosis } from "@/types";

const statusConfig = {
  Healthy: {
    icon: CheckCircle2,
    color: "text-green",
    bg: "bg-green/10",
    border: "border-green/30",
  },
  "Water Soon": {
    icon: AlertTriangle,
    color: "text-yellow",
    bg: "bg-yellow/10",
    border: "border-yellow/30",
  },
  "Water Now": {
    icon: AlertOctagon,
    color: "text-red",
    bg: "bg-red/10",
    border: "border-red/30",
  },
} as const;

export default function AIDiagnosisCard({
  diagnosis,
}: {
  diagnosis: Diagnosis | null;
}) {
  if (!diagnosis) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 text-muted text-sm">
          <Sparkles size={16} /> AI diagnosis
        </div>
        <p className="text-muted mt-3 text-sm">
          Diagnosis will appear after your first reading.
        </p>
      </div>
    );
  }

  const cfg = statusConfig[diagnosis.status] ?? statusConfig.Healthy;
  const Icon = cfg.icon;

  return (
    <div className={`card ${cfg.border}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-muted text-xs uppercase tracking-wider">
          <Sparkles size={14} /> AI Diagnosis
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full border ${cfg.color} ${cfg.border}`}
        >
          {diagnosis.confidence} confidence
        </span>
      </div>

      <div className={`flex items-start gap-3 ${cfg.bg} rounded-lg p-3 mb-3`}>
        <Icon className={`${cfg.color} flex-shrink-0 mt-0.5`} size={22} />
        <div>
          <h3 className={`font-semibold ${cfg.color}`}>{diagnosis.status}</h3>
          <p className="text-sm text-foreground/90 mt-1 leading-relaxed">
            {diagnosis.explanation}
          </p>
        </div>
      </div>
    </div>
  );
}
