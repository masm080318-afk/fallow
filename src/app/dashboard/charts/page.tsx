"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import MoistureChart from "@/components/charts/MoistureChart";
import TemperatureChart from "@/components/charts/TemperatureChart";
import type { Reading, Farm } from "@/types";
import { Download, RefreshCw } from "lucide-react";

type Range = "24h" | "7d" | "30d";

const ranges: { key: Range; label: string; ms: number }[] = [
  { key: "24h", label: "24 h", ms: 24 * 60 * 60 * 1000 },
  { key: "7d",  label: "7 d",  ms: 7 * 24 * 60 * 60 * 1000 },
  { key: "30d", label: "30 d", ms: 30 * 24 * 60 * 60 * 1000 },
];

export default function ChartsPage() {
  const [range, setRange] = useState<Range>("24h");
  const [readings, setReadings] = useState<Reading[]>([]);
  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let farmId: string | null = null;

    const load = async (isInitial = false) => {
      if (isInitial) setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (!farmId) {
        const { data: farmRow } = await supabase
          .from("farms")
          .select("*")
          .eq("user_id", user.id)
          .single();
        if (!farmRow) return;
        setFarm(farmRow as Farm);
        farmId = farmRow.id;
      }

      const since = new Date(
        Date.now() - ranges.find((r) => r.key === range)!.ms
      ).toISOString();

      const { data: readingsRow } = await supabase
        .from("readings")
        .select("*")
        .eq("farm_id", farmId)
        .gte("created_at", since)
        .order("created_at", { ascending: true });

      setReadings((readingsRow ?? []) as Reading[]);
      setLastUpdated(new Date());
      if (isInitial) setLoading(false);
    };

    load(true);

    // Refresh every 30 seconds to match ESP32 send interval
    const interval = setInterval(() => load(false), 30000);
    return () => clearInterval(interval);
  }, [range]);

  const data = useMemo(() => {
    return readings.map((r) => {
      const d = new Date(r.created_at);
      const label =
        range === "24h"
          ? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
          : d.toLocaleDateString([], { month: "short", day: "numeric" });
      return {
        t: d.getTime(),
        label,
        moisture: r.moisture_percent,
        temperature: r.temperature_f,
      };
    });
  }, [readings, range]);

  return (
    <main className="px-4 sm:px-6 py-5 max-w-2xl mx-auto space-y-4">

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        {/* Range selector */}
        <div
          className="flex gap-1 p-1 rounded-xl"
          style={{
            background: "rgba(92,158,42,0.06)",
            border: "1px solid rgba(92,158,42,0.12)",
          }}
        >
          {ranges.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 !min-h-0"
              style={
                range === r.key
                  ? { background: "var(--green)", color: "#fff", boxShadow: "0 2px 8px rgba(92,158,42,0.3)" }
                  : { color: "var(--muted)" }
              }
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="flex-1 flex items-center justify-end gap-2">
          {lastUpdated && (
            <span className="text-xs flex items-center gap-1" style={{ color: "var(--muted)" }}>
              <RefreshCw size={10} />
              {lastUpdated.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
          <a
            href="/api/export"
            download
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all duration-150"
            style={{
              background: "rgba(92,158,42,0.07)",
              border: "1px solid rgba(92,158,42,0.14)",
              color: "var(--green)",
            }}
          >
            <Download size={12} /> CSV
          </a>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="card text-center py-14" style={{ color: "var(--muted)" }}>
          <RefreshCw size={20} className="animate-spin mx-auto mb-3" style={{ color: "var(--green)" }} />
          <p className="text-sm">Loading readings…</p>
        </div>
      ) : data.length === 0 ? (
        <div className="card text-center py-14" style={{ color: "var(--muted)" }}>
          <p className="font-semibold mb-1">No data for this range yet</p>
          <p className="text-sm">Your sensor sends readings every 30 seconds once connected.</p>
        </div>
      ) : (
        <div className="space-y-4 stagger">
          <MoistureChart data={data} threshold={farm?.alert_threshold ?? 30} />
          <TemperatureChart data={data} />
        </div>
      )}
    </main>
  );
}
