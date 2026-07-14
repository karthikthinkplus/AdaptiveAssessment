"use client";

import RouteGuard from "@/components/auth/RouteGuard";
import AppShell from "@/components/layout/AppShell";
import { readSessionUser } from "@/lib/browserState";
import { BookOpen, CheckCircle2, ChevronDown, Clock3 } from "lucide-react";
import { useMemo, useState } from "react";

const practiceSessions = [
  {
    id: "ps-arithmetic-01",
    title: "Arithmetic Booster",
    status: "Active",
    startedAt: "Today, 9:00 AM",
    dueAt: "Today, 8:00 PM",
    topics: [
      {
        id: "time-work",
        name: "Time & Work",
        assigned: 32,
        clearedStudents: ["Aarav Mehta", "Diya Rao", "Harika Kota", "Ishaan Verma", "Meera Iyer", "Rohan Das", "Saanvi Shah", "Vivaan Nair"]
      },
      {
        id: "ratio",
        name: "Ratio, Proportion & Variation",
        assigned: 32,
        clearedStudents: ["Diya Rao", "Ishaan Verma", "Meera Iyer", "Saanvi Shah", "Tara Singh"]
      },
      {
        id: "profit-loss",
        name: "Profit & Loss",
        assigned: 32,
        clearedStudents: ["Aarav Mehta", "Harika Kota", "Rohan Das", "Vivaan Nair"]
      }
    ]
  },
  {
    id: "ps-algebra-01",
    title: "Algebra Practice Sprint",
    status: "Active",
    startedAt: "Yesterday, 5:30 PM",
    dueAt: "Tomorrow, 6:00 PM",
    topics: [
      {
        id: "progression",
        name: "Progression & Series",
        assigned: 28,
        clearedStudents: ["Aarav Mehta", "Diya Rao", "Ishaan Verma", "Meera Iyer", "Rohan Das", "Saanvi Shah", "Tara Singh", "Vivaan Nair", "Zoya Khan"]
      },
      {
        id: "inequalities",
        name: "Inequalities & Linear Equation",
        assigned: 28,
        clearedStudents: ["Diya Rao", "Meera Iyer", "Saanvi Shah", "Zoya Khan"]
      }
    ]
  },
  {
    id: "ps-dilr-01",
    title: "DILR Sets - Daily Drill",
    status: "Active",
    startedAt: "Today, 11:30 AM",
    dueAt: "Tomorrow, 9:00 PM",
    topics: [
      {
        id: "arrangements",
        name: "Arrangements",
        assigned: 24,
        clearedStudents: ["Aarav Mehta", "Ishaan Verma", "Rohan Das", "Tara Singh"]
      },
      {
        id: "sets",
        name: "Set Theory",
        assigned: 24,
        clearedStudents: ["Diya Rao", "Harika Kota", "Meera Iyer", "Saanvi Shah", "Vivaan Nair"]
      }
    ]
  }
];

export default function TeacherPracticeSessionsPage() {
  const [user] = useState(() => readSessionUser({ name: "Teacher", avatar: "T", role: "teacher" }));
  const activeTopicCount = practiceSessions.reduce((total, session) => total + session.topics.length, 0);
  const totalAssigned = practiceSessions.reduce((total, session) => (
    total + session.topics.reduce((topicTotal, topic) => topicTotal + topic.assigned, 0)
  ), 0);
  const totalCleared = practiceSessions.reduce((total, session) => (
    total + session.topics.reduce((topicTotal, topic) => topicTotal + topic.clearedStudents.length, 0)
  ), 0);
  const overallClearRate = useMemo(() => (
    totalAssigned ? Math.round((totalCleared / totalAssigned) * 100) : 0
  ), [totalAssigned, totalCleared]);

  return (
    <RouteGuard allowedRoles={["teacher"]}>
      <AppShell role="teacher" userName={user.name} userAvatar={user.avatar} title="Practice Sessions">
        <div className="teacher-practice-page">
          <section className="teacher-practice-hero">
            <div>
              <span><BookOpen size={16} /> Active Practice Sessions</span>
              <h1>Track topic clearance in real time</h1>
              <p>Open a topic row to see which students have cleared that practice section.</p>
            </div>
            <div className="teacher-practice-stats">
              <article><strong>{practiceSessions.length}</strong><span>active sessions</span></article>
              <article><strong>{activeTopicCount}</strong><span>topics live</span></article>
              <article><strong>{overallClearRate}%</strong><span>clear rate</span></article>
            </div>
          </section>

          <div className="teacher-session-list">
            {practiceSessions.map((session) => {
              const sessionAssigned = session.topics.reduce((total, topic) => total + topic.assigned, 0);
              const sessionCleared = session.topics.reduce((total, topic) => total + topic.clearedStudents.length, 0);
              const sessionRate = sessionAssigned ? Math.round((sessionCleared / sessionAssigned) * 100) : 0;

              return (
                <section key={session.id} className="teacher-session-card">
                  <div className="teacher-session-head">
                    <div>
                      <span className="teacher-session-status">{session.status}</span>
                      <h2>{session.title}</h2>
                      <p><Clock3 size={14} /> Started {session.startedAt} · Due {session.dueAt}</p>
                    </div>
                    <div className="teacher-session-clearance">
                      <strong>{sessionRate}%</strong>
                      <span>{sessionCleared}/{sessionAssigned} topic attempts cleared</span>
                    </div>
                  </div>

                  <div className="teacher-topic-table">
                    {session.topics.map((topic) => {
                      const clearedCount = topic.clearedStudents.length;
                      const clearRate = topic.assigned ? Math.round((clearedCount / topic.assigned) * 100) : 0;

                      return (
                        <details key={topic.id} className="teacher-topic-dropdown">
                          <summary>
                            <div>
                              <strong>{topic.name}</strong>
                              <span>{clearedCount} of {topic.assigned} students cleared</span>
                            </div>
                            <div className="teacher-topic-actions">
                              <span>{clearRate}%</span>
                              <ChevronDown size={16} />
                            </div>
                          </summary>

                          <div className="teacher-cleared-list">
                            {topic.clearedStudents.map((student) => (
                              <div key={student} className="teacher-cleared-student">
                                <span>{student.split(" ").map((part) => part[0]).join("")}</span>
                                <strong>{student}</strong>
                                <small><CheckCircle2 size={13} /> Cleared</small>
                              </div>
                            ))}
                          </div>
                        </details>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </AppShell>
    </RouteGuard>
  );
}
