"use client";
import AppShell from "@/components/layout/AppShell";
import SimpleBarChart from "@/components/charts/SimpleBarChart";
import { ADMIN_STATS, ADMIN_STUDENT_PROGRESS, INSTITUTION_LIST } from "@/lib/mockData";
import { Building2, Users, ClipboardList, BarChart3, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <AppShell role="admin" userName="Ravi Kumar" userAvatar="RK" title="Admin Dashboard">

      {/* ── Admin Dashboard Stat Cards ───────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Total Institutions", value: ADMIN_STATS.totalInstitutions, trend: ADMIN_STATS.institutionsTrend, icon: <Building2 size={18} color="var(--primary)" /> },
          { label: "Platform Users", value: ADMIN_STATS.totalUsers.toLocaleString(), trend: ADMIN_STATS.usersTrend, icon: <Users size={18} color="var(--primary)" /> },
          { label: "Active Assessments", value: ADMIN_STATS.activeAssessments, trend: ADMIN_STATS.assessmentsTrend, icon: <ClipboardList size={18} color="var(--primary)" /> },
          { label: "Platform Avg Score", value: `${ADMIN_STATS.platformAvgScore}%`, trend: ADMIN_STATS.scoreTrend, icon: <BarChart3 size={18} color="var(--primary)" /> },
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
              <span>{stat.trend}</span>
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
              <div style={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1, color: "var(--text-primary)" }}>{ADMIN_STUDENT_PROGRESS.average}%</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>Across active grades</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--success)", fontWeight: 700 }}>{ADMIN_STUDENT_PROGRESS.trend}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>{ADMIN_STUDENT_PROGRESS.completedAssessments.toLocaleString()} completed tests</div>
            </div>
          </div>
          <SimpleBarChart
            data={ADMIN_STUDENT_PROGRESS.segments}
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
                {INSTITUTION_LIST.slice(0, 4).map((inst) => (
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
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
