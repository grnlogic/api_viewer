"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RechartsComponentsProps {
  data: { time: string; cpu: number }[];
}

export function RechartsComponents({ data }: RechartsComponentsProps) {
  return (
    <ResponsiveContainer width="100%" height={120}>
      <LineChart data={data}>
        <XAxis dataKey="time" hide />
        <YAxis domain={[0, 30]} tickFormatter={(v) => `${v}%`} width={30} />
        <Tooltip
          formatter={(v) => (typeof v === "number" ? v.toFixed(2) + "%" : v)}
        />
        <Line type="monotone" dataKey="cpu" stroke="#8884d8" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
