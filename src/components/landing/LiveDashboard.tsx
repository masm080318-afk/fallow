"use client";

import { useEffect, useState } from "react";

const SEQUENCE = [62, 58, 64, 60, 66, 61, 57, 63];
const CIRCUMFERENCE = 264;

/** Dashboard mock with a gauge that cycles through live-looking readings. */
export default function LiveDashboard() {
  const [moisture, setMoisture] = useState(SEQUENCE[0]);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % SEQUENCE.length;
      setMoisture(SEQUENCE[i]);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  const offset = (CIRCUMFERENCE * (1 - moisture / 100)).toFixed(1);

  return (
    <div
      style={{
        background: "var(--ink)",
        borderRadius: 24,
        padding: 22,
        boxShadow: "0 30px 60px -28px rgba(33,30,23,.55)",
      }}
    >
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "var(--leaf)", animation: "so-blink 1.8s infinite",
            }}
          />
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>North Field · Live</span>
        </div>
        <span style={{ color: "rgba(255,255,255,.4)", fontSize: 12 }}>updated just now</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: 16 }}>
        {/* gauge */}
        <div
          style={{
            background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
            borderRadius: 16, padding: 14, display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div style={{ position: "relative", width: 104, height: 104 }}>
            <svg width="104" height="104" viewBox="0 0 104 104" style={{ display: "block" }}>
              <circle cx="52" cy="52" r="42" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="10" />
              <circle
                cx="52" cy="52" r="42" fill="none" stroke="var(--leaf)" strokeWidth="10"
                strokeLinecap="round" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={offset}
                transform="rotate(-90 52 52)"
                style={{ transition: "stroke-dashoffset .9s cubic-bezier(.4,0,.2,1)" }}
              />
            </svg>
            <div
              style={{
                position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
              }}
            >
              <div style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 700, fontSize: 27, color: "#fff", lineHeight: 1 }}>
                {moisture}
                <span style={{ fontSize: 15 }}>%</span>
              </div>
              <div style={{ fontSize: 9.5, letterSpacing: ".08em", color: "rgba(255,255,255,.5)", fontWeight: 700, marginTop: 3 }}>
                MOISTURE
              </div>
            </div>
          </div>
        </div>

        {/* chart */}
        <div
          style={{
            background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
            borderRadius: 16, padding: 14, overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ color: "rgba(255,255,255,.7)", fontSize: 12, fontWeight: 600 }}>24-hour trend</span>
            <span style={{ color: "var(--leaf)", fontSize: 12, fontWeight: 700 }}>▲ stable</span>
          </div>
          <svg viewBox="0 0 260 92" width="100%" height="92" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lp-chartfill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#4C9A3A" stopOpacity="0.35" />
                <stop offset="1" stopColor="#4C9A3A" stopOpacity="0" />
              </linearGradient>
            </defs>
            <g style={{ animation: "so-wave 6s linear infinite" }}>
              <path
                d="M0 60 C20 50 40 66 64 54 C88 42 108 58 132 48 C156 38 176 56 200 44 C224 34 244 52 268 42 L332 42 L332 92 L0 92 Z"
                fill="url(#lp-chartfill)"
              />
              <path
                d="M0 60 C20 50 40 66 64 54 C88 42 108 58 132 48 C156 38 176 56 200 44 C224 34 244 52 268 42 L332 42"
                fill="none" stroke="#8FE06B" strokeWidth="2.5" strokeLinecap="round"
              />
            </g>
            <circle cx="200" cy="44" r="4" fill="#fff" style={{ animation: "so-spark 2s ease-in-out infinite" }} />
          </svg>
        </div>
      </div>

      {/* alert row */}
      <div
        style={{
          marginTop: 14, background: "rgba(228,180,65,.12)", border: "1px solid rgba(228,180,65,.3)",
          borderRadius: 12, padding: "11px 14px", display: "flex", alignItems: "center", gap: 10,
        }}
      >
        <span
          style={{
            width: 26, height: 26, borderRadius: 8, background: "var(--gold)",
            display: "grid", placeItems: "center", flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v6" stroke="#211E17" strokeWidth="2" strokeLinecap="round" />
            <circle cx="8" cy="12" r="1.2" fill="#211E17" />
          </svg>
        </span>
        <span style={{ color: "#fff", fontSize: 13 }}>
          Watering suggested by <strong>4:00 PM</strong>. Dry-down trending steep.
        </span>
      </div>
    </div>
  );
}
