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
    return <div className="skeleton w-full" style={{ height: 88 }} />;
  }

  if (needsLocation) {
    return (
      <a
        href="/dashboard/settings"
        className="flex items-center gap-4 rounded-2xl p-6 transition-colors hover:border-[var(--accent)]"
        style={{ background: "var(--accent-wash)", border: "1px solid var(--border)" }}
      >
        <div className="icon-chip">
          <MapPin size={16} />
        </div>
        <div>
          <p className="font-bold text-sm">Add your farm location</p>
          <p className="text-xs mt-1" style={{ color: "var(--ink-soft)" }}>
            One tap in Settings unlocks daily watering advice
          </p>
        </div>
      </a>
    );
  }

  if (!data || data.recommend === "unknown") return null;

  const isWater = data.recommend === "water";

  return (
    <div
      className="rounded-2xl p-6"
      style={
        isWater
          ? { background: "var(--ink)" }
          : { background: "var(--surface)", border: "1px solid var(--border)", borderLeft: "4px solid var(--accent)" }
      }
    >
      <div className="flex items-start gap-4">
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: 48, height: 48, borderRadius: 8,
            background: isWater ? "rgba(255,255,255,0.12)" : "var(--accent-wash)",
          }}
        >
          {isWater
            ? <Droplets size={22} color="#fff" />
            : <CircleCheck size={22} style={{ color: "var(--accent)" }} />}
        </div>
        <div className="min-w-0">
          <p
            className="font-display text-xl sm:text-2xl leading-tight"
            style={{ color: isWater ? "#fff" : "var(--ink)" }}
          >
            {isWater
              ? <>Water today{data.recommend_mm ? ` — ${data.recommend_mm} mm` : ""}</>
              : <>You&apos;re good — no watering needed</>}
          </p>
          <p
            className="text-xs sm:text-sm mt-1 leading-snug"
            style={{ color: isWater ? "rgba(255,255,255,0.65)" : "var(--ink-soft)" }}
          >
            {data.recommend_reason}
          </p>
        </div>
      </div>
    </div>
  );
}
