"use client";

import { useEffect, useState } from "react";
import { RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ETReading {
  et0_mm: number;
  etc_mm: number;
  kc: number;
  temp_max_c: number;
  temp_min_c: number;
  humidity_pct: number;
  wind_speed_ms: number;
  solar_radiation: number;
  precipitation_mm: number;
  recommend: "water" | "skip" | "unknown";
  recommend_mm: number | null;
  recommend_reason: string;
  date: string;
}

export default function ETCard() {
  const [data, setData] = useState<ETReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/et");
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "Failed to load");
      else {
        setData(json);
        setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();

    // Re-fetch whenever a new sensor reading is inserted
    const supabase = createClient();
    const channel = supabase
      .channel("et-card-watch")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "readings" }, () => {
        load();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const isWater = data?.recommend === "water";
  const isSkip = data?.recommend === "skip";

  const accentColor = isWater ? "var(--red, #c0392b)" : isSkip ? "var(--green)" : "var(--muted)";
  const bgColor = isWater ? "rgba(192,57,43,0.06)" : isSkip ? "rgba(92,158,42,0.06)" : "rgba(92,158,42,0.03)";
  const borderColor = isWater ? "rgba(192,57,43,0.2)" : isSkip ? "rgba(92,158,42,0.2)" : "var(--border)";

  const headline = isWater
    ? `Water today${data?.recommend_mm ? ` — ${data.recommend_mm} mm` : ""}`
    : isSkip
    ? "No watering needed"
    : "Calculating…";

  const emoji = isWater ? "💧" : isSkip ? "✓" : "⏳";

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-sm">Today's Watering Forecast</h3>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Updates automatically when sensor reads
          </p>
        </div>
        <button
          onClick={load}
          className="!min-h-0 p-1.5 rounded-lg hover:bg-[rgba(92,158,42,0.08)] transition-colors"
          disabled={loading}
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} style={{ color: "var(--muted)" }} />
        </button>
      </div>

      {loading && !data ? (
        <div className="py-8 text-center text-sm" style={{ color: "var(--muted)" }}>
          Checking weather &amp; soil…
        </div>
      ) : error ? (
        <div className="rounded-xl p-4 text-sm" style={{ background: "rgba(192,57,43,0.06)", color: "var(--red, #c0392b)" }}>
          {error}
          {error.includes("location") && (
            <a href="/dashboard/settings" className="block mt-2 underline font-medium">
              Add farm location in Settings →
            </a>
          )}
        </div>
      ) : data ? (
        <>
          {/* Main answer */}
          <div className="rounded-xl p-4 mb-3" style={{ background: bgColor, border: `1px solid ${borderColor}` }}>
            <div className="text-lg font-bold mb-1" style={{ color: accentColor }}>
              {emoji} {headline}
            </div>
            <p className="text-sm" style={{ color: "var(--muted)" }}>{data.recommend_reason}</p>
          </div>

          {/* Three key numbers */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { value: `${data.etc_mm} mm`, label: "Crop needs" },
              { value: `${data.precipitation_mm} mm`, label: "Rain today" },
              { value: `${Math.round(data.humidity_pct)}%`, label: "Humidity" },
            ].map(({ value, label }) => (
              <div key={label} className="rounded-lg p-2.5 text-center" style={{ background: "rgba(92,158,42,0.05)", border: "1px solid rgba(92,158,42,0.12)" }}>
                <div className="text-base font-bold" style={{ color: "var(--green)" }}>{value}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Plain-language explanation */}
          <div className="rounded-lg p-3 mb-2 text-xs" style={{ background: "rgba(92,158,42,0.04)", border: "1px solid rgba(92,158,42,0.1)", color: "var(--muted)" }}>
            <strong style={{ color: "var(--foreground)" }}>How this works: </strong>
            We look at today&apos;s weather ({data.temp_min_c}–{data.temp_max_c}°C, {Math.round(data.humidity_pct)}% humidity,{" "}
            {data.wind_speed_ms} m/s wind) to estimate how much water your crop is losing through evaporation.
            That number is compared against your latest soil sensor reading to decide if you should water.
          </div>

          {/* Technical details (collapsed by default) */}
          <button
            onClick={() => setShowDetails(v => !v)}
            className="flex items-center gap-1 text-xs w-full !min-h-0 py-1"
            style={{ color: "var(--muted)" }}
          >
            {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {showDetails ? "Hide" : "Show"} technical details
          </button>

          {showDetails && (
            <div className="mt-2 space-y-1.5">
              {[
                ["Reference ET (ET₀)", `${data.et0_mm} mm`, "How much a grass reference crop would evaporate today"],
                ["Crop factor (Kc)", `${data.kc}`, "Multiplier that adjusts for your specific crop"],
                ["Crop water need (ETc)", `${data.etc_mm} mm`, "ET₀ × Kc = actual water your crop needs"],
                ["Solar radiation", `${data.solar_radiation} MJ/m²`, "Sunlight — the main driver of evaporation"],
              ].map(([label, value, desc]) => (
                <div key={label} className="flex items-start justify-between gap-2 text-xs p-2 rounded-lg" style={{ background: "rgba(92,158,42,0.03)", border: "1px solid rgba(92,158,42,0.08)" }}>
                  <div>
                    <span className="font-medium">{label}</span>
                    <span className="block" style={{ color: "var(--muted)" }}>{desc}</span>
                  </div>
                  <span className="font-semibold shrink-0">{value}</span>
                </div>
              ))}
            </div>
          )}

          {lastUpdated && (
            <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
              Last updated {lastUpdated}
            </p>
          )}
        </>
      ) : null}
    </div>
  );
}
