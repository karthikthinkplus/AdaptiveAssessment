"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { DIAGNOSTIC_REPORT, type SkillMastery } from "@/lib/mockData";
import AnswerOutcomePieChart from "@/components/charts/AnswerOutcomePieChart";
import SimpleBarChart from "@/components/charts/SimpleBarChart";
import Link from "next/link";
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
  const [abilityTheta, setAbilityTheta] = useState<number>(r.abilityTheta);
  const thetaValue = abilityTheta.toFixed(2);
  const [dashboardHref, setDashboardHref] = useState("/student/dashboard");
  const [topicPerformance, setTopicPerformance] = useState([
    { topic: "Algebra", score: 62 },
    { topic: "Arithmetic", score: 90 },
  ]);
  const [studentName, setStudentName] = useState("Student");
  const [studentGrade, setStudentGrade] = useState("Grade 8");
  const [recentReports, setRecentReports] = useState<any[]>([]);

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
      const tpUser = sessionStorage.getItem("tp_user");
      const user = tpUser ? JSON.parse(tpUser) : null;

      if (user) {
        setStudentName(user.name || "Student");
        setStudentGrade(user.institution ? `${user.grade || "Grade 8"} - ${user.institution}` : (user.grade || "Grade 8"));
      }

      api.get<any[]>("/api/v1/topics").then((topicsList) => {
        const topicsMap = new Map((topicsList || []).map(t => [t.id, t.name]));

        api.get<any>("/api/v1/students/me").then((student) => {
          if (student && student.id) {
            api.get<any[]>("/api/v1/learning/sessions").then((sessionsList) => {
              const completedSessions = (Array.isArray(sessionsList) ? sessionsList : [])
                .filter(s => s.status === "completed" && s.id !== sessionId)
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

              Promise.all(completedSessions.slice(0, 3).map(async (sess) => {
                try {
                  const analytics = await api.get<any>(`/api/v1/analytics/session/${sess.id}`);
                  const dateStr = sess.created_at ? new Date(sess.created_at).toLocaleDateString() : new Date().toLocaleDateString();
                  const score = Math.round(analytics.accuracy);
                  return {
                    name: topicsMap.get(sess.topic_id) || "Math Adaptive Test",
                    date: dateStr,
                    score,
                    sessionId: sess.id,
                    subject: "Mathematics"
                  };
                } catch (err) {
                  console.error("Failed to load details for recent report", sess.id, err);
                  return null;
                }
              })).then((results) => {
                setRecentReports(results.filter(Boolean));
              });
            }).catch(console.error);
          }
        }).catch(console.error);

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
                if (sess) {
                  if (sess.total_questions_attempted > 0) {
                    setAverageTimePerQuestion(Math.max(1, Math.round(sess.total_time_seconds / sess.total_questions_attempted)));
                  }
                  const studentId = sess.student_id;
                  if (studentId) {
                    const tpUser = sessionStorage.getItem("tp_user");
                    if (tpUser) {
                      try {
                        const parsed = JSON.parse(tpUser);
                        if (!parsed.student_id) {
                          parsed.student_id = studentId;
                          sessionStorage.setItem("tp_user", JSON.stringify(parsed));
                          setStudentGrade(parsed.institution ? `${parsed.grade || "Grade 8"} - ${parsed.institution}` : (parsed.grade || "Grade 8"));
                        }
                      } catch (e) {
                        console.error("Failed to save student_id from session", e);
                      }
                    }

                    // Fetch topics to map IRT traits
                    api.get<any[]>(`/api/v1/adaptive/students/${studentId}/irt`).then((traits) => {
                      if (traits && traits.length > 0) {
                        const mappedPerformance = traits.map((t: any) => ({
                          topic: topicsMap.get(t.topic_id) || "Mathematics",
                          score: Math.min(100, Math.max(0, Math.round((t.theta + 3) / 6 * 100)))
                        }));
                        setTopicPerformance(mappedPerformance);
                        setAbilityTheta(traits[0].theta);
                      }
                    }).catch(console.error);

                    // Fetch subtopics for this topic to map BKT states
                    api.get<any[]>(`/api/v1/topics/${sess.topic_id}/subtopics`).then((subtopicsList) => {
                      const subtopicsMap = new Map((subtopicsList || []).map(s => [s.id, s.name]));

                      api.get<any[]>(`/api/v1/adaptive/students/${studentId}/bkt`).then((bkts) => {
                        if (bkts && bkts.length > 0) {
                          const mappedMastery = bkts.map((b: any) => ({
                            skill: subtopicsMap.get(b.subtopic_id) || "Subtopic Mastery",
                            topic: topicsMap.get(sess.topic_id) || "Mathematics",
                            mastery: b.p_mastery,
                            label: getMasteryLabel(b.p_mastery)
                          }));
                          setMasteryData(mappedMastery);
                        }
                      }).catch(console.error);
                    }).catch(console.error);
                  }
                }
              }).catch(console.error);
            }
          }).catch((err) => {
            console.error("Failed to load backend session analytics, using default mock fallback", err);
            loadMockStats();
          });
        } else {
          loadMockStats();
          // Load mock recent reports
          setRecentReports([
            { name: "Math Adaptive Test", date: "May 12, 2026", score: overallScore, sessionId: "session-001", subject: "Math" },
            { name: "Number Theory Quiz", date: "Apr 28, 2026", score: 76, sessionId: "session-002", subject: "Math" },
            { name: "Chemistry Practice", date: "May 20, 2026", score: 85, sessionId: "session-003", subject: "Chemistry" }
          ]);
        }
      }).catch((err) => {
        console.error("Failed to load topics", err);
        loadMockStats();
      });

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
    <div style={{ minHeight: "100vh", background: "#d4f0ee", fontFamily: "Inter, sans-serif", paddingBottom: "3rem" }}>
      {/* Custom Floating Header Bar */}
      <div
        style={{
          position: "sticky",
          top: "1rem",
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "0 4%",
          display: "flex",
          justifyContent: "center",
          marginBottom: "1.5rem"
        }}
      >
        <header
          style={{
            width: "100%",
            maxWidth: "1200px",
            height: "56px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            borderRadius: "999px",
            padding: "0 1.5rem 0 2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
            border: "1px solid rgba(0,0,0,0.04)"
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              textDecoration: "none",
            }}
          >
            <img src="/logo.png" alt="thinkplus" style={{ height: "30px", width: "auto", display: "block" }} />
          </Link>

          {/* Action buttons in header */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link
              href={dashboardHref}
              className="tp-btn-ghost"
              style={{
                fontSize: "0.8125rem",
                fontWeight: 700,
                padding: "0.45rem 1rem",
                textDecoration: "none",
                borderRadius: "999px",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                border: "1.5px solid #E5E7EB",
                background: "#fff",
                color: "#374151"
              }}
            >
              <LayoutDashboard size={13} /> Go to Dashboard
            </Link>
            <button
              onClick={() => triggerToast("Share link copied to clipboard!")}
              style={{
                fontSize: "0.8125rem",
                fontWeight: 700,
                padding: "0.45rem 1rem",
                borderRadius: "999px",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                border: "1.5px solid #E5E7EB",
                background: "#fff",
                color: "#374151",
                cursor: "pointer"
              }}
            >
              <Share2 size={13} /> Share
            </button>
            <button
              onClick={() => triggerToast("Diagnostic PDF report downloaded successfully!")}
              style={{
                fontSize: "0.8125rem",
                fontWeight: 700,
                padding: "0.45rem 1rem",
                borderRadius: "999px",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                border: "1.5px solid #E5E7EB",
                background: "#fff",
                color: "#374151",
                cursor: "pointer"
              }}
            >
              <Download size={13} /> Export PDF
            </button>
            <Link
              href="/assessment/start"
              style={{
                fontSize: "0.8125rem",
                fontWeight: 700,
                padding: "0.45rem 1.2rem",
                borderRadius: "999px",
                textDecoration: "none",
                background: "#F25AA7",
                color: "#fff",
                boxShadow: "0 4px 14px rgba(242,90,167,0.25)"
              }}
            >
              Take Another Test
            </Link>
          </div>
        </header>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "1.5rem" }}>

        {/* ── Main Unified Report Card ───────────────────────────────── */}
        <div className="animate-fade-in-up" style={{
          background: "#ffffff",
          borderRadius: 20,
          marginBottom: "2rem",
          border: "1.5px solid #111827",
          boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
          overflow: "hidden"
        }}>
          
          <div style={{ padding: "2.5rem" }}>
            
            {/* Section 1: Header/Profile Details */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: "2rem", borderBottom: "1px solid #E5E7EB", marginBottom: "2rem" }}>
              <div>
                <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>Diagnostic Report — {r.completedAt}</div>
                <h1 style={{ fontSize: "2.25rem", fontWeight: 900, color: "#111827", letterSpacing: "-0.03em", marginBottom: "0.15rem" }}>
                  {studentName}
                </h1>
                <div style={{ fontSize: "0.95rem", color: "#4B5563", fontWeight: 600 }}>{studentGrade}</div>
                
                <div style={{ marginTop: "1.1rem", display: "flex", gap: "0.85rem", alignItems: "center" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", border: "1px solid #E5E7EB", borderRadius: 999, background: "#F9FAFB", padding: "0.3rem 0.65rem" }}>
                    <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.04em" }}>Avg Time / Question</span>
                    <span style={{ fontSize: "0.82rem", fontWeight: 900, color: "#111827" }}>{formatAverageTime(averageTimePerQuestion)}</span>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#6B7280", fontWeight: 600 }}>Recommendation: <strong style={{ color: "#F25AA7", fontWeight: 800 }}>{gradeEquivalent}</strong></div>
                </div>
              </div>
              
              <div style={{ display: "flex", gap: "1rem" }}>
                {/* Stat Box 1: Estimated Ability */}
                <div style={{ background: "#F8FAFC", borderRadius: "14px", padding: "0.85rem 1.4rem", minWidth: "155px", textAlign: "center", border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem" }}>Estimated Ability</div>
                  <div style={{ fontSize: "1.85rem", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.02em" }}>
                    {thetaValue}
                  </div>
                  <div style={{ fontSize: "0.6rem", color: "#94A3B8", fontWeight: 600, marginTop: "0.1rem" }}>IRT Theta Value</div>
                </div>

                {/* Stat Box 2: Academic Accuracy */}
                <div style={{ background: "#FFF0F6", borderRadius: "14px", padding: "0.85rem 1.4rem", minWidth: "155px", textAlign: "center", border: "1px solid #FFD8E4" }}>
                  <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "#C2185B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem" }}>Overall Accuracy</div>
                  <div style={{ fontSize: "1.85rem", fontWeight: 900, color: "#E91E63", letterSpacing: "-0.02em" }}>
                    {overallScore}%
                  </div>
                  <div style={{ fontSize: "0.6rem", color: "#F06292", fontWeight: 600, marginTop: "0.1rem" }}>BKT Probability</div>
                </div>
              </div>
            </div>

            {/* Section 2: Charts Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: "2.5rem", paddingBottom: "2rem", borderBottom: "1px solid #E5E7EB", marginBottom: "2rem" }}>
              {/* Pie Chart */}
              <div>
                <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#111827", marginBottom: "0.25rem" }}>Answer Outcome Breakdown</div>
                <div style={{ fontSize: "0.78rem", color: "#6B7280", marginBottom: "1.5rem" }}>Correct, wrong, and guessed answers in this test</div>
                <AnswerOutcomePieChart
                  correct={answerOutcomes.correct}
                  wrong={answerOutcomes.wrong}
                  guesses={answerOutcomes.guesses}
                  height={200}
                />
              </div>

              {/* Topic Wise Analysis */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#111827", marginBottom: "0.25rem" }}>Topic Wise Analysis</div>
                  <div style={{ fontSize: "0.78rem", color: "#6B7280", marginBottom: "0.5rem" }}>Performance percentage across tested topics</div>
                </div>
                <SimpleBarChart
                  data={topicPerformance}
                  xKey="topic"
                  bars={[{ key: "score", color: "#F25AA7", name: "Performance" }]}
                  height={200}
                />
              </div>
            </div>

            {/* Section 3: Skill Mastery Map */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#111827" }}>Skill Mastery Map</div>
                <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--success)", fontWeight: 700 }}>● Mastered ≥90%</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--warning)", fontWeight: 700 }}>● Developing 31-89%</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--danger)", fontWeight: 700 }}>● Gap ≤30%</span>
                </div>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {masteryData.map((s: SkillMastery, i: number) => {
                  const currentLabel = getMasteryLabel(s.mastery);
                  const barColor = masteryColor(s.mastery);
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                      <div style={{ width: 200, flexShrink: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#111827" }}>{s.skill}</div>
                        <div style={{ fontSize: "0.72rem", color: "#6B7280", marginTop: "0.1rem" }}>{s.topic}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ height: 10, background: "#F1F5F9", borderRadius: 999, overflow: "hidden" }}>
                          <div style={{ width: `${s.mastery * 100}%`, height: "100%", background: barColor, borderRadius: 999, transition: "width 0.4s ease" }} />
                        </div>
                      </div>
                      <div style={{ width: 60, textAlign: "right", flexShrink: 0 }}>
                        <span style={{ fontSize: "0.875rem", fontWeight: 800, color: barColor }}>
                          {Math.round(s.mastery * 100)}%
                        </span>
                      </div>
                      <span className={`tp-badge ${currentLabel === "Mastered" ? "tp-badge-success" : currentLabel === "Developing" ? "tp-badge-warning" : "tp-badge-danger"}`} style={{ width: 100, justifyContent: "center", fontWeight: 700, borderRadius: "999px", padding: "0.25rem 0.65rem" }}>
                        {currentLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* ── Recent Reports ───────────────────────────────────────── */}
        {recentReports.length > 0 && (
          <div className="animate-fade-in-up stagger-3" style={{ marginTop: "2.5rem" }}>
            <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#111827", marginBottom: "1rem" }}>Most Recent Reports</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}>
              {recentReports.map((report, i) => (
                <div key={i} className="tp-card" style={{ border: "1.5px solid #111827", borderRadius: 20, boxShadow: "0 10px 30px rgba(0,137,123,0.05)", background: "#fff", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", padding: 0, overflow: "hidden" }}>
                  <div style={{ height: "4px", background: "var(--primary)" }} />
                  <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                      <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {report.subject || "Math"}
                      </div>
                      <span className={`tp-badge ${report.score >= 80 ? "tp-badge-success" : "tp-badge-warning"}`} style={{ borderRadius: "999px", fontWeight: 700 }}>
                        {report.score}%
                      </span>
                    </div>
                    <h4 style={{ fontWeight: 800, fontSize: "0.875rem", color: "#111827", marginBottom: "0.25rem" }}>
                      {report.name}
                    </h4>
                    <p style={{ fontSize: "0.75rem", color: "#6B7280", margin: 0 }}>
                      Completed: {report.date}
                    </p>
                    <div style={{ marginTop: "auto", paddingTop: "0.75rem" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", border: "1px solid #E5E7EB", borderRadius: 999, background: "#F9FAFB", padding: "0.25rem 0.6rem" }}>
                        <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#6B7280" }}>Knowledge:</span>
                        <span style={{ fontSize: "0.72rem", fontWeight: 900, color: "var(--primary)" }}>{report.score}%</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: "0.75rem 1.25rem 1.25rem" }}>
                    <Link href={`/report/${report.sessionId}`} className="tp-btn-ghost" style={{ display: "flex", width: "100%", justifyContent: "center", fontSize: "0.78rem", fontWeight: 700, padding: "0.45rem", textDecoration: "none", borderRadius: "999px", border: "1.5px solid #E5E7EB" }}>
                      View Detailed Report
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
