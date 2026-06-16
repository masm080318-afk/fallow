"use client";

import { useEffect, useState } from "react";
import { Droplets, Sun, Wind, Thermometer, Leaf, RefreshCw } from "lucide-react";

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
  vpd: number;
  date: string;
  error?: string;
}

export default function ETCard() {
  const [data, setData] = useState<ETReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/et");
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Failed to load ET data"); }
      else setData(json);
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const recommend = data?.recommend;
  const accentColor = recommend === "water" ? "var(--red)" : recommend === "skip" ? "var(--green)" : "var(--muted)";
  const bgColor = recommend === "water" ? "rgba(192,57,43,0.06)" : recommend === "skip" ? "rgba(92,158,42,0.06)" : "rgba(92,158,42,0.03)";
  const borderColor = recommend === "water" ? "rgba(192,57,43,0.2)" : recommend === "skip" ? "rgba(92,158,42,0.2)" : "var(--border)";

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(92,158,42,0.1)" }}>
            <Leaf size={15} style={{ color: "var(--green)" }} />
          </div>
          <div>
            <h3 className="font-semibold text-sm">ET Irrigation Forecast</h3>
            <p className="text-xs" style={{ color: "var(--muted)" }}>FAO-56 Penman-Monteith · {data?.date ?? "Today"}</p>
          </div>
        </div>
        <button onClick={load} className="!min-h-0 p-1.5 rounded-lg hover:bg-[rgba(92,158,42,0.08)] transition-colors" disabled={loading}>
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} style={{ color: "var(--muted)" }} />
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm" style={{ color: "var(--muted)" }}>Calculating ET0...</div>
      ) : error ? (
        <div className="rounded-xl p-4 text-sm" style={{ background: "rgba(192,57,43,0.06)", color: "var(--red)" }}>
          {error}
          {error.includes("location") && (
            <a href="/dashboard/settings" className="block mt-2 underline font-medium">Add location in Settings →</a>
          )}
        </div>
      ) : data ? (
        <>
          {/* Recommendation banner */}
          <div className="rounded-xl p-4 mb-4" style={{ background: bgColor, border: `1px solid ${borderColor}` }}>
            <div className="font-bold text-base mb-1" style={{ color: accentColor }}>
              {recommend === "water"
                ? `💧 Water today${data.recommend_mm ? ` — approx. ${data.recommend_mm} mm` : ""}`
                : recommend === "skip"
                ? "✓ Skip watering — soil moisture sufficient"
                : "— Awaiting sensor reading"}
            </div>
            <p className="text-xs" style={{ color: "var(--muted)" }}>{data.recommend_reason}</p>
          </div>

          {/* ET numbers */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "ET₀ (reference)", value: `${data.et0_mm} mm`, sub: "grass reference" },
              { label: `ETc (Kc = ${data.kc})`, value: `${data.etc_mm} mm`, sub: "your crop" },
              { label: "Precipitation", value: `${data.precipitation_mm} mm`, sub: "today" },
            ].map(({ label, value, sub }) => (
              <div key={label} className="rounded-xl p-3 text-center" style={{ background: "rgba(92,158,42,0.05)", border: "1px solid rgba(92,158,42,0.12)" }}>
                <div className="text-lg font-bold" style={{ color: "var(--green)" }}>{value}</div>
                <div className="text-xs font-medium mt-0.5">{label}</div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Weather inputs — show your work */}
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>Inputs from Open-Meteo</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Thermometer, label: "Temp range", value: `${data.temp_min_c}–${data.temp_max_c}°C` },
              { icon: Droplets,    label: "Humidity",   value: `${Math.round(data.humidity_pct)}%` },
              { icon: Wind,        label: "Wind (2m)",  value: `${data.wind_speed_ms} m/s` },
              { icon: Sun,         label: "Solar rad.", value: `${data.solar_radiation} MJ/m²` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2 text-xs p-2 rounded-lg" style={{ background: "rgba(92,158,42,0.03)", border: "1px solid rgba(92,158,42,0.08)" }}>
                <Icon size={12} style={{ color: "var(--green)" }} />
                <span style={{ color: "var(--muted)" }}>{label}</span>
                <span className="ml-auto font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
