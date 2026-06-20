"use client";
import { RADAR_DATA } from "@/lib/mockData";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface SkillPieChartProps {
  data?: { dimension: string; score: number; average?: number }[];
  height?: number;
}

// Muted pastel palette — softer on the eye
const COLORS = ["#E8A0C4", "#7DC5E0", "#85CFA1", "#E8D080", "#F0B8AC", "#C4B0F0"];

export default function SkillPieChart({ data = RADAR_DATA, height = 200 }: SkillPieChartProps) {
  const strengths  = data.filter(d => d.score >= 70);
  const weaknesses = data.filter(d => d.score <  70);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap", justifyContent: "space-between" }}>

        {/* Pie Chart + Legend */}
        <div style={{ flex: 1, minWidth: 180, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "100%", height: height }}>
            <ResponsiveContainer width="100%" height={height} minWidth={0}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  dataKey="score"
                  nameKey="dimension"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                  formatter={(value) => [`${value}%`, "Mastery"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Color Legend */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.75rem", padding: "0 0.5rem" }}>
            {data.map((d, index) => {
              const color = COLORS[index % COLORS.length];
              return (
                <div key={d.dimension} style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
                  <span>{d.dimension}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Strengths & Weaknesses — side by side */}
        <div style={{ flex: 1.2, minWidth: 200, display: "flex", flexDirection: "row", gap: "1rem" }}>

          {/* Strengths */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--success)", display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", flexShrink: 0 }} />
              Strengths
            </div>
            {strengths.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                {strengths.map((s) => {
                  const color = COLORS[data.findIndex(d => d.dimension === s.dimension) % COLORS.length];
                  return (
                    <span
                      key={s.dimension}
                      style={{
                        fontSize: "0.7rem",
                        padding: "0.2rem 0.55rem",
                        borderRadius: "12px",
                        background: `${color}22`,
                        color: "var(--text-secondary)",
                        border: `1px solid ${color}55`,
                        fontWeight: 600
                      }}
                    >
                      {s.dimension}
                    </span>
                  );
                })}
              </div>
            ) : (
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontStyle: "italic" }}>None identified</div>
            )}
          </div>

          {/* Weaknesses */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--danger)", display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--danger)", flexShrink: 0 }} />
              Weaknesses
            </div>
            {weaknesses.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                {weaknesses.map((w) => {
                  const color = COLORS[data.findIndex(d => d.dimension === w.dimension) % COLORS.length];
                  return (
                    <span
                      key={w.dimension}
                      style={{
                        fontSize: "0.7rem",
                        padding: "0.2rem 0.55rem",
                        borderRadius: "12px",
                        background: `${color}22`,
                        color: "var(--text-secondary)",
                        border: `1px solid ${color}55`,
                        fontWeight: 600
                      }}
                    >
                      {w.dimension}
                    </span>
                  );
                })}
              </div>
            ) : (
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontStyle: "italic" }}>None! Excellent mastery</div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
