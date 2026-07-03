"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getClientActiveFarm } from "@/lib/supabase/activeFarm";
import MoistureChart from "@/components/charts/MoistureChart";
import TemperatureChart from "@/components/charts/TemperatureChart";
import type { Reading, Farm } from "@/types";
import { Download, RefreshCw, GitCompare } from "lucide-react";

type Range = "24h" | "7d" | "30d";

const ranges: { key: Range; label: string; ms: number }[] = [
  { key: "24h", label: "24 h", ms: 24 * 60 * 60 * 1000 },
  { key: "7d",  label: "7 d",  ms: 7 * 24 * 60 * 60 * 1000 },
  { key: "30d", label: "30 d", ms: 30 * 24 * 60 * 60 * 1000 },
];

export default function ChartsPage() {
  const [range, setRange] = useState<Range>("24h");
  const [readings, setReadings] = useState<Reading[]>([]);
  const [prevReadings, setPrevReadings] = useState<Reading[]>([]);
  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [comparing, setComparing] = useState(false);
  const [outdoorMap, setOutdoorMap] = useState<Map<number, number>>(new Map());

  // Cache farmId so polling doesn't re-fetch farm row each tick
  const [farmId, setFarmId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const load = async (isInitial = false) => {
      if (isInitial) setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let fid = farmId;
      if (!fid) {
        const result = await getClientActiveFarm();
        if (!result) return;
        setFarm(result.farm);
        fid = result.farm.id;
        setFarmId(fid);
      }

      const since = new Date(Date.now() - ranges.find((r) => r.key === range)!.ms).toISOString();
      const { data: readingsRow } = await supabase
        .from("readings").select("*").eq("farm_id", fid)
        .gte("created_at", since).order("created_at", { ascending: true });

      setReadings((readingsRow ?? []) as Reading[]);
      setLastUpdated(new Date());
      if (isInitial) setLoading(false);
    };

    load(true);
    const interval = setInterval(() => load(false), 30000);
    return () => clearInterval(interval);
  }, [range]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch previous period when compare is toggled on
  useEffect(() => {
    if (!comparing || !farmId) return;
    const supabase = createClient();
    const rangeDef = ranges.find((r) => r.key === range)!;
    const prevEnd   = new Date(Date.now() - rangeDef.ms).toISOString();
    const prevStart = new Date(Date.now() - 2 * rangeDef.ms).toISOString();
    supabase.from("readings").select("*").eq("farm_id", farmId)
      .gte("created_at", prevStart).lte("created_at", prevEnd)
      .order("created_at", { ascending: true })
      .then(({ data }) => setPrevReadings((data ?? []) as Reading[]));
  }, [comparing, range, farmId]);

  // Fetch outdoor temperature from Open-Meteo
  useEffect(() => {
    if (!farm?.latitude || !farm?.longitude) return;
    const pastDays = range === "24h" ? 1 : range === "7d" ? 7 : 30;
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${farm.latitude}&longitude=${farm.longitude}&hourly=temperature_2m&temperature_unit=fahrenheit&timezone=auto&past_days=${pastDays}&forecast_days=1`
    )
      .then((r) => r.json())
      .then((d) => {
        const map = new Map<number, number>();
        (d.hourly?.time ?? []).forEach((t: string, i: number) => {
          const temp = d.hourly.temperature_2m?.[i];
          if (temp != null) map.set(new Date(t).getTime(), temp);
        });
        setOutdoorMap(map);
      })
      .catch(() => {});
  }, [farm?.latitude, farm?.longitude, range]);

  const rangeDef = ranges.find((r) => r.key === range)!;

  // Build a lookup: timestamp (rounded to 15-min bucket) → prev reading
  const prevByTime = useMemo(() => {
    const map = new Map<number, Reading>();
    prevReadings.forEach((r) => {
      const bucket = Math.round(new Date(r.created_at).getTime() / (15 * 60000)) * (15 * 60000);
      map.set(bucket, r);
    });
    return map;
  }, [prevReadings]);

  const data = useMemo(() => {
    return readings.map((r) => {
      const d = new Date(r.created_at);
      const t = d.getTime();
      const label =
        range === "24h"
          ? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
          : d.toLocaleDateString([], { month: "short", day: "numeric" });

      // Outdoor temp: match nearest hour from Open-Meteo
      const nearestHour = Math.round(t / 3600000) * 3600000;
      const outdoorTemp =
        outdoorMap.get(nearestHour) ??
        outdoorMap.get(nearestHour - 3600000) ??
        outdoorMap.get(nearestHour + 3600000) ??
        null;

      // Previous period: match by shifting timestamp back by one period
      let prevMoisture: number | null = null;
      let prevTemperature: number | null = null;
      if (comparing) {
        const prevT = t - rangeDef.ms;
        const prevBucket = Math.round(prevT / (15 * 60000)) * (15 * 60000);
        // Search ±1 bucket
        for (const offset of [0, 15 * 60000, -15 * 60000, 30 * 60000, -30 * 60000]) {
          const candidate = prevByTime.get(prevBucket + offset);
          if (candidate) {
            prevMoisture = candidate.moisture_percent;
            prevTemperature = candidate.temperature_f;
            break;
          }
        }
      }

      return { t, label, moisture: r.moisture_percent, temperature: r.temperature_f, outdoorTemp, prevMoisture, prevTemperature };
    });
  }, [readings, range, outdoorMap, comparing, prevByTime, rangeDef.ms]);

  return (
    <main className="px-4 sm:px-6 py-5 max-w-2xl mx-auto space-y-4">

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Range selector */}
        <div
          className="flex gap-1 p-1 rounded-xl"
          style={{ background: "rgba(46,107,31,0.06)", border: "1px solid rgba(46,107,31,0.12)" }}
        >
          {ranges.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 !min-h-0"
              style={
                range === r.key
                  ? { background: "var(--green)", color: "#fff", boxShadow: "0 2px 8px rgba(46,107,31,0.3)" }
                  : { color: "var(--muted)" }
              }
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Compare toggle */}
        <button
          onClick={() => setComparing((c) => !c)}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all !min-h-0"
          style={
            comparing
              ? { background: "rgba(46,107,31,0.15)", border: "1px solid rgba(46,107,31,0.35)", color: "var(--green)" }
              : { background: "rgba(46,107,31,0.05)", border: "1px solid rgba(46,107,31,0.12)", color: "var(--muted)" }
          }
        >
          <GitCompare size={12} /> Compare
        </button>

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
            style={{ background: "rgba(46,107,31,0.07)", border: "1px solid rgba(46,107,31,0.14)", color: "var(--green)" }}
          >
            <Download size={12} /> CSV
          </a>
        </div>
      </div>

      {/* Compare banner */}
      {comparing && (
        <div
          className="text-xs px-3 py-2 rounded-xl"
          style={{ background: "rgba(46,107,31,0.05)", border: "1px solid rgba(46,107,31,0.12)", color: "var(--muted)" }}
        >
          Showing dashed lines for the previous {range} for comparison.
        </div>
      )}

      {/* Charts */}
      {loading ? (
        <div className="card text-center py-14" style={{ color: "var(--muted)" }}>
          <RefreshCw size={20} className="animate-spin mx-auto mb-3" style={{ color: "var(--green)" }} />
          <p className="text-sm">Loading readings…</p>
        </div>
      ) : data.length === 0 ? (
        <div className="card text-center py-14" style={{ color: "var(--muted)" }}>
          <p className="font-semibold mb-1">No data for this range yet</p>
          <p className="text-sm">Your sensor sends readings every 15 minutes.</p>
        </div>
      ) : (
        <div className="space-y-4 stagger">
          <MoistureChart data={data} threshold={farm?.alert_threshold ?? 30} comparing={comparing} />
          <TemperatureChart data={data} comparing={comparing} hasLocation={!!(farm?.latitude && farm?.longitude)} />
        </div>
      )}

      {!farm?.latitude && !loading && (
        <p className="text-xs text-center" style={{ color: "var(--muted)" }}>
          Set your farm location in{" "}
          <a href="/dashboard/settings" style={{ color: "var(--green)" }}>Settings</a>{" "}
          to see outdoor temperature on the chart.
        </p>
      )}
    </main>
  );
}
