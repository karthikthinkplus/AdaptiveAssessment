"use client";
import AppShell from "@/components/layout/AppShell";
import { Search, Eye, Download, FileText } from "lucide-react";
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

export default function AdminReportsPage() {
  const [search, setSearch] = useState("");
  const [selectedInst, setSelectedInst] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [exportedReport, setExportedReport] = useState("");
  const [adminStudentReports, setAdminStudentReports] = useState<any[]>([]);

  useEffect(() => {
    api.get<any[]>("/api/v1/users").then((list) => {
      // In clean database state, keep it empty. If there were real student assessments, we can list them.
      setAdminStudentReports([]);
    }).catch((err) => {
      console.error("Failed to load users for reports list", err);
    });
  }, []);

  const filtered = adminStudentReports.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesInst = selectedInst === "" || s.institution === selectedInst;
    const matchesGrade = selectedGrade === "" || s.grade === selectedGrade;
    return matchesSearch && matchesInst && matchesGrade;
  });

  // Unique lists for filters
  const uniqueInstitutions = Array.from(new Set(adminStudentReports.map(s => s.institution)));
  const uniqueGrades = Array.from(new Set(adminStudentReports.map(s => s.grade)));

  return (
    <AppShell role="admin" userName="Ravi Kumar" userAvatar="RK" title="Student Diagnostic Reports">
      <div className="animate-fade-in-up">

        {/* Controls Row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "260px", maxWidth: "360px" }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              className="tp-input"
              placeholder="Search by student name..."
              style={{ paddingLeft: "2.25rem" }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select 
            className="tp-select" 
            style={{ width: "200px" }}
            value={selectedInst}
            onChange={e => setSelectedInst(e.target.value)}
          >
            <option value="">All Institutions</option>
            {uniqueInstitutions.map(inst => (
              <option key={inst} value={inst}>{inst}</option>
            ))}
          </select>

          <select 
            className="tp-select" 
            style={{ width: "160px" }}
            value={selectedGrade}
            onChange={e => setSelectedGrade(e.target.value)}
          >
            <option value="">All Classes</option>
            {uniqueGrades.map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
        </div>

        {/* Reports List */}
        <div className="tp-card" style={{ padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <table className="tp-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Institution / Class</th>
                  <th>Completed Assessment</th>
                  <th>Diagnostic Score</th>
                  <th>Date Completed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", gap: "0.25rem" }}>
                        ID: {s.id.toUpperCase()}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>{s.institution}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{s.grade}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: "0.875rem", fontWeight: 500, display: "flex", alignItems: "center", gap: "0.375rem" }}>
                        <FileText size={14} color="var(--primary)" />
                        <span>{s.assessmentName}</span>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{s.subject}</div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{ width: 60, height: 6, background: "var(--border)", borderRadius: 999, overflow: "hidden" }}>
                          <div style={{
                            height: "100%", width: `${s.score}%`,
                            background: s.score >= 75 ? "var(--success)" : s.score >= 50 ? "var(--warning)" : "var(--danger)",
                            borderRadius: 999
                          }} />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: "0.875rem", color: s.score >= 75 ? "var(--success)" : s.score >= 50 ? "var(--warning)" : "var(--danger)" }}>
                          {s.score}%
                        </span>
                      </div>
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: "0.8125rem" }}>{s.completedDate}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <Link 
                          href={`/report/${s.sessionId}`} 
                          className="tp-btn-primary" 
                          style={{ padding: "0.4rem 0.875rem", fontSize: "0.75rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.375rem" }} 
                          title="View Detailed Report"
                        >
                          <Eye size={12} /> View Report
                        </Link>
                        <button
                          onClick={() => {
                            setExportedReport(`${s.name} - ${s.assessmentName}`);
                            window.setTimeout(() => setExportedReport(""), 2400);
                          }}
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
                    <td colSpan={6} style={{ textAlign: "center", padding: "3rem 1.5rem", color: "var(--text-secondary)" }}>
                      No student reports match your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {exportedReport && (
          <div style={{ position: "fixed", right: "1.25rem", bottom: "1.25rem", zIndex: 999, background: "var(--text-primary)", color: "#fff", padding: "0.75rem 1rem", borderRadius: 8, boxShadow: "var(--shadow-lg)", fontSize: "0.875rem", fontWeight: 600 }}>
            Export prepared for {exportedReport}
          </div>
        )}
      </div>
    </AppShell>
  );
}
