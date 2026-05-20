import { Droplets, Clock, TrendingDown } from "lucide-react";
import type { Diagnosis } from "@/types";

export default function IrrigationPrediction({
  diagnosis,
}: {
  diagnosis: Diagnosis | null;
}) {
  const days = diagnosis?.days_until_irrigation ?? null;
  const window = diagnosis?.best_watering_window ?? null;
  // Naive savings model: avoiding one premature watering saves ~25%.
  // Show a flat 25% savings indicator vs naive scheduling.
  const savingsPct = 25;

  return (
    <div className="card">
      <h3 className="text-sm uppercase tracking-wider text-muted mb-4">
        Irrigation forecast
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#0f0f0f] border border-[var(--border)] rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted text-xs mb-1">
            <Clock size={14} /> Next water in
          </div>
          <div className="text-2xl font-semibold">
            {days !== null ? days : "—"}
            <span className="text-sm text-muted ml-1">
              {days === 1 ? "day" : "days"}
            </span>
          </div>
        </div>
        <div className="bg-[#0f0f0f] border border-[var(--border)] rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted text-xs mb-1">
            <Droplets size={14} /> Best window
          </div>
          <div className="text-base font-semibold leading-tight pt-1">
            {window ?? "—"}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted flex items-center gap-1">
            <TrendingDown size={12} /> Water savings vs schedule
          </span>
          <span className="text-green font-semibold">{savingsPct}%</span>
        </div>
        <div className="h-2 bg-[#0f0f0f] rounded-full overflow-hidden">
          <div
            className="h-full bg-green rounded-full transition-all"
            style={{ width: `${savingsPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
