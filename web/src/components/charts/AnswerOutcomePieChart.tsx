"use client";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type AnswerOutcome = {
  label: string;
  count: number;
  color: string;
};

interface AnswerOutcomePieChartProps {
  correct: number;
  wrong: number;
  guesses: number;
  height?: number;
}

export default function AnswerOutcomePieChart({ correct, wrong, guesses, height = 220 }: AnswerOutcomePieChartProps) {
  const data: AnswerOutcome[] = [
    { label: "Correct Answers", count: correct, color: "#4FCB8D" },
    { label: "Wrong Answers", count: wrong, color: "#FF8F8F" },
    { label: "Guesses", count: guesses, color: "#F4C84D" },
  ];
  const total = correct + wrong + guesses;
  const chartData = data.filter((item) => item.count > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
      <div style={{ width: "100%", height, position: "relative" }}>
        <ResponsiveContainer width="100%" height={height} minWidth={0}>
          <PieChart>
            <Pie
              data={chartData.length > 0 ? chartData : [{ label: "No Responses", count: 1, color: "var(--border)" }]}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={78}
              paddingAngle={4}
              dataKey="count"
              nameKey="label"
            >
              {(chartData.length > 0 ? chartData : [{ color: "var(--border)" }]).map((entry, index) => (
                <Cell key={`answer-outcome-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 13,
                fontFamily: "Inter",
              }}
              formatter={(value, name) => [`${value}`, name]}
            />
          </PieChart>
        </ResponsiveContainer>

        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.65rem", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1 }}>{total}</div>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Answers</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.65rem" }}>
        {data.map((item) => (
          <div key={item.label} style={{ border: "1px solid var(--border)", borderRadius: 12, background: "#fff", padding: "0.7rem", textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem", marginBottom: "0.25rem" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
              <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{item.label}</span>
            </div>
            <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1 }}>{item.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
