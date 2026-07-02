"use client";

import { useEffect, useState } from "react";
import { Droplets, CircleCheck, MapPin } from "lucide-react";

interface ETResult {
  recommend: "water" | "skip" | "unknown";
  recommend_mm: number | null;
  recommend_reason: string;
  error?: string;
}

// The single answer a farmer opens the app for: water today, or not?
export default function WaterHero() {
  const [data, setData] = useState<ETResult | null>(null);
  const [needsLocation, setNeedsLocation] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/et");
        const json = await res.json();
        if (!res.ok) {
          if (typeof json.error === "string" && json.error.includes("location")) setNeedsLocation(true);
        } else {
          setData(json);
        }
      } catch { /* banner just stays hidden */ }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div
        className="rounded-2xl p-5 animate-pulse"
        style={{ background: "rgba(92,158,42,0.07)", border: "1px solid rgba(92,158,42,0.12)", minHeight: 88 }}
      />
    );
  }

  if (needsLocation) {
    return (
      <a
        href="/dashboard/settings"
        className="block rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
        style={{ background: "linear-gradient(135deg, rgba(92,158,42,0.1), rgba(92,158,42,0.04))", border: "1px solid rgba(92,158,42,0.2)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(92,158,42,0.12)" }}>
            <MapPin size={18} style={{ color: "var(--green)" }} />
          </div>
          <div>
            <p className="font-bold text-sm">Add your farm location</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
              One tap in Settings unlocks daily &ldquo;water or skip&rdquo; advice →
            </p>
          </div>
        </div>
      </a>
    );
  }

  if (!data || data.recommend === "unknown") return null;

  const isWater = data.recommend === "water";

  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{
        background: isWater
          ? "linear-gradient(135deg, #2471a3, #3498db)"
          : "linear-gradient(135deg, #4a8020, #5c9e2a)",
        boxShadow: isWater
          ? "0 8px 28px rgba(41,128,185,0.3)"
          : "0 8px 28px rgba(92,158,42,0.28)",
      }}
    >
      {/* Soft decorative circle */}
      <div
        className="absolute -right-8 -top-10 w-36 h-36 rounded-full pointer-events-none"
        style={{ background: "rgba(255,255,255,0.09)" }}
      />
      <div
        className="absolute -right-2 top-8 w-20 h-20 rounded-full pointer-events-none"
        style={{ background: "rgba(255,255,255,0.07)" }}
      />

      <div className="flex items-center gap-4 relative">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(255,255,255,0.18)" }}
        >
          {isWater
            ? <Droplets size={24} color="#fff" />
            : <CircleCheck size={24} color="#fff" />}
        </div>
        <div className="min-w-0">
          <p className="text-xl sm:text-2xl font-black text-white leading-tight">
            {isWater
              ? <>Water today{data.recommend_mm ? ` — ${data.recommend_mm} mm` : ""}</>
              : <>You&apos;re good — no watering needed</>}
          </p>
          <p className="text-xs sm:text-sm mt-1 leading-snug" style={{ color: "rgba(255,255,255,0.75)" }}>
            {data.recommend_reason}
          </p>
        </div>
      </div>
    </div>
  );
}
