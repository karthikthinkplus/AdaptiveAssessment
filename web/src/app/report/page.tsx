"use client";
import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { FileText, Eye, AlertCircle } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function ReportsListPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [userName, setUserName] = useState("Student");
  const [userAvatar, setUserAvatar] = useState("S");

  const hasReports = reportsList.length > 0;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const tpUser = sessionStorage.getItem("tp_user");
      const user = tpUser ? JSON.parse(tpUser) : null;
      if (user) {
        setUserName(user.name || "Student");
        setUserAvatar(user.avatar || "S");
      }

      api.get<any[]>("/api/v1/topics").then((topicsList) => {
        const topicsMap = new Map((topicsList || []).map(t => [t.id, t.name]));

        api.get<any>("/api/v1/students/me").then((student) => {
          if (student && student.id) {
            api.get<any[]>("/api/v1/learning/sessions").then((sessionsList) => {
              const completedSessions = (Array.isArray(sessionsList) ? sessionsList : [])
                .filter(s => s.status === "completed")
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

              if (completedSessions.length > 0) {
                Promise.all(completedSessions.map(async (sess) => {
                  try {
                    const analytics = await api.get<any>(`/api/v1/analytics/session/${sess.id}`);
                    const dateStr = sess.created_at ? new Date(sess.created_at).toLocaleDateString() : new Date().toLocaleDateString();
                    const score = Math.round(analytics.accuracy);
                    const computedMastery = score >= 90 ? "Mastered" : score >= 31 ? "Developing" : "Gap";
                    return {
                      id: sess.id,
                      name: topicsMap.get(sess.topic_id) || "Math Adaptive Test",
                      subject: "Mathematics",
                      date: dateStr,
                      score,
                      mastery: computedMastery,
                      status: sess.status || "Completed"
                    };
                  } catch (err) {
                    console.error("Failed to load details for session", sess.id, err);
                    return null;
                  }
                })).then((results) => {
                  const validReports = results.filter(Boolean);
                  setReportsList(validReports);
                  setLoading(false);
                }).catch(() => {
                  setLoading(false);
                });
              } else {
                setLoading(false);
              }
            }).catch((err) => {
              console.error("Failed to load learning sessions", err);
              setLoading(false);
            });
          } else {
            setLoading(false);
          }
        }).catch((err) => {
          console.error("Failed to fetch student profile", err);
          setLoading(false);
        });
      }).catch((err) => {
        console.error("Failed to fetch topics", err);
        setLoading(false);
      });
    }
  }, []);

  return (
    <AppShell role="student" userName={userName} userAvatar={userAvatar} title="Reports">

      {loading ? (
        /* ── Loading State ─────────────────────────────────────────── */
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "5rem 2rem", gap: "1rem" }}>
          <div className="animate-spin" style={{ width: 32, height: 32, border: "3px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%" }} />
          <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>
            Loading reports...
          </div>
        </div>
      ) : error ? (
        /* ── Error State ───────────────────────────────────────────── */
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "5rem 2rem", gap: "1rem", color: "var(--danger)" }}>
          <AlertCircle size={32} />
          <div style={{ fontSize: "0.875rem", fontWeight: 600, textAlign: "center" }}>
            Unable to load reports. <br />
            <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>Please try again later.</span>
          </div>
        </div>
      ) : hasReports ? (
        /* ── Reports Table ─────────────────────────────────────────── */
        <div className="tp-card animate-fade-in-up" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="tp-table">
              <thead>
                <tr>
                  <th>Assessment</th>
                  <th>Date</th>
                  <th>Score</th>
                  <th>Mastery</th>
                  <th>Status</th>
                  <th>View Report</th>
                </tr>
              </thead>
              <tbody>
                {reportsList.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(160,137,230,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <FileText size={16} color="var(--primary)" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{r.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.125rem" }}>{r.subject}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>{r.date}</td>
                    <td style={{ fontWeight: 800, color: "var(--primary)" }}>{r.score}%</td>
                    <td>
                      <span className={`tp-badge ${r.mastery === "Mastered" ? "tp-badge-success" : "tp-badge-warning"}`}>
                        {r.mastery}
                      </span>
                    </td>
                    <td>
                      <span className="tp-badge tp-badge-neutral">{r.status}</span>
                    </td>
                    <td>
                      <Link 
                        href={`/report/${r.id}`} 
                        className="tp-btn-primary" 
                        style={{ padding: "0.4rem 0.875rem", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
                      >
                        <Eye size={12} /> View Report
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── Reports Empty State ───────────────────────────────────── */
        <div className="tp-card animate-fade-in-up" style={{ maxWidth: 500, margin: "0 auto", padding: "4rem 2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileText size={30} color="var(--primary)" />
          </div>
          <div>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
              No reports available.
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Complete an assessment to generate your first report.
            </p>
          </div>
          <Link href="/assessment/start" className="tp-btn-primary" style={{ padding: "0.625rem 1.5rem" }}>
            Begin Assessment
          </Link>
        </div>
      )}
    </AppShell>
  );
}
