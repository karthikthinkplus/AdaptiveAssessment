"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface BarData { [key: string]: string | number; }

interface SimpleBarChartProps {
  data: BarData[];
  xKey: string;
  bars: { key: string; color: string; name?: string }[];
  height?: number;
  horizontal?: boolean;
}

export default function SimpleBarChart({ data, xKey, bars, height = 200, horizontal = false }: SimpleBarChartProps) {
  if (horizontal) {
    return (
      <ResponsiveContainer width="100%" height={height} minWidth={0}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
          <YAxis dataKey={xKey} type="category" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} width={90} />
          <Tooltip contentStyle={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, fontFamily: "Inter" }} />
          {bars.map(b => (
            <Bar key={b.key} dataKey={b.key} fill={b.color} name={b.name || b.key} radius={[0, 4, 4, 0]} barSize={10} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height} minWidth={0}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "var(--text-secondary)" }} />
        <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} domain={[0, 100]} />
        <Tooltip contentStyle={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, fontFamily: "Inter" }} />
        {bars.map(b => (
          <Bar key={b.key} dataKey={b.key} fill={b.color} name={b.name || b.key} radius={[4, 4, 0, 0]} barSize={18} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
