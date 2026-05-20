"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import MoistureChart from "@/components/charts/MoistureChart";
import TemperatureChart from "@/components/charts/TemperatureChart";
import type { Reading, Farm } from "@/types";
import { Download } from "lucide-react";

type Range = "24h" | "7d" | "30d";

const ranges: { key: Range; label: string; ms: number }[] = [
  { key: "24h", label: "24h", ms: 24 * 60 * 60 * 1000 },
  { key: "7d", label: "7d", ms: 7 * 24 * 60 * 60 * 1000 },
  { key: "30d", label: "30d", ms: 30 * 24 * 60 * 60 * 1000 },
];

export default function ChartsPage() {
  const [range, setRange] = useState<Range>("24h");
  const [readings, setReadings] = useState<Reading[]>([]);
  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: farmRow } = await supabase
        .from("farms")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (!farmRow) return;
      setFarm(farmRow as Farm);

      const since = new Date(
        Date.now() - ranges.find((r) => r.key === range)!.ms
      ).toISOString();

      const { data: readingsRow } = await supabase
        .from("readings")
        .select("*")
        .eq("farm_id", farmRow.id)
        .gte("created_at", since)
        .order("created_at", { ascending: true });

      setReadings((readingsRow ?? []) as Reading[]);
      setLoading(false);
    };
    load();
  }, [range]);

  const data = useMemo(() => {
    return readings.map((r) => {
      const d = new Date(r.created_at);
      const label =
        range === "24h"
          ? d.toLocaleTimeString([], { hour: "numeric" })
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
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1 bg-card border border-[var(--border)] rounded-lg p-1">
          {ranges.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors !min-h-0 ${
                range === r.key
                  ? "bg-green text-[#052e16]"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <a
          href="/api/export"
          className="btn-secondary text-sm !py-2 !px-3"
          download
        >
          <Download size={14} /> CSV
        </a>
      </div>

      {loading ? (
        <div className="card text-center text-muted py-12">Loading...</div>
      ) : data.length === 0 ? (
        <div className="card text-center text-muted py-12">
          No data for this range yet.
        </div>
      ) : (
        <>
          <MoistureChart data={data} threshold={farm?.alert_threshold ?? 30} />
          <TemperatureChart data={data} />
        </>
      )}
    </main>
  );
}
