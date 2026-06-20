"use client";
import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { STUDENT_LIST } from "@/lib/mockData";
import { Search, Eye, Users, X } from "lucide-react";
import Link from "next/link";

const getSkillsForStudent = (score: number) => {
  if (score >= 90) return ["Algebra", "Arithmetic", "Geometry"];
  if (score >= 80) return ["Algebra", "Arithmetic"];
  if (score >= 70) return ["Algebra"];
  if (score >= 60) return ["Arithmetic"];
  return [];
};

export default function TeacherStudentsPage() {
  const [students] = useState(() => 
    STUDENT_LIST.map((s, idx) => ({
      ...s,
      grade: idx % 2 === 0 ? "Class 10 - A" : "Class 9 - B"
    }))
  );
  const [search, setSearch] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("All Batches");

  const filtered = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesBatch = selectedBatch === "All Batches" || s.grade === selectedBatch;
    return matchesSearch && matchesBatch;
  });

  return (
    <AppShell title="Student Directory">
      <div className="animate-fade-in-up">
        

        {/* Controls Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", gap: "1rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", flex: 1, maxWidth: 360 }}>
            <div style={{ position: "relative", width: "100%" }}>
              <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                className="tp-input"
                placeholder="Search students..."
                style={{ paddingLeft: "2.25rem" }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <select 
              className="tp-select" 
              style={{ width: 150 }}
              value={selectedBatch}
              onChange={e => setSelectedBatch(e.target.value)}
            >
              <option value="All Batches">All Batches</option>
              <option value="Class 10 - A">Class 10 - A</option>
              <option value="Class 9 - B">Class 9 - B</option>
            </select>
          </div>
        </div>

        {filtered.length > 0 ? (
          /* ── Table ───────────────────────────────────────────────── */
          <div className="tp-card" style={{ padding: 0 }}>
            <table className="tp-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Assessments</th>
                  <th>Skills</th>
                  <th>View Report</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => {
                  const assessmentCount = 4; // Mock assessments completed
                  
                  return (
                    <tr key={s.id}>
                      {/* Student Name */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: "50%",
                            background: "var(--primary-light)", color: "var(--primary)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: 700, fontSize: "0.8rem"
                          }}>
                            {s.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{s.name}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.125rem" }}>{s.grade || "Class 10 - A"}</div>
                          </div>
                        </div>
                      </td>

                      {/* Assessments */}
                      <td style={{ fontWeight: 500, color: "var(--text-secondary)" }}>{assessmentCount}</td>

                      {/* Skills */}
                      <td>
                        <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                          {getSkillsForStudent(s.score || 85).map(skill => (
                            <span 
                              key={skill} 
                              className="tp-badge tp-badge-success"
                              style={{ 
                                padding: "0.25rem 0.625rem", 
                                fontSize: "0.75rem", 
                                borderRadius: "6px",
                                fontWeight: 600
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* View Report */}
                      <td>
                        <Link href="/report/session-001" className="tp-btn-primary" style={{ padding: "0.4rem 0.875rem", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                          <Eye size={12} /> View Report
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* ── Empty State ─────────────────────────────────────────── */
          <div className="tp-card animate-fade-in-up" style={{ padding: "4rem 2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={30} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                No student records found.
              </h3>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Try adjusting your search criteria or filters.
              </p>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
