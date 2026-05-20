"use client";

import { useEffect, useState } from "react";

export default function MoistureGauge({ value, size = 220 }: { value: number; size?: number }) {
  const [displayed, setDisplayed] = useState(0);
  const clamped = Math.max(0, Math.min(100, value));

  // Animate number counting up
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

  const color = clamped < 30 ? "#ef4444" : clamped < 50 ? "#eab308" : "#22c55e";
  const glowColor = clamped < 30
    ? "rgba(239,68,68,0.4)"
    : clamped < 50
    ? "rgba(234,179,8,0.4)"
    : "rgba(34,197,94,0.4)";

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
  const progressPath =
    clamped === 0
      ? ""
      : `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${progressLarge} 1 ${progressEnd.x} ${progressEnd.y}`;

  const label = clamped < 30 ? "Dry — Water Now" : clamped < 50 ? "Low — Water Soon" : "Optimal";

  return (
    <div className="relative inline-flex flex-col items-center">
      {/* Outer glow ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: size + 24,
          height: size + 24,
          top: -12,
          left: -12,
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          opacity: 0.5,
          transition: "background 0.8s ease",
          pointerEvents: "none",
        }}
      />

      <svg width={size} height={size} style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}>
        {/* Track */}
        <path
          d={bgPath}
          fill="none"
          stroke="#1a1a1a"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Glow duplicate (blurred) */}
        {progressPath && (
          <path
            d={progressPath}
            fill="none"
            stroke={color}
            strokeWidth={stroke + 6}
            strokeLinecap="round"
            opacity={0.25}
            style={{ filter: "blur(6px)", transition: "all 0.8s cubic-bezier(.4,0,.2,1)" }}
          />
        )}
        {/* Progress arc */}
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
        <span
          className="font-black leading-none"
          style={{ color, fontSize: size * 0.22, transition: "color 0.6s" }}
        >
          {displayed}
          <span style={{ fontSize: size * 0.11, color: "#555", fontWeight: 600 }}>%</span>
        </span>
        <span
          className="mt-1 font-semibold tracking-wide"
          style={{ color, fontSize: size * 0.065, transition: "color 0.6s" }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
