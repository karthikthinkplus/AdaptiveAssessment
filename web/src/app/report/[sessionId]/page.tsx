"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { DIAGNOSTIC_REPORT, type SkillMastery } from "@/lib/mockData";
import AnswerOutcomePieChart from "@/components/charts/AnswerOutcomePieChart";
import SimpleBarChart from "@/components/charts/SimpleBarChart";
import Link from "next/link";
import PublicHeader from "@/components/layout/PublicHeader";
import { Download, Share2, LayoutDashboard } from "lucide-react";
import { api } from "@/lib/api";

const masteryColor = (m: number) => m >= 0.9 ? "var(--success)" : m >= 0.31 ? "var(--warning)" : "var(--danger)";

const getMasteryLabel = (m: number): "Mastered" | "Developing" | "Gap" => {
  if (m >= 0.9) return "Mastered";
  if (m >= 0.31) return "Developing";
  return "Gap";
};

const formatAverageTime = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
};

const getDashboardHref = () => {
  if (typeof window === "undefined") return "/student/dashboard";
  const session = sessionStorage.getItem("tp_user");
  const role = session ? JSON.parse(session).role : localStorage.getItem("current_role");

  if (role === "teacher") return "/teacher/dashboard";
  if (role === "qbm") return "/qbm/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/student/dashboard";
};

