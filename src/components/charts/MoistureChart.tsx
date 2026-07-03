"use client";

import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, CartesianGrid,
} from "recharts";

interface Point {
  t: number;
  label: string;
  moisture: number;
  prevMoisture?: number | null;
}

export default function MoistureChart({
  data,
  threshold,
  comparing = false,
}: {
  data: Point[];
  threshold: number;
  comparing?: boolean;
}) {
  const hasPrev = comparing && data.some((d) => d.prevMoisture != null);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-label">Soil moisture</h3>
        {hasPrev && (
          <div className="flex items-center gap-3 text-xs" style={{ color: "var(--ink-soft)" }}>
            <span className="flex items-center gap-1">
              <span className="inline-block w-4 h-0.5" style={{ background: "#2E6B1F" }} /> Now
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-4 h-0.5 border-t-2 border-dashed" style={{ borderColor: "#2E6B1F", opacity: 0.4 }} /> Prev
            </span>
          </div>
        )}
      </div>
      <div className="h-64 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 12, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="#DCDAD1" strokeDasharray="3 3" />
            <XAxis dataKey="label" stroke="#5C6156" fontSize={11} tickLine={false} />
            <YAxis stroke="#5C6156" fontSize={11} domain={[0, 100]} tickLine={false} unit="%" />
            <Tooltip
              contentStyle={{ background: "#ffffff", border: "1px solid #DCDAD1", borderRadius: 8, fontSize: 12, color: "#1A1D17" }}
              labelStyle={{ color: "#1A1D17" }}
              formatter={(val, name) => [
                val != null ? `${val}%` : "—",
                name === "moisture" ? "Moisture" : "Prev period",
              ]}
            />
            <ReferenceLine
              y={threshold}
              stroke="#A8442A"
              strokeDasharray="4 4"
              label={{ value: `Threshold ${threshold}%`, fill: "#A8442A", fontSize: 10, position: "insideTopRight" }}
            />
            <Line type="monotone" dataKey="moisture" stroke="#2E6B1F" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: "#2E6B1F" }} name="moisture" />
            {hasPrev && (
              <Line type="monotone" dataKey="prevMoisture" stroke="#2E6B1F" strokeWidth={1.5} dot={false} strokeDasharray="3 3" strokeOpacity={0.4} activeDot={{ r: 3 }} name="prevMoisture" connectNulls />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
