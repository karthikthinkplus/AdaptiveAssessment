"use client";

import RouteGuard from "@/components/auth/RouteGuard";
import AppShell from "@/components/layout/AppShell";
import SkillPieChart from "@/components/charts/SkillPieChart";
import SimpleBarChart from "@/components/charts/SimpleBarChart";
import { readSessionUser } from "@/lib/browserState";
import { BarChart2, ClipboardList, Target } from "lucide-react";
import { useMemo, useState } from "react";

type AnalyticsMode = "assessment" | "practice";

const analyticsData = {
  assessment: {
    label: "Assessment",
    description: "Class-wide adaptive and formal assessment performance.",
    mastery: [
      { dimension: "Arithmetic", score: 76 },
      { dimension: "Algebra", score: 69 },
      { dimension: "DILR", score: 64 },
      { dimension: "Verbal Ability", score: 81 }
    ],
    participation: [
      { name: "Adaptive 1", rate: 92 },
      { name: "Arithmetic Test", rate: 88 },
      { name: "Algebra Test", rate: 84 },
      { name: "DILR Mock", rate: 79 }
    ],
    trends: [
      { week: "Week 1", score: 68 },
      { week: "Week 2", score: 71 },
      { week: "Week 3", score: 70 },
      { week: "Week 4", score: 75 }
    ],
    topStudents: [
      { name: "Aarav", score: 94 },
      { name: "Divya", score: 92 },
      { name: "Neha", score: 89 },
      { name: "Priya", score: 88 }
    ]
  },
  practice: {
    label: "Practice",
    description: "Average analytics from student topic-practice performance.",
    mastery: [
      { dimension: "Time & Work", score: 72 },
      { dimension: "Ratio", score: 58 },
      { dimension: "Progressions", score: 86 },
      { dimension: "Arrangements", score: 63 }
    ],
    participation: [
      { name: "Arithmetic Booster", rate: 82 },
      { name: "Algebra Sprint", rate: 76 },
      { name: "DILR Drill", rate: 69 },
      { name: "Verbal Practice", rate: 73 }
    ],
    trends: [
      { week: "Week 1", score: 61 },
      { week: "Week 2", score: 66 },
      { week: "Week 3", score: 70 },
      { week: "Week 4", score: 74 }
    ],
    topStudents: [
      { name: "Saanvi", score: 91 },
      { name: "Meera", score: 88 },
      { name: "Ishaan", score: 84 },
      { name: "Rohan", score: 81 }
    ]
  }
};

export default function TeacherAnalyticsPage() {
  const [user] = useState(() => readSessionUser({ name: "Teacher", avatar: "T", role: "teacher" }));
  const [mode, setMode] = useState<AnalyticsMode>("assessment");
  const [selectedClass, setSelectedClass] = useState("Class 10 - A");
  const [selectedSubject, setSelectedSubject] = useState("Math");

  const classScale = selectedClass === "Class 10 - B" ? 0.88 : 1;
  const selectedData = analyticsData[mode];
  const scaledData = useMemo(() => ({
    mastery: selectedData.mastery.map((item) => ({ ...item, score: Math.round(item.score * classScale) })),
    participation: selectedData.participation.map((item) => ({ ...item, rate: Math.round(item.rate * classScale) })),
    trends: selectedData.trends.map((item) => ({ ...item, score: Math.round(item.score * classScale) })),
    topStudents: selectedData.topStudents.map((item) => ({ ...item, score: Math.round(item.score * classScale) }))
  }), [classScale, selectedData]);

  const averageScore = Math.round(
    scaledData.trends.reduce((total, item) => total + item.score, 0) / scaledData.trends.length
  );
  const averageParticipation = Math.round(
    scaledData.participation.reduce((total, item) => total + item.rate, 0) / scaledData.participation.length
  );
  const strongestTopic = scaledData.mastery.reduce((best, item) => item.score > best.score ? item : best, scaledData.mastery[0]);

  return (
    <RouteGuard allowedRoles={["teacher"]}>
      <AppShell role="teacher" userName={user.name} userAvatar={user.avatar} title="Performance Analytics">
        <div className="teacher-analytics-page">
          <section className="teacher-analytics-toolbar">
            <div>
              <span><BarChart2 size={16} /> Analytics View</span>
              <h1>{selectedData.label} Analytics</h1>
              <p>{selectedData.description}</p>
            </div>

            <div className="teacher-analytics-controls">
              <div className="teacher-analytics-toggle">
                <button type="button" className={mode === "assessment" ? "active" : ""} onClick={() => setMode("assessment")}>
                  <ClipboardList size={15} /> Assessments
                </button>
                <button type="button" className={mode === "practice" ? "active" : ""} onClick={() => setMode("practice")}>
                  <Target size={15} /> Practice
                </button>
              </div>

              <select className="tp-select" value={selectedClass} onChange={(event) => setSelectedClass(event.target.value)}>
                <option value="Class 10 - A">Class 10 - A</option>
                <option value="Class 10 - B">Class 10 - B</option>
              </select>
              <select className="tp-select" value={selectedSubject} onChange={(event) => setSelectedSubject(event.target.value)}>
                <option value="Math">Math</option>
              </select>
            </div>
          </section>

          <section className="teacher-analytics-metrics">
            <article><span>Average Score</span><strong>{averageScore}%</strong></article>
            <article><span>{mode === "practice" ? "Avg Practice Completion" : "Avg Participation"}</span><strong>{averageParticipation}%</strong></article>
            <article><span>Strongest Topic</span><strong>{strongestTopic.dimension}</strong></article>
          </section>

          <div className="teacher-analytics-grid">
            <div className="tp-card">
              <h3>Topic Mastery Distribution</h3>
              <p>{mode === "practice" ? "Average topic practice mastery class-wide" : "Average assessment mastery status class-wide"}</p>
              <SkillPieChart data={scaledData.mastery} height={180} />
            </div>

            <div className="tp-card">
              <h3>{mode === "practice" ? "Practice Completion" : "Assessment Participation"}</h3>
              <p>{mode === "practice" ? "Student completion rates across active practice sessions" : "Student submission rates across recent assessments"}</p>
              <SimpleBarChart
                data={scaledData.participation}
                xKey="name"
                bars={[{ key: "rate", color: "var(--primary)", name: mode === "practice" ? "Completion %" : "Participation %" }]}
                height={180}
              />
            </div>

            <div className="tp-card">
              <h3>{mode === "practice" ? "Practice Performance Trends" : "Assessment Performance Trends"}</h3>
              <p>Average student score trajectory over the last 4 weeks</p>
              <SimpleBarChart
                data={scaledData.trends}
                xKey="week"
                bars={[{ key: "score", color: "var(--primary)", name: "Avg Score %" }]}
                height={180}
              />
            </div>

            <div className="tp-card">
              <h3>{mode === "practice" ? "Top Practice Performers" : "Top Assessment Performers"}</h3>
              <p>{mode === "practice" ? "Highest average practice scores" : "Highest diagnostic average score rankings"}</p>
              <SimpleBarChart
                data={scaledData.topStudents}
                xKey="name"
                bars={[{ key: "score", color: "var(--primary)", name: "Score" }]}
                height={180}
              />
            </div>
          </div>
        </div>
      </AppShell>
    </RouteGuard>
  );
}