export default function DiagnosticReport() {
  const r = DIAGNOSTIC_REPORT;
  const params = useParams();
  const sessionId = (params?.sessionId as string) || "session-001";

  const [masteryData, setMasteryData] = useState<SkillMastery[]>(r.skillMastery);
  const [overallScore, setOverallScore] = useState<number>(r.overallScore);
  const [gradeEquivalent, setGradeEquivalent] = useState<string>(r.gradeEquivalent);
  const [answerOutcomes, setAnswerOutcomes] = useState({ correct: 2, wrong: 1, guesses: 0 });
  const [averageTimePerQuestion, setAverageTimePerQuestion] = useState(72);
  const thetaValue = r.abilityTheta.toFixed(2);
  const betaValue = (overallScore / 100).toFixed(2);
  const [dashboardHref, setDashboardHref] = useState("/student/dashboard");
  const [topicPerformance, setTopicPerformance] = useState([
    { topic: "Algebra", score: 62 },
    { topic: "Arithmetic", score: 90 },
  ]);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const triggerToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDashboardHref(getDashboardHref());
      const isMock = sessionId === "session-001" || sessionId === "session-002" || sessionId === "session-003" || sessionId === "latest";

      if (!isMock) {
        api.get<any>(`/api/v1/analytics/session/${sessionId}`).then((res) => {
          if (res) {
            setOverallScore(Math.round(res.accuracy));
            setGradeEquivalent(
              res.accuracy >= 90
                ? "Grade 10 Advanced"
                : res.accuracy >= 60
                  ? "Grade 10 Standard"
                  : "Grade 9 Remedial"
            );
            setAnswerOutcomes({
              correct: res.total_correct,
              wrong: Math.max(0, res.total_questions_attempted - res.total_correct),
              guesses: 0,
            });

            // Fetch the session details to get average time
            api.get<any>(`/api/v1/learning/sessions/${sessionId}`).then((sess) => {
              if (sess && sess.total_questions_attempted > 0) {
                setAverageTimePerQuestion(Math.max(1, Math.round(sess.total_time_seconds / sess.total_questions_attempted)));
              }
            }).catch(console.error);

            // Fetch the student's IRT trait or BKT states to populate masteryData
            const tpUser = sessionStorage.getItem("tp_user");
            const studentId = tpUser ? JSON.parse(tpUser).id : null;
            if (studentId) {
              api.get<any[]>(`/api/v1/adaptive/students/${studentId}/irt`).then((traits) => {
                if (traits && traits.length > 0) {
                  const mappedPerformance = traits.map((t: any) => ({
                    topic: "Mathematics",
                    score: Math.min(100, Math.max(0, Math.round((t.theta + 3) / 6 * 100)))
                  }));
                  setTopicPerformance(mappedPerformance);
                }
              }).catch(console.error);

              api.get<any[]>(`/api/v1/adaptive/students/${studentId}/bkt`).then((bkts) => {
                if (bkts && bkts.length > 0) {
                  const mappedMastery = bkts.map((b: any) => ({
                    skill: `Subtopic Mastery`,
                    topic: "Mathematics",
                    mastery: b.p_mastery,
                    label: getMasteryLabel(b.p_mastery)
                  }));
                  setMasteryData(mappedMastery);
                }
              }).catch(console.error);
            }
          }
        }).catch((err) => {
          console.error("Failed to load backend session analytics, using default mock fallback", err);
          loadMockStats();
        });
      } else {
        loadMockStats();
      }

      function loadMockStats() {
        const savedAnswers = localStorage.getItem(`assessment_answers_${sessionId}`) || 
                             (sessionId === "session-001" || sessionId === "latest" ? localStorage.getItem("assessment_answers") : null);
        const savedTime = localStorage.getItem(`assessment_time_${sessionId}`) ||
                          (sessionId === "session-001" || sessionId === "latest" ? localStorage.getItem("assessment_time") : null);
        
        let q1Correct = false;
        let q2Correct = false;
        let q3Correct = false;
        let calculatedScore = 82; // Fallback default score for session-001
        let answeredCount = 3;
        
        if (savedAnswers) {
          const answers = JSON.parse(savedAnswers) as Record<number, string>;
          q1Correct = answers[0] === "B";
          q2Correct = answers[1] === "B";
          q3Correct = answers[2] === "A";
          answeredCount = [0, 1, 2].filter((index) => Boolean(answers[index])).length;
          
          let correctCount = 0;
          if (q1Correct) correctCount++;
          if (q2Correct) correctCount++;
          if (q3Correct) correctCount++;
          
          calculatedScore = Math.round((correctCount / 3) * 100);
        } else {
          // Fallbacks for direct navigation without taking the test
          if (sessionId === "session-002") {
            q1Correct = false; // incorrect (Polynomials)
            q2Correct = true;  // correct (Speed & Percentage)
            q3Correct = true;  // correct (Quadratic & Mensuration)
            calculatedScore = 76;
          } else {
            // session-001 or fallback
            q1Correct = true;
            q2Correct = true;
            q3Correct = false;
            calculatedScore = 82;
          }
        }

        // Only show skills for the 3 questions actually tested in the assessment:
        const dynamicSkills: SkillMastery[] = [
          {
            skill: "Polynomial Evaluation",
            topic: "Algebra",
            mastery: q1Correct ? 0.92 : 0.28,
            label: q1Correct ? "Mastered" : "Gap",
          },
          {
            skill: "Speed, Distance & Time",
            topic: "Arithmetic",
            mastery: q2Correct ? 0.90 : 0.20,
            label: q2Correct ? "Mastered" : "Gap",
          },
          {
            skill: "Quadratic Equations",
            topic: "Algebra",
            mastery: q3Correct ? 0.92 : 0.15,
            label: q3Correct ? "Mastered" : "Gap",
          },
        ];
        const dynamicTopicPerformance = [
          {
            topic: "Algebra",
            score: Math.round(((q1Correct ? 1 : 0) + (q3Correct ? 1 : 0)) / 2 * 100),
          },
          {
            topic: "Arithmetic",
            score: q2Correct ? 100 : 0,
          },
        ];

        setOverallScore(calculatedScore);
        setGradeEquivalent(
          calculatedScore >= 90
            ? "Grade 10 Advanced"
            : calculatedScore >= 60
              ? "Grade 10 Standard"
              : "Grade 9 Remedial"
        );
        setMasteryData(dynamicSkills);
        setTopicPerformance(dynamicTopicPerformance);
        const correctCount = [q1Correct, q2Correct, q3Correct].filter(Boolean).length;
        setAnswerOutcomes({
          correct: correctCount,
          wrong: Math.max(0, answeredCount - correctCount),
          guesses: Math.max(0, 3 - answeredCount),
        });
        if (savedTime) {
          const totalSeconds = Number(savedTime);
          if (Number.isFinite(totalSeconds) && totalSeconds > 0) {
            setAverageTimePerQuestion(Math.max(1, Math.round(totalSeconds / 3)));
          }
        } else {
          setAverageTimePerQuestion(sessionId === "session-002" ? 68 : 72);
        }
      }
    }
  }, [sessionId]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface)", fontFamily: "Inter, sans-serif" }}>
      <PublicHeader />

      <div style={{ maxWidth: 960, margin: "1.25rem auto 0", padding: "0 1.5rem", display: "flex", justifyContent: "flex-end", gap: "0.75rem", flexWrap: "wrap" }}>
        <Link href={dashboardHref} className="tp-btn-ghost" style={{ fontSize: "0.875rem", padding: "0.5rem 1rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
          <LayoutDashboard size={15} /> Go to Dashboard
        </Link>
        <button className="tp-btn-ghost" onClick={() => triggerToast("Share link copied to clipboard!")}><Share2 size={15} /> Share</button>
        <button className="tp-btn-ghost" onClick={() => triggerToast("Diagnostic PDF report downloaded successfully!")}><Download size={15} /> Export PDF</button>
        <Link href="/assessment/start" className="tp-btn-primary" style={{ fontSize: "0.875rem", padding: "0.5rem 1rem" }}>
          Take Another Test
        </Link>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* ── Header Card ───────────────────────────────────────────── */}
        <div className="animate-fade-in-up" style={{
          background: "linear-gradient(135deg, #1FA6A6 0%, #37C7B7 100%)",
          borderRadius: 16, padding: "2rem", marginBottom: "1.25rem",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.75)", marginBottom: "0.375rem" }}>Diagnostic Report — {r.completedAt}</div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", marginBottom: "0.375rem" }}>
              {r.studentName}
            </h1>
            <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.8)" }}>{r.grade}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.72)", marginBottom: "0.5rem" }}>Ability Metrics</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", alignItems: "flex-end" }}>
              <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-0.02em" }}>
                Skill: {thetaValue}
              </div>
              <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-0.02em" }}>
                Knowledge: {betaValue}
              </div>
            </div>
            <div style={{ marginTop: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.45rem", border: "1px solid rgba(255,255,255,0.35)", borderRadius: 999, background: "rgba(255,255,255,0.14)", padding: "0.35rem 0.75rem" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "rgba(255,255,255,0.78)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Avg Time / Question</span>
              <span style={{ fontSize: "0.86rem", fontWeight: 900, color: "#fff" }}>{formatAverageTime(averageTimePerQuestion)}</span>
            </div>
            <div style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.75)", marginTop: "0.25rem" }}>{gradeEquivalent}</div>
          </div>
        </div>

        {/* ── Row 1: Pie Chart + Root Cause ────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>

          {/* Pie Chart */}
          <div className="tp-card animate-fade-in-up stagger-1">
            <div style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: "0.25rem" }}>Answer Outcome Breakdown</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>Correct, wrong, and guessed answers in this test</div>
            <AnswerOutcomePieChart
              correct={answerOutcomes.correct}
              wrong={answerOutcomes.wrong}
              guesses={answerOutcomes.guesses}
              height={200}
            />
          </div>

          {/* Topic Wise Analysis */}
          <div className="tp-card animate-fade-in-up stagger-2" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.9375rem", marginBottom: "0.25rem" }}>Topic Wise Analysis</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Performance percentage across tested topics</div>
            </div>
            <SimpleBarChart
              data={topicPerformance}
              xKey="topic"
              bars={[{ key: "score", color: "var(--primary)", name: "Performance" }]}
              height={250}
            />
          </div>

        </div>

        {/* ── Skill Mastery Table ───────────────────────────────────── */}
        <div className="tp-card animate-fade-in-up stagger-2" style={{ marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div style={{ fontWeight: 700, fontSize: "0.9375rem" }}>Skill Mastery Map</div>
            <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.75rem" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--success)", fontWeight: 600 }}>● Mastered ≥90%</span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--warning)", fontWeight: 600 }}>● Developing 31-89%</span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--danger)", fontWeight: 600 }}>● Gap ≤30%</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {masteryData.map((s: SkillMastery, i: number) => {
              const currentLabel = getMasteryLabel(s.mastery);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ width: 180, flexShrink: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>{s.skill}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{s.topic}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="mastery-bar-track">
                      <div className="mastery-bar-fill" style={{ width: `${s.mastery * 100}%`, background: masteryColor(s.mastery) }} />
                    </div>
                  </div>
                  <div style={{ width: 80, textAlign: "right", flexShrink: 0 }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 700, color: masteryColor(s.mastery) }}>
                      {Math.round(s.mastery * 100)}%
                    </span>
                  </div>
                  <span className={`tp-badge ${currentLabel === "Mastered" ? "tp-badge-success" : currentLabel === "Developing" ? "tp-badge-warning" : "tp-badge-danger"}`} style={{ width: 90, justifyContent: "center" }}>
                    {currentLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Recent Reports ───────────────────────────────────────── */}
        <div className="animate-fade-in-up stagger-3">
          <div style={{ fontWeight: 700, fontSize: "0.9375rem", marginBottom: "1rem" }}>Most Recent Reports</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
            {[
              { name: "Math Adaptive Test", date: "May 12, 2026", score: overallScore, sessionId: "session-001", subject: "Math" },
              { name: "Number Theory Quiz", date: "Apr 28, 2026", score: 76, sessionId: "session-002", subject: "Math" },
              { name: "Chemistry Practice", date: "May 20, 2026", score: 85, sessionId: "session-003", subject: "Chemistry" },
            ].map((report, i) => (
              <div key={i} className="tp-card" style={{ borderTop: "3px solid var(--primary)", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {report.subject}
                    </div>
                    <span className={`tp-badge ${report.score >= 80 ? "tp-badge-success" : "tp-badge-warning"}`}>
                      {report.score}%
                    </span>
                  </div>
                  <h4 style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                    {report.name}
                  </h4>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0 }}>
                    Completed: {report.date}
                  </p>
                  <div style={{ marginTop: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.4rem", border: "1px solid var(--border)", borderRadius: 999, background: "#fff", padding: "0.3rem 0.65rem" }}>
                    <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--text-secondary)" }}>Knowledge:</span>
                    <span style={{ fontSize: "0.78rem", fontWeight: 900, color: "var(--primary)" }}>{report.score}%</span>
                  </div>
                </div>
                <div style={{ marginTop: "1rem" }}>
                  <Link href={`/report/${report.sessionId}`} className="tp-btn-ghost" style={{ display: "flex", width: "100%", justifyContent: "center", fontSize: "0.75rem", padding: "0.4rem", textDecoration: "none" }}>
                    View Detailed Report
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Toast Notifications ────────────────────────────────── */}
      {toastMessage && (
        <div style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          backgroundColor: toastType === "success" ? "#10B981" : "#EF4444",
          color: "#fff",
          padding: "0.75rem 1.5rem",
          borderRadius: "10px",
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
          zIndex: 10000,
          fontWeight: 600,
          fontSize: "0.875rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          animation: "fade-in 0.25s forwards"
        }}>
          {toastType === "success" ? "✓" : "✗"} {toastMessage}
        </div>
      )}
    </div>
  );
}
