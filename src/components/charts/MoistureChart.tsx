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
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm uppercase tracking-wider text-muted">Soil moisture</h3>
        {hasPrev && (
          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-1">
              <span className="inline-block w-4 h-0.5" style={{ background: "#22c55e" }} /> Now
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-4 h-0.5 border-t-2 border-dashed" style={{ borderColor: "#22c55e", opacity: 0.4 }} /> Prev
            </span>
          </div>
        )}
      </div>
      <div className="h-64 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 12, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="#dfe8dc" strokeDasharray="3 3" />
            <XAxis dataKey="label" stroke="#9aaa9a" fontSize={11} tickLine={false} />
            <YAxis stroke="#9aaa9a" fontSize={11} domain={[0, 100]} tickLine={false} unit="%" />
            <Tooltip
              contentStyle={{ background: "#ffffff", border: "1px solid #dfe8dc", borderRadius: 8, fontSize: 12, color: "#1c2c1a" }}
              labelStyle={{ color: "#1c2c1a" }}
              formatter={(val: number, name: string) => [
                val != null ? `${val}%` : "—",
                name === "moisture" ? "Moisture" : "Prev period",
              ]}
            />
            <ReferenceLine
              y={threshold}
              stroke="#ef4444"
              strokeDasharray="4 4"
              label={{ value: `Threshold ${threshold}%`, fill: "#ef4444", fontSize: 10, position: "insideTopRight" }}
            />
            <Line type="monotone" dataKey="moisture" stroke="#22c55e" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: "#22c55e" }} name="moisture" />
            {hasPrev && (
              <Line type="monotone" dataKey="prevMoisture" stroke="#22c55e" strokeWidth={1.5} dot={false} strokeDasharray="3 3" strokeOpacity={0.4} activeDot={{ r: 3 }} name="prevMoisture" connectNulls />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
