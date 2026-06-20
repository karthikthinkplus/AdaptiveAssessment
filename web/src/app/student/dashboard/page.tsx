"use client";
import AppShell from "@/components/layout/AppShell";
import SimpleBarChart from "@/components/charts/SimpleBarChart";
import {
  STUDENT_STATS,
  TOPIC_STRENGTH, RECENT_ASSESSMENT, ASSESSMENTS
} from "@/lib/mockData";
import Link from "next/link";
import { ArrowRight, Eye, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

export default function StudentDashboard() {
  // Demo states to show empty states if required
  const [hasAssessments] = useState(true);

  const [stats, setStats] = useState({
    completedCount: ASSESSMENTS.filter(a => a.score !== undefined).length,
    avgScore: `${STUDENT_STATS.averageScore}%`,
    masteredCount: STUDENT_STATS.masteredTopics.value,
    opportunitiesCount: 4,
    recentAssessmentScore: RECENT_ASSESSMENT.score,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("current_role", "student");
      const savedAnswers = localStorage.getItem("assessment_answers_session-001") || localStorage.getItem("assessment_answers");
      if (savedAnswers) {
        const answers = JSON.parse(savedAnswers) as Record<number, string>;
        const q1Correct = answers[0] === "B";
        const q2Correct = answers[1] === "B";
        const q3Correct = answers[2] === "A";
        
        let correctCount = 0;
        if (q1Correct) correctCount++;
        if (q2Correct) correctCount++;
        if (q3Correct) correctCount++;
        
        const calculatedScore = Math.round((correctCount / 3) * 100);
        const totalScore = 76 + calculatedScore; // 76 from existing session-002
        const totalCompleted = 2;
        const computedAvg = Math.round(totalScore / totalCompleted);
        
        let newMastered = 0;
        if (q1Correct) newMastered += 2; // Linear & Polynomial
        if (q3Correct) newMastered += 1; // Quadratic
        if (q2Correct) newMastered += 1; // Speed
        if (calculatedScore >= 75) newMastered += 1; // Data Interpretation
        
        const computedMastered = 12 + newMastered;
        
        window.setTimeout(() => {
          setStats({
            completedCount: totalCompleted,
            avgScore: `${computedAvg}%`,
            masteredCount: computedMastered,
            opportunitiesCount: 8 - newMastered,
            recentAssessmentScore: calculatedScore,
          });
        }, 0);
      }
    }
  }, []);

  return (
    <AppShell role="student" userName="Arjun Kumar" userAvatar="AK" title="Student Dashboard">
      {/* ── Header Area ────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.375rem", fontWeight: 700 }}>
            Welcome Back, Arjun Kumar
          </h1>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link href="/assessment/start" className="tp-btn-primary">
            Take a Test <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* ── Assessment Summary Cards ────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { title: "Assessments Completed", value: stats.completedCount },
          { title: "Average Performance", value: stats.avgScore },
          { title: "Mastered Topics", value: stats.masteredCount },
          { title: "Improvement Opportunities", value: stats.opportunitiesCount },
        ].map((c, i) => (
          <div key={i} className="tp-stat-card animate-fade-in-up" style={{ animationDelay: `${i * 0.07}s`, justifyContent: "center", height: "100%" }}>
            <div>
              <div className="tp-stat-label" style={{ fontWeight: 600, fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>{c.title}</div>
              <div className="tp-stat-value" style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--text-primary)" }}>{c.value}</div>
            </div>
          </div>
        ))}
      </div>

      {hasAssessments ? (
        <>
          {/* ── Analytics Section (Condition: Completed Assessments Exist) ── */}
          <div style={{ marginBottom: "1.5rem" }} className="animate-fade-in-up">
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
              Learning Analytics
            </h2>
          </div>

          {/* Main Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: "1.25rem", marginBottom: "1.5rem" }} className="animate-fade-in-up">
            {/* Recent Assessment */}
            <div className="tp-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Recent Assessment</div>
                  <div style={{ fontWeight: 700, fontSize: "0.9375rem" }}>{RECENT_ASSESSMENT.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                    {RECENT_ASSESSMENT.date} · {RECENT_ASSESSMENT.questions} Questions
                  </div>
                </div>
                <Link href="/report/latest" style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
                  <Eye size={12} /> View Report
                </Link>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "3rem", fontWeight: 900, color: "var(--primary)", letterSpacing: "-0.04em", lineHeight: 1 }}>
                    {stats.recentAssessmentScore}%
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Good Performance</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Overall Progress</div>
                  <div className="tp-progress-track">
                    <div className="tp-progress-fill success" style={{ width: `${stats.recentAssessmentScore}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Overview — mini chart */}
            <div className="tp-card">
              <div style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: "1rem" }}>Performance Overview</div>
              <SimpleBarChart
                data={[
                  { assessment: "Math Test", score: stats.recentAssessmentScore },
                  { assessment: "Number Quiz", score: 76 },
                  { assessment: "Chemistry", score: 85 },
                ]}
                xKey="assessment"
                bars={[
                  { key: "score", color: "var(--primary)", name: "Score" },
                ]}
                height={160}
              />
            </div>

            {/* Topic Strength */}
            <div className="tp-card">
              <div style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: "1rem" }}>Topic Strength</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {TOPIC_STRENGTH.map((t) => (
                  <div key={t.topic}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.25rem" }}>
                      <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{t.topic}</span>
                      <span style={{ fontWeight: 700, color: t.score >= 75 ? "var(--success)" : t.score >= 55 ? "var(--warning)" : "var(--danger)" }}>
                        {t.score}%
                      </span>
                    </div>
                    <div className="tp-progress-track">
                      <div className={`tp-progress-fill ${t.score >= 75 ? "success" : t.score >= 55 ? "warning" : "danger"}`} style={{ width: `${t.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </>
      ) : (
        /* ── Analytics Empty State (Condition: No Assessments Completed) ── */
        <div className="animate-fade-in-up" style={{ padding: "4rem 2rem" }}>
          {/* Analytics Section Title in Empty State */}
          <div style={{ marginBottom: "2rem", textAlign: "center" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
              Learning Analytics
            </h2>
          </div>

          <div className="tp-card" style={{ maxWidth: 500, margin: "0 auto", padding: "3rem 2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle size={30} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                No assessment data available.
              </h3>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Complete an assessment to begin tracking your learning progress.
              </p>
            </div>
            <Link href="/assessment/start" className="tp-btn-primary" style={{ padding: "0.625rem 1.5rem" }}>
              Begin Assessment
            </Link>
          </div>
        </div>
      )}
    </AppShell>
  );
}
