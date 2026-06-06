"use client";

import { useEffect, useState } from "react";

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

  const color      = clamped < 30 ? "#c0392b" : clamped < 50 ? "#b8860b" : "#5c9e2a";
  const glowColor  = clamped < 30 ? "rgba(192,57,43,0.25)" : clamped < 50 ? "rgba(184,134,11,0.25)" : "rgba(92,158,42,0.25)";
  const trackColor = "#dfe8dc"; // light green-tinted track

  const stroke = 16;
  const radius = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = 135;
  const sweep = 270;
  const endAngle = startAngle + sweep;

  const polar = (deg: number) => {
    const a = (deg * Math.PI) / 180;
    return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
  };

  const start = polar(startAngle);
  const end = polar(endAngle);
  const bgPath = `M ${start.x} ${start.y} A ${radius} ${radius} 0 1 1 ${end.x} ${end.y}`;

  const progressAngle = startAngle + (sweep * clamped) / 100;
  const progressEnd = polar(progressAngle);
  const progressLarge = progressAngle - startAngle > 180 ? 1 : 0;
  const progressPath = clamped === 0
    ? ""
    : `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${progressLarge} 1 ${progressEnd.x} ${progressEnd.y}`;

  const label = clamped < 30 ? "Dry — Water Now" : clamped < 50 ? "Low — Water Soon" : "Optimal";

  return (
    <div className="relative inline-flex flex-col items-center">
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size + 20, height: size + 20, top: -10, left: -10,
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 68%)`,
          transition: "background 0.8s ease",
        }}
      />
      <svg width={size} height={size}>
        {/* Track */}
        <path d={bgPath} fill="none" stroke={trackColor} strokeWidth={stroke} strokeLinecap="round" />
        {/* Progress */}
        {progressPath && (
          <path d={progressPath} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
            style={{ transition: "all 0.8s cubic-bezier(.4,0,.2,1)" }} />
        )}
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black leading-none" style={{ color, fontSize: size * 0.22, transition: "color 0.6s" }}>
          {displayed}
          <span style={{ fontSize: size * 0.11, color: "#9aaa9a", fontWeight: 500 }}>%</span>
        </span>
        <span className="mt-1 font-semibold tracking-wide" style={{ color, fontSize: size * 0.065, transition: "color 0.6s" }}>
          {label}
        </span>
      </div>
    </div>
  );
}
