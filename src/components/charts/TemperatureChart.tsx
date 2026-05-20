"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface Point {
  t: number;
  label: string;
  temperature: number;
}

export default function TemperatureChart({ data }: { data: Point[] }) {
  return (
    <div className="card">
      <h3 className="text-sm uppercase tracking-wider text-muted mb-3">
        Temperature
      </h3>
      <div className="h-64 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 12, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              stroke="#a3a3a3"
              fontSize={11}
              tickLine={false}
            />
            <YAxis
              stroke="#a3a3a3"
              fontSize={11}
              tickLine={false}
              unit="°F"
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                background: "#141414",
                border: "1px solid #262626",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#a3a3a3" }}
            />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#f97316"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: "#f97316" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
