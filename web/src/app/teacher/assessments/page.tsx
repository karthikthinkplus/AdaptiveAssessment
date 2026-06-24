"use client";
import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { Search } from "lucide-react";
import { api } from "@/lib/api";

const TEACHER_GRADE = "Grade 10";

export default function TeacherAssessmentsPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get<any[]>("/api/v1/topics").then((list) => {
      const mapped = (list || []).map((topic: any) => {
        const isGrade9 = topic.name.toLowerCase().includes("grade 9") || topic.name.toLowerCase().includes("class 9");
        const isGrade8 = topic.name.toLowerCase().includes("grade 8") || topic.name.toLowerCase().includes("class 8");
        const grade = isGrade9 ? "Grade 9" : isGrade8 ? "Grade 8" : "Grade 10";

        return {
          id: topic.id,
          name: topic.name,
          subject: "Mathematics",
          grade,
          questions: topic.question_count ?? 0,
          date: new Date(topic.created_at).toLocaleDateString(),
          status: topic.is_active ? "active" : "completed",
        };
      });
      // Filter for Grade 10 to simulate teacher profile
      setAssessments(mapped.filter(a => a.grade === TEACHER_GRADE));
    }).catch((err) => {
      console.error("Failed to load assessments (topics) from API", err);
    });
  }, []);

  const filtered = assessments.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.subject && a.subject.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AppShell title="Manage Assessments">
      <div className="animate-fade-in-up">
        {/* Actions bar */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "0.5rem", flex: 1, maxWidth: 400 }}>
            <div style={{ position: "relative", width: "100%" }}>
              <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input 
                className="tp-input" 
                placeholder="Search assessments..." 
                style={{ paddingLeft: "2.25rem" }} 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* List Card */}
        <div className="tp-card" style={{ padding: 0 }}>
          <table className="tp-table">
            <thead>
              <tr>
                <th>Assessment Name</th>
                <th>Target</th>
                <th>Questions</th>
                <th>Assigned Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.125rem" }}>{item.subject}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.85rem", fontWeight: 500 }}>{item.grade || "Class 10 - A"}</div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{item.questions} Qs</td>
                  <td style={{ color: "var(--text-secondary)", fontSize: "0.8125rem" }}>{item.date}</td>
                  <td>
                    <span className={`tp-badge ${
                      item.status === "active" ? "tp-badge-success" : 
                      item.status === "upcoming" ? "tp-badge-warning" : "tp-badge-neutral"
                    }`} style={{ textTransform: "capitalize" }}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>
                    No assessments found matching search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
