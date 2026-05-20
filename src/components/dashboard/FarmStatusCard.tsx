"use client";

import { useEffect, useState } from "react";
import MoistureGauge from "./MoistureGauge";
import { createClient } from "@/lib/supabase/client";
import { Thermometer, Radio, WifiOff } from "lucide-react";
import type { Reading, SensorNode } from "@/types";

interface Props {
  initialReading: Reading | null;
  node: SensorNode | null;
  farmId: string;
}

export default function FarmStatusCard({ initialReading, node, farmId }: Props) {
  const [reading, setReading] = useState<Reading | null>(initialReading);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`readings-${farmId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "readings",
        filter: `farm_id=eq.${farmId}`,
      }, (payload) => setReading(payload.new as Reading))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [farmId]);

  useEffect(() => {
    if (!reading) return;
    const check = () => {
      const age = Date.now() - new Date(reading.created_at).getTime();
      setOnline(age < 35 * 60 * 1000);
    };
    check();
    const t = setInterval(check, 30_000);
    return () => clearInterval(t);
  }, [reading]);

  const moisture = reading?.moisture_percent ?? 0;
  const temp = reading?.temperature_f ?? 0;
  const glowClass = moisture < 30 ? "card-glow-red" : moisture < 50 ? "card-glow-yellow" : "card-glow-green";

  return (
    <div
      className={`card ${glowClass} animate-fade-up`}
      style={{
        background: "linear-gradient(145deg, #141414, #0f0f0f)",
        transition: "box-shadow 0.6s ease",
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted font-semibold">
            {node?.name ?? "Farm Status"}
          </p>
          <p className="text-xs text-muted mt-0.5">
            {reading ? `Updated ${timeAgo(reading.created_at)}` : "Waiting for sensor…"}
          </p>
        </div>
        <span className={`flex items-center gap-1.5 text-xs font-medium ${online ? "text-green" : "text-muted"}`}>
          {online ? (
            <><span className="dot-online" /> Live</>
          ) : (
            <><WifiOff size={12} /> Offline</>
          )}
        </span>
      </div>

      {/* Gauge */}
      <div className="flex justify-center py-3">
        <MoistureGauge value={moisture} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div
          className="rounded-xl p-3.5"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-1.5 text-muted text-xs mb-2 font-medium">
            <Thermometer size={13} /> Temperature
          </div>
          <div className="text-2xl font-bold">
            {reading ? temp.toFixed(1) : "—"}
            <span className="text-sm text-muted font-normal ml-1">°F</span>
          </div>
        </div>
        <div
          className="rounded-xl p-3.5"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-1.5 text-muted text-xs mb-2 font-medium">
            <Radio size={13} /> Sensor
          </div>
          <div className="text-2xl font-bold truncate">
            {node?.node_id ?? "—"}
          </div>
        </div>
      </div>
    </div>
  );
}

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
