"use client";

import { useEffect, useState } from "react";
import MoistureGauge from "./MoistureGauge";
import { createClient } from "@/lib/supabase/client";
import { Thermometer, Radio, WifiOff, MapPin, Zap } from "lucide-react";
import type { Reading, SensorNode } from "@/types";

interface Props {
  initialReading: Reading | null;
  node: SensorNode | null;
  farmId: string;
}

export default function FarmStatusCard({ initialReading, node, farmId }: Props) {
  const [reading, setReading] = useState<Reading | null>(initialReading);
  const [online, setOnline] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [airTemp, setAirTemp] = useState<number | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [requestMsg, setRequestMsg] = useState<string | null>(null);

  // Tick every second for live timer
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Supabase realtime
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

  // Online check
  useEffect(() => {
    if (!reading) { setOnline(false); return; }
    setOnline(now - new Date(reading.created_at).getTime() < 35 * 60 * 1000);
  }, [reading, now]);

  // Live outdoor temperature from Open-Meteo (no API key needed)
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude.toFixed(4)}&longitude=${longitude.toFixed(4)}&current=temperature_2m&temperature_unit=fahrenheit&timezone=auto`
        );
        const data = await res.json();
        if (data.current?.temperature_2m != null) {
          setAirTemp(Math.round(data.current.temperature_2m * 10) / 10);
        }
        // Reverse geocode city name (free)
        const geo = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude.toFixed(4)}&lon=${longitude.toFixed(4)}&format=json`
        );
        const geoData = await geo.json();
        const city = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.county;
        if (city) setLocationName(city);
      } catch { /* silent fail */ }
    }, () => { /* permission denied */ }, { timeout: 8000 });
  }, []);

  const moisture = reading?.moisture_percent ?? 0;
  const glowClass = moisture < 30 ? "card-glow-red" : moisture < 50 ? "card-glow-yellow" : "card-glow-green";

  const requestInstantReading = async () => {
    setRequesting(true);
    setRequestMsg(null);
    try {
      const res = await fetch("/api/instant-reading", { method: "POST" });
      const json = await res.json();
      if (res.ok) {
        setRequestMsg("✓ Sensor will read when it wakes (within 15 min)");
      } else {
        setRequestMsg("Error: " + (json.error ?? "Failed"));
      }
    } catch (e) {
      setRequestMsg("Network error");
    }
    setRequesting(false);
  };

  return (
    <div className={`card ${glowClass} animate-fade-up`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted font-semibold">
            {node?.name ?? "Farm Status"}
          </p>
          <p className="text-xs text-muted mt-0.5">
            {reading ? `Updated ${timeAgo(reading.created_at, now)}` : "Waiting for sensor…"}
          </p>
        </div>
        <span className={`flex items-center gap-1.5 text-xs font-semibold ${online ? "text-green" : "text-muted"}`}>
          {online ? <><span className="dot-online" /> Live</> : <><WifiOff size={12} /> Offline</>}
        </span>
      </div>

      {/* Gauge */}
      <div className="flex justify-center py-2">
        <MoistureGauge value={moisture} />
      </div>

      {/* Instant reading button */}
      <button
        onClick={requestInstantReading}
        disabled={requesting}
        className="w-full btn-secondary text-sm mb-4"
      >
        <Zap size={14} />
        {requesting ? "Requesting..." : "Request instant reading"}
      </button>
      {requestMsg && (
        <p className="text-xs text-center mb-3" style={{ color: requestMsg.includes("Error") ? "var(--red)" : "var(--green)" }}>
          {requestMsg}
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="rounded-xl p-3.5" style={{ background: "rgba(92,158,42,0.05)", border: "1px solid rgba(92,158,42,0.12)" }}>
          <div className="flex items-center gap-1.5 text-muted text-xs mb-1.5 font-medium">
            <Thermometer size={12} /> Outdoor temp
          </div>
          <div className="text-2xl font-bold">
            {airTemp != null ? airTemp.toFixed(1) : "—"}
            <span className="text-sm text-muted font-normal ml-1">°F</span>
          </div>
          {locationName && (
            <div className="flex items-center gap-1 mt-1 text-xs text-muted">
              <MapPin size={10} /> {locationName}
            </div>
          )}
        </div>
        <div className="rounded-xl p-3.5" style={{ background: "rgba(92,158,42,0.05)", border: "1px solid rgba(92,158,42,0.12)" }}>
          <div className="flex items-center gap-1.5 text-muted text-xs mb-1.5 font-medium">
            <Radio size={12} /> Sensor
          </div>
          <div className="text-base font-bold pt-1 truncate">
            {node?.node_id ?? "—"}
          </div>
        </div>
      </div>
    </div>
  );
}

function timeAgo(iso: string, now = Date.now()) {
  const s = Math.floor((now - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`;
}
