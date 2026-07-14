"use client";

import RouteGuard from "@/components/auth/RouteGuard";
import AppShell from "@/components/layout/AppShell";
import { readSessionUser } from "@/lib/browserState";
import Link from "next/link";
import { useState } from "react";

const overviewCards = [
  { label: "Activity", href: "/student/forum", image: "/overview-activity.png" },
  { label: "SWOT Analysis", href: "/student/analyse", image: "/overview-swot.png" },
  { label: "Unresolved Doubts", href: "/student/doubts", image: "/overview-doubts.png" }
];

export default function StudentDashboard() {
  const [user] = useState(() => readSessionUser({ name: "Student", avatar: "S", role: "student" }));

  return (
    <RouteGuard allowedRoles={["student"]}>
      <AppShell role="student" userName={user.name} userAvatar={user.avatar} title="Dashboard">
        <div className="student-home">
          <section className="student-progress-card">
            <div>
              <h1>Today&apos;s Progress</h1>
              <div className="student-progress-bar"><span /></div>
              <p>You&apos;ve collected <strong>0</strong><br />of <strong>100</strong> targeted berries</p>
              <button type="button">Update Target</button>
            </div>
            <div className="student-streak-grid">
              <div className="student-mini-stat">
                <img className="streak-mark" src="/streak-icon.png" alt="" aria-hidden="true" />
                <strong>0</strong>
                <span>days strong</span>
              </div>
              <div className="student-mini-stat">
                <img className="berry-mark" src="/berry-icon.png" alt="" aria-hidden="true" />
                <strong>0</strong>
                <span>berries collected</span>
              </div>
            </div>
          </section>

          <h3 className="student-section-label">Overview</h3>
          <div className="student-overview-grid">
            {overviewCards.map((card) => (
              <Link key={card.label} href={card.href} className="student-overview-card">
                <img className="student-overview-image" src={card.image} alt="" aria-hidden="true" />
                <strong>{card.label}</strong>
              </Link>
            ))}
          </div>

          <section className="student-summary-band">
            <div>
              <img className="student-adaptive-icon" src="/adaptive-assessment-icon.png" alt="" aria-hidden="true" />
              <h2>Adaptive Assessment</h2>
              <p>Review your latest adaptive and practice performance from Analyse.</p>
            </div>
            <Link href="/assessment/start" className="tp-btn-primary">Start Adaptive Assessment</Link>
          </section>
        </div>
      </AppShell>
    </RouteGuard>
  );
}
