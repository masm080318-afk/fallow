"use client";

import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

interface Point {
  t: number;
  label: string;
  temperature: number;
  outdoorTemp?: number | null;
  prevTemperature?: number | null;
}

export default function TemperatureChart({
  data,
  comparing = false,
  hasLocation = false,
}: {
  data: Point[];
  comparing?: boolean;
  hasLocation?: boolean;
}) {
  const hasOutdoor = hasLocation && data.some((d) => d.outdoorTemp != null);
  const hasPrev = comparing && data.some((d) => d.prevTemperature != null);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm uppercase tracking-wider text-muted">Temperature</h3>
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <span className="inline-block w-4 h-0.5" style={{ background: "#f97316" }} /> Sensor
          </span>
          {hasOutdoor && (
            <span className="flex items-center gap-1">
              <span className="inline-block w-4 h-0.5 border-t-2 border-dashed" style={{ borderColor: "#3b82f6" }} /> Outdoor
            </span>
          )}
          {hasPrev && (
            <span className="flex items-center gap-1">
              <span className="inline-block w-4 h-0.5 border-t-2 border-dashed" style={{ borderColor: "#f97316", opacity: 0.4 }} /> Prev period
            </span>
          )}
        </div>
      </div>
      <div className="h-64 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 12, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="#dfe8dc" strokeDasharray="3 3" />
            <XAxis dataKey="label" stroke="#9aaa9a" fontSize={11} tickLine={false} />
            <YAxis stroke="#9aaa9a" fontSize={11} tickLine={false} unit="°F" domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{ background: "#ffffff", border: "1px solid #dfe8dc", borderRadius: 8, fontSize: 12, color: "#1c2c1a" }}
              labelStyle={{ color: "#1c2c1a" }}
              formatter={(val: number, name: string) => [
                val != null ? `${val.toFixed(1)}°F` : "—",
                name === "temperature" ? "Sensor" : name === "outdoorTemp" ? "Outdoor" : "Prev period",
              ]}
            />
            <Line type="monotone" dataKey="temperature" stroke="#f97316" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: "#f97316" }} name="temperature" />
            {hasOutdoor && (
              <Line type="monotone" dataKey="outdoorTemp" stroke="#3b82f6" strokeWidth={1.5} dot={false} strokeDasharray="5 3" activeDot={{ r: 3, fill: "#3b82f6" }} name="outdoorTemp" connectNulls />
            )}
            {hasPrev && (
              <Line type="monotone" dataKey="prevTemperature" stroke="#f97316" strokeWidth={1.5} dot={false} strokeDasharray="3 3" strokeOpacity={0.4} activeDot={{ r: 3 }} name="prevTemperature" connectNulls />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
