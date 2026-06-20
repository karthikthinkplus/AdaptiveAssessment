"use client";
import AppShell from "@/components/layout/AppShell";
import { Search, ClipboardList, Play } from "lucide-react";
import { useState } from "react";

export default function AdminAssessmentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const assessments = [
    { id: "A101", title: "Grade 10 Mathematics Final", subject: "Math", questions: 25, activeSessions: 42, completed: 180, status: "Active" },
    { id: "A102", title: "Grade 9 Biology Mid-Term", subject: "Science", questions: 30, activeSessions: 0, completed: 145, status: "Draft" },
    { id: "A103", title: "Grade 10 English Comprehension", subject: "English", questions: 15, activeSessions: 12, completed: 92, status: "Active" },
    { id: "A104", title: "Grade 8 Trigonometry Quiz", subject: "Math", questions: 20, activeSessions: 0, completed: 210, status: "Archived" },
  ];

  const filtered = assessments.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = assessments.filter(a => a.status === "Active").length;
  const totalCount = assessments.length;

  return (
    <AppShell title="Platform Assessments">
      <div className="animate-fade-in-up">

        {/* ── Stats Summary Row ────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
          <div className="tp-stat-card" style={{ flex: 1, maxWidth: "280px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span className="tp-stat-label">Currently Running</span>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(160,137,230,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#A089E6" }}>
                <Play size={16} fill="var(--primary)" />
              </div>
            </div>
            <div className="tp-stat-value">{activeCount}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
              Active Assessments
            </div>
          </div>

          <div className="tp-stat-card" style={{ flex: 1, maxWidth: "280px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span className="tp-stat-label">Total Repositories</span>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(160,137,230,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#A089E6" }}>
                <ClipboardList size={16} />
              </div>
            </div>
            <div className="tp-stat-value">{totalCount}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
              Assessments Registered
            </div>
          </div>
        </div>

        {/* ── Search Bar ─────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
            <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              className="tp-input"
              style={{ paddingLeft: "2.5rem" }}
              placeholder="Search assessments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* ── Assessments Table ───────────────────────────────────────── */}
        <div className="tp-card">
          <div style={{ overflowX: "auto" }}>
            <table className="tp-table">
              <thead>
                <tr>
                  <th>Assessment Name</th>
                  <th>Subject</th>
                  <th>Questions</th>
                  <th>Active Sessions</th>
                  <th>Completed Sessions</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <ClipboardList size={16} color="var(--primary)" />
                        <span>{a.title}</span>
                      </div>
                    </td>
                    <td>{a.subject}</td>
                    <td>{a.questions}</td>
                    <td>{a.activeSessions}</td>
                    <td>{a.completed}</td>
                    <td>
                      <span className={`tp-badge ${
                        a.status === "Active" ? "tp-badge-success" : 
                        a.status === "Draft" ? "tp-badge-warning" : "tp-badge-neutral"
                      }`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
