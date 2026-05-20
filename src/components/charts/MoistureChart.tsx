"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts";

interface Point {
  t: number;
  label: string;
  moisture: number;
}

export default function MoistureChart({
  data,
  threshold,
}: {
  data: Point[];
  threshold: number;
}) {
  return (
    <div className="card">
      <h3 className="text-sm uppercase tracking-wider text-muted mb-3">
        Soil moisture
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
              domain={[0, 100]}
              tickLine={false}
              unit="%"
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
            <ReferenceLine
              y={threshold}
              stroke="#ef4444"
              strokeDasharray="4 4"
              label={{
                value: `Threshold ${threshold}%`,
                fill: "#ef4444",
                fontSize: 10,
                position: "insideTopRight",
              }}
            />
            <Line
              type="monotone"
              dataKey="moisture"
              stroke="#22c55e"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: "#22c55e" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
