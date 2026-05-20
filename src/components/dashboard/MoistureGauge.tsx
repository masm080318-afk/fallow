"use client";

export default function MoistureGauge({
  value,
  size = 200,
}: {
  value: number;
  size?: number;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const color =
    clamped < 30 ? "#ef4444" : clamped < 50 ? "#eab308" : "#22c55e";

  const stroke = 14;
  const radius = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // 270° arc from 135° (bottom-left) clockwise to 45° (bottom-right)
  const startAngle = 135;
  const endAngle = 405; // 360 + 45
  const sweep = endAngle - startAngle; // 270
  const polar = (angleDeg: number) => {
    const a = (angleDeg * Math.PI) / 180;
    return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
  };

  const start = polar(startAngle);
  const end = polar(endAngle);
  const largeArc = sweep > 180 ? 1 : 0;
  const bgPath = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;

  const progressAngle = startAngle + (sweep * clamped) / 100;
  const progressEnd = polar(progressAngle);
  const progressLarge = progressAngle - startAngle > 180 ? 1 : 0;
  const progressPath = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${progressLarge} 1 ${progressEnd.x} ${progressEnd.y}`;

  return (
    <div
      className="relative inline-block"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size}>
        <path
          d={bgPath}
          fill="none"
          stroke="#262626"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <path
          d={progressPath}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          style={{ transition: "all 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold" style={{ color }}>
          {Math.round(clamped)}
          <span className="text-2xl text-muted">%</span>
        </span>
        <span className="text-xs text-muted mt-1 uppercase tracking-wider">
          Moisture
        </span>
      </div>
    </div>
  );
}
