"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { ArrowRight, Eye, AlertTriangle } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import SimpleBarChart from "@/components/charts/SimpleBarChart";

export default function StudentDashboard() {
  const [hasAssessments, setHasAssessments] = useState(false);
  const [topicsCount, setTopicsCount] = useState(0);
  const [stats, setStats] = useState({
    completedCount: 0,
    avgScore: "0%",
    masteredCount: 0,
    opportunitiesCount: 0,
    recentAssessmentScore: 0,
  });
  const [topicStrengths, setTopicStrengths] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [recentTest, setRecentTest] = useState<{ name: string; date: string; questions: number } | null>(null);
  const [userName, setUserName] = useState("Student");
  const [userAvatar, setUserAvatar] = useState("S");

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("current_role", "student");
      const tpUser = sessionStorage.getItem("tp_user");
      const user = tpUser ? JSON.parse(tpUser) : null;

      if (user) {
        setUserName(user.name || "Student");
        setUserAvatar(user.avatar || "S");
      }

      const fetchAnalytics = (studentId: string, topicsMap: Map<string, string>) => {
        api.get<any>(`/api/v1/analytics/student/${studentId}`).then((res) => {
          if (res) {
            const sessionsCount = res.total_sessions || 0;
            setHasAssessments(sessionsCount > 0);

            let mastered = 0;
            if (res.mastery_distribution) {
              mastered = Object.values(res.mastery_distribution).reduce((a: any, b: any) => a + b, 0) as number;
            }

            setStats({
              completedCount: sessionsCount,
              avgScore: `${Math.round(res.accuracy)}%`,
              masteredCount: mastered,
              opportunitiesCount: Math.max(0, topicsMap.size - mastered),
              recentAssessmentScore: Math.round(res.accuracy),
            });

            if (res.latest_theta_by_topic) {
              const strengths = Object.entries(res.latest_theta_by_topic).map(([topicId, theta]: any) => ({
                topic: topicsMap.get(topicId) || "Mathematics",
                score: Math.min(100, Math.max(0, Math.round((theta + 3) / 6 * 100)))
              }));
              setTopicStrengths(strengths);
            }
          }
        }).catch((err) => {
          console.error("Failed to load student analytics from API", err);
          loadMockDashboard(topicsMap.size);
        });
      };

      api.get<any[]>("/api/v1/topics").then((resTopics) => {
        const topicsList = Array.isArray(resTopics) ? resTopics : [];
        const topicsMap = new Map(topicsList.map(t => [t.id, t.name]));
        const count = topicsList.length;
        setTopicsCount(count);

        api.get<any>("/api/v1/students/me").then((student) => {
          if (student && student.id) {
            if (user) {
              user.student_id = student.id;
              sessionStorage.setItem("tp_user", JSON.stringify(user));
            }

            api.get<any[]>("/api/v1/learning/sessions").then((resSess) => {
              const sessionsList = Array.isArray(resSess) ? resSess : [];
              const completedSessions = sessionsList
                .filter(s => s.status === "completed")
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

              // Calculate streak count
              let streak = 0;
              if (completedSessions.length > 0) {
                const dates = Array.from(new Set(
                  completedSessions.map(s => new Date(s.ended_at || s.created_at).toDateString())
                )).map(d => new Date(d));
                dates.sort((a, b) => b.getTime() - a.getTime());

                const today = new Date();
                today.setHours(0,0,0,0);
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);

                const mostRecent = dates[0];
                mostRecent.setHours(0,0,0,0);

                if (mostRecent.getTime() >= yesterday.getTime()) {
                  streak = 1;
                  let currentCompare = mostRecent;
                  for (let i = 1; i < dates.length; i++) {
                    const d = dates[i];
                    d.setHours(0,0,0,0);
                    const diffDays = Math.round((currentCompare.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
                    if (diffDays === 1) {
                      streak++;
                      currentCompare = d;
                    } else if (diffDays > 1) {
                      break;
                    }
                  }
                }
              }
              sessionStorage.setItem("tp_streak", String(streak));
              window.dispatchEvent(new Event("storage"));

              if (completedSessions.length > 0) {
                const latestSess = completedSessions[0];
                const topicName = topicsMap.get(latestSess.topic_id) || "Adaptive Assessment";
                const dateStr = new Date(latestSess.ended_at || latestSess.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                });

                setRecentTest({
                  name: topicName,
                  date: dateStr,
                  questions: latestSess.total_questions_attempted || 15
                });

                fetchAnalytics(student.id, topicsMap);

                // Load performance trends list (last 5 sessions)
                Promise.all(completedSessions.slice(0, 5).map(async (sess) => {
                  try {
                    const sAnalytics = await api.get<any>(`/api/v1/analytics/session/${sess.id}`);
                    return {
                      assessment: topicsMap.get(sess.topic_id) || "Test",
                      score: Math.round(sAnalytics.accuracy)
                    };
                  } catch {
                    return null;
                  }
                })).then((chartDataList) => {
                  setPerformanceData(chartDataList.filter(Boolean) as any[]);
                });

              } else {
                loadMockDashboard(count);
              }
            }).catch((err) => {
              console.error("Failed to fetch learning sessions from API", err);
              loadMockDashboard(count);
            });

          } else {
            loadMockDashboard(count);
          }
        }).catch((err) => {
          console.error("Failed to fetch current student profile", err);
          loadMockDashboard(count);
        });

      }).catch((err) => {
        console.error("Failed to load topics", err);
        loadMockDashboard(0);
      });

      function loadMockDashboard(tCount: number) {
        setHasAssessments(false);
        setStats({
          completedCount: 0,
          avgScore: "0%",
          masteredCount: 0,
          opportunitiesCount: tCount,
          recentAssessmentScore: 0,
        });
        setTopicStrengths([]);
        setPerformanceData([]);
        setRecentTest(null);
        sessionStorage.setItem("tp_streak", "0");
        window.dispatchEvent(new Event("storage"));
      }
    }
  }, []);

  return (
    <AppShell role="student" userName={userName} userAvatar={userAvatar} title="Student Dashboard">
      {/* ── Header Area ────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.375rem", fontWeight: 700 }}>
            Welcome Back, {userName}
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
                  <div style={{ fontWeight: 700, fontSize: "0.9375rem" }}>{recentTest?.name || "Adaptive Assessment"}</div>
                  {recentTest && (
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                      {recentTest.date} · {recentTest.questions} Questions
                    </div>
                  )}
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
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                    {stats.recentAssessmentScore >= 85 ? "Excellent Performance" : stats.recentAssessmentScore >= 60 ? "Good Performance" : "Needs Improvement"}
                  </div>
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
                data={performanceData.length > 0 ? performanceData : [
                  { assessment: "Recent", score: stats.recentAssessmentScore }
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
                {topicStrengths.map((t) => (
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
