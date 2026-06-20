"use client";
import AppShell from "@/components/layout/AppShell";
import { QBM_STATS, QBM_PENDING_QUESTIONS } from "@/lib/mockData";
import { BookOpen, AlertCircle, CheckCircle, XCircle, Tag, Plus, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

const difficultyBadgeClass = (difficulty: string) => {
  if (difficulty === "Very Easy" || difficulty === "Easy") return "tp-badge-success";
  if (difficulty === "Medium") return "tp-badge-warning";
  return "tp-badge-danger";
};

export default function QBMDashboard() {
  const [pending, setPending] = useState(QBM_PENDING_QUESTIONS);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("current_role", "qbm");
    }
  }, []);

  const handleAction = (id: string) => {
    setPending(prev => prev.filter(q => q.id !== id));
  };

  return (
    <AppShell role="qbm" userName="Ravi Kumar" userAvatar="RK" title="QBM Dashboard">
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
          { label: "Total Questions", value: QBM_STATS.totalQuestions, icon: <BookOpen size={18} color="var(--primary)" />, trend: "Active bank size" },
          { label: "Pending Review", value: pending.length, icon: <AlertCircle size={18} color="var(--warning)" />, trend: "Needs approval" },
          { label: "Approved (This Week)", value: QBM_STATS.approvedThisWeek, icon: <CheckCircle size={18} color="var(--success)" />, trend: "+7% vs last week" },
          { label: "Rejected (This Week)", value: QBM_STATS.rejectedThisWeek, icon: <XCircle size={18} color="var(--danger)" />, trend: "Returned to teachers" },
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
        <div style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: "1rem" }}>Pending Questions Approval Queue ({pending.length})</div>
        {pending.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
            🎉 No questions pending review. All items processed!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {pending.map(q => (
              <div key={q.id} style={{ display: "flex", gap: "1rem", border: "1px solid var(--border)", borderRadius: "8px", padding: "1rem", alignItems: "flex-start", background: "var(--bg)", transition: "border-color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "var(--primary)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                    <span className="tp-badge tp-badge-neutral">{q.subject}</span>
                    <span className="tp-badge tp-badge-neutral"><Tag size={12} style={{ marginRight: 2 }} /> {q.topic}</span>
                    <span className={`tp-badge ${difficultyBadgeClass(q.difficulty)}`}>{q.difficulty}</span>
                  </div>
                  <p style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9375rem", lineHeight: 1.5, marginBottom: "0.5rem" }}>
                    {q.text}
                  </p>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Submitted by <strong>{q.submittedBy}</strong> on {q.submittedAt}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => handleAction(q.id)} className="tp-btn-ghost" style={{ color: "var(--success)", borderColor: "var(--success)", padding: "0.5rem", borderRadius: "8px" }} title="Approve">
                    <Check size={16} />
                  </button>
                  <button onClick={() => handleAction(q.id)} className="tp-btn-ghost" style={{ color: "var(--danger)", borderColor: "var(--danger)", padding: "0.5rem", borderRadius: "8px" }} title="Reject">
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
