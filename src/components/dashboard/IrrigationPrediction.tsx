import { Clock, Droplets, CalendarClock, Sparkles } from "lucide-react";
import type { Diagnosis } from "@/types";
import CardHeader from "./CardHeader";

// Forward-looking card fed by the AI diagnosis: when the next watering is
// likely due, and the best window of the day to do it.
export default function IrrigationPrediction({ diagnosis }: { diagnosis: Diagnosis | null }) {
  const days = diagnosis?.days_until_irrigation ?? null;
  const window = diagnosis?.best_watering_window ?? null;

  return (
    <div className="card">
      <CardHeader
        icon={CalendarClock}
        title="Coming up"
        sub="Based on your latest AI diagnosis"
      />

      {days === null && window === null ? (
        <div className="tile p-4 flex items-center gap-3">
          <Sparkles size={16} className="shrink-0" style={{ color: "var(--green)" }} />
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Run a soil diagnosis above and we&apos;ll predict your next watering day.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="tile p-3.5">
            <div className="flex items-center gap-2 text-xs mb-1.5 font-medium" style={{ color: "var(--muted)" }}>
              <Clock size={13} /> Next water in
            </div>
            <div className="text-2xl font-bold">
              {days !== null ? days : "—"}
              <span className="text-sm font-normal ml-1" style={{ color: "var(--muted)" }}>
                {days === 1 ? "day" : "days"}
              </span>
            </div>
          </div>
          <div className="tile p-3.5">
            <div className="flex items-center gap-2 text-xs mb-1.5 font-medium" style={{ color: "var(--muted)" }}>
              <Droplets size={13} /> Best window
            </div>
            <div className="text-base font-semibold leading-tight pt-1">{window ?? "—"}</div>
          </div>
        </div>
      )}
    </div>
  );
}
