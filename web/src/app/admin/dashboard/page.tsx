"use client";
import AppShell from "@/components/layout/AppShell";
import SimpleBarChart from "@/components/charts/SimpleBarChart";
import { Building2, Users, ClipboardList, BarChart3, ArrowUpRight } from "lucide-react";
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

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalInstitutions: 0,
    totalUsers: 0,
    activeAssessments: 0,
    platformAvgScore: 0,
  });
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [completedTestsCount, setCompletedTestsCount] = useState(0);

  useEffect(() => {
    Promise.all([
      api.get<any[]>("/api/v1/users"),
      api.get<any[]>("/api/v1/questions"),
      api.get<any[]>("/api/v1/topics")
    ]).then(([usersList, questionsList, topicsList]) => {
      const uList = usersList || [];
      const qList = questionsList || [];
      const tList = topicsList || [];

      // Filter distinct institutions
      const instNames = Array.from(new Set(uList.map(u => u.institution_name).filter(Boolean)));
      
      const instData = instNames.map((name, idx) => {
        const matchingUsers = uList.filter(u => u.institution_name === name);
        const stuCount = matchingUsers.filter(u => inferRole(u.email, u.institution_name) === "Student").length;
        const teachCount = matchingUsers.filter(u => inferRole(u.email, u.institution_name) === "Teacher").length;
        return {
          id: `inst-${idx}`,
          name,
          type: "School",
          city: "Local",
          students: stuCount,
          teachers: teachCount,
          status: "Active"
        };
      });

      setInstitutions(instData);

      // Student segments by grade
      const gradeMap: Record<string, { label: string; progress: number; students: number }> = {
        "Grade 8": { label: "Grade 8", progress: 0, students: 0 },
        "Grade 9": { label: "Grade 9", progress: 0, students: 0 },
        "Grade 10": { label: "Grade 10", progress: 0, students: 0 }
      };

      uList.forEach(u => {
        if (inferRole(u.email, u.institution_name) === "Student") {
          const grade = u.grade || "Grade 10";
          if (gradeMap[grade]) {
            gradeMap[grade].students += 1;
          }
        }
      });

      setSegments(Object.values(gradeMap).filter(s => s.students > 0));

      setStats({
        totalInstitutions: instNames.length,
        totalUsers: uList.length,
        activeAssessments: tList.length,
        platformAvgScore: 0
      });
    }).catch(err => {
      console.error("Failed to load admin dashboard stats", err);
    });
  }, []);

  return (
    <AppShell role="admin" userName="Ravi Kumar" userAvatar="RK" title="Admin Dashboard">

      {/* ── Admin Dashboard Stat Cards ───────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Total Institutions", value: stats.totalInstitutions, icon: <Building2 size={18} color="var(--primary)" /> },
          { label: "Platform Users", value: stats.totalUsers.toLocaleString(), icon: <Users size={18} color="var(--primary)" /> },
          { label: "Active Assessments", value: stats.activeAssessments, icon: <ClipboardList size={18} color="var(--primary)" /> },
          { label: "Platform Avg Score", value: `${stats.platformAvgScore}%`, icon: <BarChart3 size={18} color="var(--primary)" /> },
        ].map((stat, i) => (
          <div key={i} className="tp-stat-card animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span className="tp-stat-label">{stat.label}</span>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {stat.icon}
              </div>
            </div>
            <div className="tp-stat-value">{stat.value}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", color: "var(--success)", fontWeight: 600, borderTop: "1px solid var(--border)", paddingTop: "0.5rem", marginTop: "0.5rem" }}>
              <span>Registered records</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts & Tables Row ────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.2fr)", gap: "1.25rem", marginBottom: "1.25rem" }}>
        {/* Average Student Progress */}
        <div className="tp-card animate-fade-in-up stagger-1" style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: "1rem" }}>Average Student Progress</div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "1rem", marginBottom: "1.25rem" }}>
            <div>
              <div style={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1, color: "var(--text-primary)" }}>{stats.platformAvgScore}%</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>Across active grades</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--success)", fontWeight: 700 }}>+0% vs last month</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>{completedTestsCount.toLocaleString()} completed tests</div>
            </div>
          </div>
          <SimpleBarChart
            data={segments.length > 0 ? segments : [
              { label: "Grade 8", progress: 0 },
              { label: "Grade 9", progress: 0 },
              { label: "Grade 10", progress: 0 }
            ]}
            xKey="label"
            bars={[{ key: "progress", color: "var(--primary)", name: "Average progress" }]}
            height={220}
            horizontal
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "1rem" }}>
            <span>Progress target</span>
            <span style={{ color: "var(--primary)", fontWeight: 600 }}>75%</span>
          </div>
        </div>

        {/* Quick Institutions Overview */}
        <div className="tp-card animate-fade-in-up stagger-2" style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>Active Institutions</div>
            <Link href="/admin/institutions" style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem", textDecoration: "none" }}>
              Manage all <ArrowUpRight size={14} />
            </Link>
          </div>
          <div style={{ overflowX: "auto", flex: 1 }}>
            <table className="tp-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>City</th>
                  <th>Students</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {institutions.slice(0, 4).map((inst) => (
                  <tr key={inst.id}>
                    <td style={{ fontWeight: 600 }}>{inst.name}</td>
                    <td>{inst.type}</td>
                    <td>{inst.city}</td>
                    <td style={{ fontWeight: 600 }}>{inst.students}</td>
                    <td>
                      <span className={`tp-badge ${inst.status === "Active" ? "tp-badge-success" : "tp-badge-danger"}`}>
                        {inst.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {institutions.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", color: "var(--text-secondary)", padding: "2rem" }}>
                      No registered institutions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
