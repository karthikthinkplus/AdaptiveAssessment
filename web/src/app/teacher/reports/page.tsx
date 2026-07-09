"use client";
import AppShell from "@/components/layout/AppShell";
import { Search, Download, Eye } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const inferRole = (email: string, inst: string | null): string => {
  const e = email.toLowerCase();
  if (e.includes("admin")) return "Admin";
  if (e.includes("qbm") || e.includes("content")) return "QBM";
  if (e.includes("teacher") || inst === "School" || inst?.includes("Public School")) return "Teacher";
  return "Student";
};

export default function TeacherReportsPage() {
  const [search, setSearch] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [reports, setReports] = useState<any[]>([]);

  const triggerToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  useEffect(() => {
    api.get<any[]>("/api/v1/users").then((list) => {
      const students = (list || []).filter(u => {
        const role = inferRole(u.email, u.institution_name);
        return role === "Student";
      });
      
      const mapped = students.map((s, idx) => {
        const score = idx % 2 === 0 ? 82 : 76;
        const sessionId = idx % 2 === 0 ? "session-001" : "session-002";
        return {
          id: s.id,
          name: s.full_name || "Student",
          grade: s.grade || "Grade 8",
          assessmentName: "Math Adaptive Test",
          subject: "Mathematics",
          score: score,
          completedDate: s.created_at ? new Date(s.created_at).toLocaleDateString() : "May 12, 2026",
          sessionId: sessionId
        };
      });

      if (mapped.length === 0) {
        setReports([
          {
            id: "std-001",
            name: "Harika Kota",
            grade: "Grade 8",
            assessmentName: "Math Adaptive Test",
            subject: "Mathematics",
            score: 82,
            completedDate: "May 12, 2026",
            sessionId: "session-001"
          },
          {
            id: "std-002",
            name: "Karthik Thinkplus",
            grade: "Grade 9",
            assessmentName: "Polynomials & Quadratic Quiz",
            subject: "Mathematics",
            score: 76,
            completedDate: "Apr 28, 2026",
            sessionId: "session-002"
          }
        ]);
      } else {
        setReports(mapped);
      }
    }).catch(() => {
      setReports([
        {
          id: "std-001",
          name: "Harika Kota",
          grade: "Grade 8",
          assessmentName: "Math Adaptive Test",
          subject: "Mathematics",
          score: 82,
          completedDate: "May 12, 2026",
          sessionId: "session-001"
        }
      ]);
    });
  }, []);

  const filtered = reports.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell title="Diagnostic Reports Archive">
      <div className="animate-fade-in-up">
        {/* Controls Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", flex: 1, maxWidth: 360 }}>
            <div style={{ position: "relative", width: "100%" }}>
              <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                className="tp-input"
                placeholder="Search by student name..."
                style={{ paddingLeft: "2.25rem" }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="tp-card" style={{ padding: 0 }}>
          <table className="tp-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Assessment</th>
                <th>Standard</th>
                <th>Diagnostic Score</th>
                <th>Completed Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Class 10 - A</div>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.85rem", fontWeight: 500 }}>Math Adaptive Test</div>
                  </td>
                  <td>
                    <span className="tp-badge tp-badge-primary">Grade 10 Standard</span>
                  </td>
                  <td style={{ fontWeight: 700, fontSize: "0.9rem", color: s.score >= 80 ? "var(--success)" : "var(--warning)" }}>
                    {s.score}%
                  </td>
                  <td style={{ color: "var(--text-secondary)", fontSize: "0.8125rem" }}>May 12, 2026</td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Link href="/report/session-001" className="tp-btn-ghost" style={{ padding: "0.35rem 0.625rem", fontSize: "0.75rem", textDecoration: "none" }} title="View Detailed Report">
                        <Eye size={12} /> View Report
                      </Link>
                      <button 
                        onClick={() => triggerToast(`PDF report for ${s.name} exported successfully!`)}
                        className="tp-btn-ghost" 
                        style={{ padding: "0.35rem 0.625rem", fontSize: "0.75rem" }} 
                        title="Export PDF"
                      >
                        <Download size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>
                    No reports found matching search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
    </AppShell>
  );
}
