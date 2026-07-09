"use client";
import RouteGuard from "@/components/auth/RouteGuard";
import AppShell from "@/components/layout/AppShell";
import { BookOpen, AlertCircle, CheckCircle, XCircle, Tag, Plus, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const difficultyBadgeClass = (difficulty: string) => {
  const diff = difficulty?.toLowerCase();
  if (diff === "very easy" || diff === "easy") return "tp-badge-success";
  if (diff === "medium") return "tp-badge-warning";
  return "tp-badge-danger";
};

export default function QBMDashboard() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("QBM Developer");
  const [userAvatar, setUserAvatar] = useState("RK");

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const list = await api.get<any[]>("/api/v1/questions");
      setQuestions(list || []);
    } catch (err) {
      console.error("Failed to fetch questions on QBM dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  const loadTopics = async () => {
    try {
      const list = await api.get<any[]>("/api/v1/topics");
      setTopics(list || []);
    } catch (err) {
      console.error("Failed to fetch topics on QBM dashboard", err);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("current_role", "qbm");
      const tpUser = sessionStorage.getItem("tp_user");
      const user = tpUser ? JSON.parse(tpUser) : null;
      if (user) {
        setUserName(user.name || "QBM Developer");
        setUserAvatar(user.avatar || "RK");
      }
    }
    loadQuestions();
    loadTopics();
  }, []);

  const handleAction = async (id: string, newStatus: "approved" | "rejected") => {
    try {
      await api.patch(`/api/v1/questions/${id}`, { status: newStatus });
      await loadQuestions();
    } catch (err: any) {
      alert("Failed to update question status: " + err.message);
    }
  };

  const pendingReviewList = questions.filter(q => q.status === "draft" || q.status === "pending");
  const approvedCount = questions.filter(q => q.status === "approved").length;
  const rejectedCount = questions.filter(q => q.status === "rejected").length;

  const topicsMap = new Map((topics || []).map(t => [t.id, t.name]));

  return (
    <RouteGuard allowedRoles={["qbm","content_manager"]}>
    <AppShell role="qbm" userName={userName} userAvatar={userAvatar} title="QBM Dashboard">
      {/* ── Action Buttons ────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", justifyContent: "flex-end" }}>
        <Link href="/qbm/upload" className="tp-btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
          Bulk Upload
        </Link>
        <Link href="/qbm/questions" className="tp-btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
          <Plus size={16} /> Add Question
        </Link>
      </div>

      {/* ── Stats Row ────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Total Questions", value: questions.length, icon: <BookOpen size={18} color="var(--primary)" />, trend: "Active bank size" },
          { label: "Pending Review", value: pendingReviewList.length, icon: <AlertCircle size={18} color="var(--warning)" />, trend: "Needs approval" },
          { label: "Approved Questions", value: approvedCount, icon: <CheckCircle size={18} color="var(--success)" />, trend: "Active in database" },
          { label: "Rejected Questions", value: rejectedCount, icon: <XCircle size={18} color="var(--danger)" />, trend: "Needs corrections" },
        ].map((stat, i) => (
          <div key={i} className="tp-stat-card animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span className="tp-stat-label">{stat.label}</span>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {stat.icon}
              </div>
            </div>
            <div className="tp-stat-value">{stat.value}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", borderTop: "1px solid var(--border)", paddingTop: "0.5rem", marginTop: "0.5rem" }}>
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      {/* ── Pending Review Queue ───────────────────────────────────── */}
      <div className="tp-card animate-fade-in-up stagger-1">
        <div style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: "1rem" }}>Pending Questions Approval Queue ({pendingReviewList.length})</div>
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
            Loading pending review queue...
          </div>
        ) : pendingReviewList.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
            🎉 No questions pending review. All items processed!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {pendingReviewList.map(q => (
              <div key={q.id} style={{ display: "flex", gap: "1rem", border: "1px solid var(--border)", borderRadius: "8px", padding: "1rem", alignItems: "flex-start", background: "var(--bg)", transition: "border-color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "var(--primary)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                    <span className="tp-badge tp-badge-neutral">{topicsMap.get(q.topic_id) || "General"}</span>
                    <span className="tp-badge tp-badge-neutral"><Tag size={12} style={{ marginRight: 2 }} /> {q.question_code || "General"}</span>
                    <span className={`tp-badge ${difficultyBadgeClass(q.difficulty_level)}`}>{q.difficulty_level || "Medium"}</span>
                  </div>
                  <p style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9375rem", lineHeight: 1.5, marginBottom: "0.5rem" }}>
                    {q.question_text}
                  </p>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Created at {new Date(q.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => handleAction(q.id, "approved")} className="tp-btn-ghost" style={{ color: "var(--success)", borderColor: "var(--success)", padding: "0.5rem", borderRadius: "8px" }} title="Approve">
                    <Check size={16} />
                  </button>
                  <button onClick={() => handleAction(q.id, "rejected")} className="tp-btn-ghost" style={{ color: "var(--danger)", borderColor: "var(--danger)", padding: "0.5rem", borderRadius: "8px" }} title="Reject">
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
    </RouteGuard>
  );
}
