"use client";

import { useEffect, useState } from "react";

// Flat semantic data colors — used only to encode moisture zones
const ZONES = [
  { from: 0,  to: 30,  fill: "rgba(168,68,42,0.16)", label: "Dry",     dot: "#A8442A" },
  { from: 30, to: 70,  fill: "rgba(46,107,31,0.16)", label: "Perfect", dot: "#2E6B1F" },
  { from: 70, to: 100, fill: "rgba(62,95,138,0.16)", label: "Wet",     dot: "#3E5F8A" },
];

export default function MoistureGauge({ value, size = 220 }: { value: number; size?: number }) {
  const [displayed, setDisplayed] = useState(0);
  const clamped = Math.max(0, Math.min(100, value));

  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const duration = 900;
    const from = displayed;
    const to = clamped;
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(from + (to - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [clamped]); // eslint-disable-line react-hooks/exhaustive-deps

  const color = clamped < 30 ? "#A8442A" : clamped > 70 ? "#3E5F8A" : "#2E6B1F";
  const label = clamped < 30 ? "Dry — Water Now" : clamped > 70 ? "Wet — Hold Off" : "Perfect";

  const stroke = 16;
  const radius = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = 135;
  const sweep = 270;

  const polar = (deg: number) => {
    const a = (deg * Math.PI) / 180;
    return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
  };

  const arcPath = (from: number, to: number) => {
    const a0 = startAngle + (sweep * from) / 100;
    const a1 = startAngle + (sweep * to) / 100;
    const p0 = polar(a0);
    const p1 = polar(a1);
    const large = a1 - a0 > 180 ? 1 : 0;
    return `M ${p0.x} ${p0.y} A ${radius} ${radius} 0 ${large} 1 ${p1.x} ${p1.y}`;
  };

  const progressAngle = startAngle + (sweep * clamped) / 100;
  const progressEnd   = polar(progressAngle);
  const progressLarge = progressAngle - startAngle > 180 ? 1 : 0;
  const pStart        = polar(startAngle);
  const progressPath  = clamped === 0
    ? ""
    : `M ${pStart.x} ${pStart.y} A ${radius} ${radius} 0 ${progressLarge} 1 ${progressEnd.x} ${progressEnd.y}`;

  return (
    <div className="inline-flex flex-col items-center gap-3">
      <div className="relative inline-flex flex-col items-center">
        <svg width={size} height={size}>
          {/* Three zone tracks */}
          {ZONES.map((z) => (
            <path
              key={z.label}
              d={arcPath(z.from, z.to)}
              fill="none"
              stroke={z.fill}
              strokeWidth={stroke}
              strokeLinecap="butt"
            />
          ))}
          {/* Active progress arc */}
          {progressPath && (
            <path
              d={progressPath}
              fill="none"
              stroke={color}
              strokeWidth={stroke}
              strokeLinecap="round"
              style={{ transition: "all 0.8s cubic-bezier(.4,0,.2,1)" }}
            />
          )}
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-black leading-none" style={{ color, fontSize: size * 0.22, transition: "color 0.6s" }}>
            {displayed}
            <span style={{ fontSize: size * 0.11, color: "var(--ink-soft)", fontWeight: 500 }}>%</span>
          </span>
          <span className="mt-1 font-semibold tracking-wide" style={{ color, fontSize: size * 0.065, transition: "color 0.6s" }}>
            {label}
          </span>
        </div>
      </div>

      {/* Zone legend */}
      <div className="flex items-center gap-4">
        {ZONES.map((z) => (
          <div key={z.label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: z.dot }} />
            <span className="text-xs font-medium" style={{ color: "var(--ink-soft)" }}>{z.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
