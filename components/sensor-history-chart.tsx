"use client";

import { SensorReading } from "@/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Props {
  readings: SensorReading[];
}

function formatTime(ts: string): string {
  try {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  } catch {
    return ts;
  }
}

export function SensorHistoryChart({ readings }: Props) {
  const data = readings.map((r) => ({
    time: formatTime(r.timestamp),
    pH: r.ph != null ? parseFloat(r.ph.toFixed(2)) : null,
    TDS: r.tds != null ? Math.round(r.tds) : null,
    Turbidity: r.turbidity != null ? parseFloat(r.turbidity.toFixed(2)) : null,
  }));

  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Parameter Trend (last {readings.length} readings)
      </p>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "11px",
              color: "hsl(var(--foreground))",
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "10px", paddingTop: "8px" }}
          />
          <Line
            type="monotone"
            dataKey="pH"
            stroke="#06b6d4"
            strokeWidth={1.5}
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="TDS"
            stroke="#f59e0b"
            strokeWidth={1.5}
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="Turbidity"
            stroke="#8b5cf6"
            strokeWidth={1.5}
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
