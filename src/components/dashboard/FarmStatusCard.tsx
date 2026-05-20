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

export default function FarmStatusCard({
  initialReading,
  node,
  farmId,
}: Props) {
  const [reading, setReading] = useState<Reading | null>(initialReading);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`readings-${farmId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "readings",
          filter: `farm_id=eq.${farmId}`,
        },
        (payload) => {
          setReading(payload.new as Reading);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [farmId]);

  useEffect(() => {
    if (!reading) return;
    const check = () => {
      const ageMs = Date.now() - new Date(reading.created_at).getTime();
      setOnline(ageMs < 15 * 60 * 1000); // online if last reading < 15 min
    };
    check();
    const t = setInterval(check, 30_000);
    return () => clearInterval(t);
  }, [reading]);

  const moisture = reading?.moisture_percent ?? 0;
  const temp = reading?.temperature_f ?? 0;

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h2 className="text-sm uppercase tracking-wider text-muted">
            {node?.name ?? "Farm status"}
          </h2>
          <p className="text-xs text-muted mt-1">
            {reading
              ? `Updated ${timeAgo(reading.created_at)}`
              : "Waiting for sensor data"}
          </p>
        </div>
        <span
          className={`flex items-center gap-1.5 text-xs ${
            online ? "text-green" : "text-muted"
          }`}
        >
          {online ? (
            <>
              <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
              Online
            </>
          ) : (
            <>
              <WifiOff size={12} /> Offline
            </>
          )}
        </span>
      </div>

      <div className="flex flex-col items-center py-2">
        <MoistureGauge value={moisture} />
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-[#0f0f0f] border border-[var(--border)] rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted text-xs mb-1">
            <Thermometer size={14} /> Temperature
          </div>
          <div className="text-xl font-semibold">
            {reading ? temp.toFixed(1) : "—"}
            <span className="text-sm text-muted ml-1">°F</span>
          </div>
        </div>
        <div className="bg-[#0f0f0f] border border-[var(--border)] rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted text-xs mb-1">
            <Radio size={14} /> Node
          </div>
          <div className="text-xl font-semibold truncate">
            {node?.node_id ?? "—"}
          </div>
        </div>
      </div>
    </div>
  );
}

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
