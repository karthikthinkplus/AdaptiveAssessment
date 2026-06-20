"use client";
import AppShell from "@/components/layout/AppShell";
import { ASSESSMENTS } from "@/lib/mockData";
import { Search, Plus, Play } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

type AssessmentTab = "all" | "active" | "completed";
type SessionUser = {
  role?: "student" | "teacher" | "qbm" | "admin";
};
const ASSESSMENT_TABS: { id: AssessmentTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Available" },
  { id: "completed", label: "Completed" },
];

export default function AssessmentsListPage() {
  const [tab, setTab] = useState<AssessmentTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const session = sessionStorage.getItem("tp_user");
      if (session) {
        try {
          setCurrentUser(JSON.parse(session) as SessionUser);
        } catch (err) {
          console.error(err);
        }
      }
    }
  }, []);

  const shown = ASSESSMENTS.filter(a => {
    const matchesTab = tab === "all" || a.status === tab;
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (a.subject && a.subject.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  return (
    <AppShell title="Assessments">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        {/* Tabs */}
        <div style={{ gap: "0.375rem", background: "#fff", padding: "0.375rem", borderRadius: 10, border: "1px solid var(--border)", display: "inline-flex" }}>
          {ASSESSMENT_TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "0.4rem 1rem", borderRadius: 7, fontSize: "0.8125rem", fontWeight: 600,
              background: tab === t.id ? "var(--primary)" : "transparent",
              color: tab === t.id ? "#fff" : "var(--text-secondary)",
              border: "none", cursor: "pointer", transition: "all 0.15s ease",
            }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <div style={{ position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              className="tp-input" 
              style={{ paddingLeft: "2.25rem", width: 220 }} 
              placeholder="Search assessments..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          {(!currentUser || currentUser.role !== "student") && (
            <button className="tp-btn-ghost"><Plus size={15} /> Create Assessment</button>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {shown.map((a, i) => (
          <div key={a.id} className="tp-card animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s`, display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/>
              </svg>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.25rem" }}>
                <span style={{ fontWeight: 700, fontSize: "0.9375rem" }}>{a.name}</span>
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                {a.questions} Questions · {a.duration} min · {a.date}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span className={`tp-badge ${a.status === "active" ? "tp-badge-success" : a.status === "upcoming" ? "tp-badge-warning" : "tp-badge-neutral"}`} style={{ fontSize: "0.8" }}>
                {a.status}
              </span>
              {a.score !== undefined ? (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--primary)" }}>{a.score}%</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Score</div>
                </div>
              ) : (
                <Link href="/assessment/session-001" className="tp-btn-primary" style={{ fontSize: "0.875rem", padding: "0.5rem 1.125rem" }}>
                  <Play size={14} /> Start
                </Link>
              )}
            </div>
          </div>
        ))}
        {shown.length === 0 && (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
            No assessments found matching search/filter.
          </div>
        )}
      </div>
    </AppShell>
  );
}
