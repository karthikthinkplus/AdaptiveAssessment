"use client";
import AppShell from "@/components/layout/AppShell";
import SkillPieChart from "@/components/charts/SkillPieChart";
import SimpleBarChart from "@/components/charts/SimpleBarChart";
import { TOPIC_PERFORMANCE_RADAR } from "@/lib/mockData";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

export default function TeacherAnalyticsPage() {
  const [hasData] = useState(true);
  const [selectedClass, setSelectedClass] = useState("Class 10 - A");
  const [selectedSubject, setSelectedSubject] = useState("Math");

  let classScale = 1.0;
  if (selectedClass === "Class 10 - B") {
    classScale = 0.88;
  }

  const radarData = TOPIC_PERFORMANCE_RADAR.map(item => ({
    ...item,
    score: Math.max(30, Math.round(item.score * classScale))
  }));

  const participationData = [
    { name: "Algebra Test 1", rate: Math.min(100, Math.round(95 * classScale)) },
    { name: "Number Theory 1", rate: Math.min(100, Math.round(88 * classScale)) },
    { name: "Geometry Mock", rate: Math.min(100, Math.round(92 * classScale)) },
    { name: "Trig Diagnostic", rate: Math.min(100, Math.round(84 * classScale)) },
  ];

  const trendsData = [
    { week: "Week 1", score: Math.round(68 * classScale) },
    { week: "Week 2", score: Math.round(71 * classScale) },
    { week: "Week 3", score: Math.round(70 * classScale) },
    { week: "Week 4", score: Math.round(75 * classScale) },
  ];

  const topStudentsData = [
    { name: selectedClass === "Class 10 - A" ? "Aarav" : "Sameer", score: Math.round(94 * classScale) },
    { name: selectedClass === "Class 10 - A" ? "Divya" : "Karan", score: Math.round(92 * classScale) },
    { name: selectedClass === "Class 10 - A" ? "Neha" : "Ritu", score: Math.round(89 * classScale) },
    { name: selectedClass === "Class 10 - A" ? "Priya" : "Tina", score: Math.round(88 * classScale) },
  ];

  return (
    <AppShell title="Performance Analytics">
      <div className="animate-fade-in-up" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        

        {hasData ? (
          <>
            {/* Filters bar */}
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <select 
                className="tp-select" 
                style={{ width: 160 }}
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
              >
                <option value="Class 10 - A">Class 10 - A</option>
                <option value="Class 10 - B">Class 10 - B</option>
              </select>
              <select 
                className="tp-select" 
                style={{ width: 140 }}
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
              >
                <option value="Math">Math</option>
              </select>
            </div>

            {/* Charts Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              
              {/* Chart 1: Topic Mastery Distribution */}
              <div className="tp-card">
                <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", marginBottom: "0.25rem" }}>Topic Mastery Distribution</h3>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "1rem" }}>Average mastery status breakdown class-wide</p>
                <SkillPieChart data={radarData} height={180} />
              </div>

              {/* Chart 2: Assessment Participation */}
              <div className="tp-card">
                <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", marginBottom: "0.25rem" }}>Assessment Participation</h3>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "1rem" }}>Student submission rates across recent assessments</p>
                <SimpleBarChart
                  data={participationData}
                  xKey="name"
                  bars={[{ key: "rate", color: "var(--primary)", name: "Participation %" }]}
                  height={180}
                />
              </div>

              {/* Chart 3: Performance Trends */}
              <div className="tp-card">
                <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", marginBottom: "0.25rem" }}>Performance Trends</h3>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "1rem" }}>Average score trajectory over the last 4 weeks</p>
                <SimpleBarChart
                  data={trendsData}
                  xKey="week"
                  bars={[{ key: "score", color: "var(--success)", name: "Avg Score %" }]}
                  height={180}
                />
              </div>

              {/* Chart 4: Top Performing Students */}
              <div className="tp-card">
                <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", marginBottom: "0.25rem" }}>Top Performing Students</h3>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "1rem" }}>Highest diagnostic average score rankings</p>
                <SimpleBarChart
                  data={topStudentsData}
                  xKey="name"
                  bars={[{ key: "score", color: "var(--primary)", name: "Score" }]}
                  height={180}
                />
              </div>

            </div>
          </>
        ) : (
          /* ── Empty State ───────────────────────────────────────────── */
          <div className="tp-card animate-fade-in-up" style={{ maxWidth: 500, margin: "4rem auto", padding: "4rem 2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle size={30} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                Analytics will appear once assessment data becomes available.
              </h3>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Remedial suggestions, class performance averages, and statistics will display here once students submit tests.
              </p>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
