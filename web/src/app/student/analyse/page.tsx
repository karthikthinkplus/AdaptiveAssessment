"use client";

import RouteGuard from "@/components/auth/RouteGuard";
import AppShell from "@/components/layout/AppShell";
import { readSessionUser } from "@/lib/browserState";
import { AlertTriangle, BarChart3, CalendarDays, CheckCircle2, ChevronDown, Diamond, Filter, Search, ShieldAlert, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

const testRows = [
  {
    id: 1,
    name: "Practice - Time & Work",
    type: "Practice",
    date: "2026-07-11",
    topic: "Arithmetic",
    difficulty: "Medium",
    score: 67,
    questions: 5,
    correct: 3,
    attempted: "Attempted",
    bookmarked: true,
    timeBucket: "Slow",
    swot: {
      strengths: ["Understands direct rate and unit conversion questions"],
      weaknesses: ["Loses accuracy when time and fuel units are mixed"],
      opportunities: ["Revise proportion setups before attempting timed practice"],
      threats: ["Slow calculation speed can reduce adaptive score in Arithmetic"]
    }
  },
  {
    id: 2,
    name: "Adaptive Assessment - Algebra",
    type: "Adaptive Assessment",
    date: "2026-07-09",
    topic: "Algebra",
    difficulty: "Hard",
    score: 82,
    questions: 15,
    correct: 12,
    attempted: "Attempted",
    bookmarked: false,
    timeBucket: "Optimal",
    swot: {
      strengths: ["Strong performance in equations and sequence recognition"],
      weaknesses: ["Occasional errors in hard inequality constraints"],
      opportunities: ["Move into mixed Algebra adaptive drills"],
      threats: ["Hard-level traps may appear earlier if confidence rises too quickly"]
    }
  },
  {
    id: 3,
    name: "Practice - Progression & Series",
    type: "Practice",
    date: "2026-07-04",
    topic: "Algebra",
    difficulty: "Easy",
    score: 90,
    questions: 5,
    correct: 5,
    attempted: "Attempted",
    bookmarked: false,
    timeBucket: "Fast",
    swot: {
      strengths: ["Consistently identifies simple progression patterns"],
      weaknesses: ["Needs more exposure to non-standard series wording"],
      opportunities: ["Upgrade practice from easy to medium Algebra sets"],
      threats: ["Comfort zone on easy questions may hide gaps in adaptive tests"]
    }
  },
  {
    id: 4,
    name: "Adaptive Assessment - Arithmetic",
    type: "Adaptive Assessment",
    date: "2026-06-28",
    topic: "Arithmetic",
    difficulty: "Medium",
    score: 74,
    questions: 15,
    correct: 11,
    attempted: "Attempted",
    bookmarked: true,
    timeBucket: "Optimal",
    swot: {
      strengths: ["Good base accuracy across Arithmetic subtopics"],
      weaknesses: ["Mistakes cluster around ratio variation questions"],
      opportunities: ["Use bookmarked questions to build a focused revision set"],
      threats: ["Repeated ratio errors can cap adaptive difficulty growth"]
    }
  }
];

const questionFilters = ["Topics", "Difficulty", "Bookmarks", "Attempt", "Time Spent"];
const swotMeta = {
  strengths: { title: "Strengths", icon: CheckCircle2 },
  weaknesses: { title: "Weaknesses", icon: AlertTriangle },
  opportunities: { title: "Opportunities", icon: TrendingUp },
  threats: { title: "Threats", icon: ShieldAlert }
} as const;

export default function StudentAnalysePage() {
  const [user] = useState(() => readSessionUser({ name: "Student", avatar: "S", role: "student" }));
  const [testName, setTestName] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [topic, setTopic] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [bookmarkFilter, setBookmarkFilter] = useState("All");
  const [attemptFilter, setAttemptFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("All");
  const [nameQuery, setNameQuery] = useState("");

  const filteredRows = useMemo(() => testRows.filter((row) => {
    if (testName !== "All" && row.type !== testName) return false;
    if (nameQuery && !row.name.toLowerCase().includes(nameQuery.toLowerCase())) return false;
    if (topic !== "All" && row.topic !== topic) return false;
    if (difficulty !== "All" && row.difficulty !== difficulty) return false;
    if (bookmarkFilter === "Bookmarked" && !row.bookmarked) return false;
    if (bookmarkFilter === "Not Bookmarked" && row.bookmarked) return false;
    if (attemptFilter !== "All" && row.attempted !== attemptFilter) return false;
    if (timeFilter !== "All" && row.timeBucket !== timeFilter) return false;
    if (dateFrom && row.date < dateFrom) return false;
    if (dateTo && row.date > dateTo) return false;
    return true;
  }), [attemptFilter, bookmarkFilter, dateFrom, dateTo, difficulty, nameQuery, testName, timeFilter, topic]);

  const averageScore = filteredRows.length
    ? Math.round(filteredRows.reduce((total, row) => total + row.score, 0) / filteredRows.length)
    : 0;
  const totalQuestions = filteredRows.reduce((total, row) => total + row.questions, 0);
  const totalCorrect = filteredRows.reduce((total, row) => total + row.correct, 0);
  const accuracy = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const swotSummary = useMemo(() => {
    const summary = {
      strengths: [] as string[],
      weaknesses: [] as string[],
      opportunities: [] as string[],
      threats: [] as string[]
    };

    filteredRows.forEach((row) => {
      summary.strengths.push(...row.swot.strengths);
      summary.weaknesses.push(...row.swot.weaknesses);
      summary.opportunities.push(...row.swot.opportunities);
      summary.threats.push(...row.swot.threats);
    });

    return summary;
  }, [filteredRows]);

  return (
    <RouteGuard allowedRoles={["student"]}>
      <AppShell role="student" userName={user.name} userAvatar={user.avatar} title="Analyse">
        <div className="analyse-page">
          <section className="analyse-info-band">
            <h1>Topic Test Analytics</h1>
            <p><Diamond size={18} /> Filter by test name, calendar range, exam type, and question details to see your updated SWOT analysis.</p>
          </section>

          <div className="analyse-layout">
            <aside className="analyse-filters">
              <div className="analyse-filter-card">
                <h2>Exams</h2>
                <label><ChevronDown size={14} /> IPMAT</label>
                <label><input type="checkbox" checked={testName === "All" || testName === "Practice"} onChange={() => setTestName(testName === "Practice" ? "All" : "Practice")} /> Practice Tests</label>
                <label><input type="checkbox" checked={testName === "Adaptive Assessment"} onChange={() => setTestName(testName === "Adaptive Assessment" ? "All" : "Adaptive Assessment")} /> Adaptive Assessment</label>
                <label><input type="checkbox" /> PYQ</label>
              </div>

              <div className="analyse-filter-card">
                <h2>Range</h2>
                <div className="analyse-date-grid">
                  <label>
                    <CalendarDays size={13} />
                    <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
                  </label>
                  <label>
                    <CalendarDays size={13} />
                    <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
                  </label>
                </div>
                <small>Please select a date range to see matching questions.</small>
              </div>

              <div className="analyse-filter-card">
                <h2>Questions</h2>
                {questionFilters.map((filter) => (
                  <details key={filter} open={filter === "Topics"}>
                    <summary>{filter}</summary>
                    {filter === "Topics" && (
                      <select value={topic} onChange={(event) => setTopic(event.target.value)}>
                        <option>All</option>
                        <option>Arithmetic</option>
                        <option>Algebra</option>
                      </select>
                    )}
                    {filter === "Difficulty" && (
                      <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
                        <option>All</option>
                        <option>Easy</option>
                        <option>Medium</option>
                        <option>Hard</option>
                      </select>
                    )}
                    {filter === "Bookmarks" && (
                      <select value={bookmarkFilter} onChange={(event) => setBookmarkFilter(event.target.value)}>
                        <option>All</option>
                        <option>Bookmarked</option>
                        <option>Not Bookmarked</option>
                      </select>
                    )}
                    {filter === "Attempt" && (
                      <select value={attemptFilter} onChange={(event) => setAttemptFilter(event.target.value)}>
                        <option>All</option>
                        <option>Attempted</option>
                        <option>Unattempted</option>
                      </select>
                    )}
                    {filter === "Time Spent" && (
                      <select value={timeFilter} onChange={(event) => setTimeFilter(event.target.value)}>
                        <option>All</option>
                        <option>Fast</option>
                        <option>Optimal</option>
                        <option>Slow</option>
                      </select>
                    )}
                  </details>
                ))}
              </div>
            </aside>

            <main className="analyse-results">
              <div className="analyse-results-head">
                <p>Choose the exams and filter on the basis of topic, subtopic and difficulty.</p>
                <div className="analyse-search">
                  <Search size={15} />
                  <input placeholder="Filter test names..." value={nameQuery} onChange={(event) => setNameQuery(event.target.value)} />
                </div>
              </div>

              <div className="analyse-metrics">
                <div><span>Average Score</span><strong>{averageScore}%</strong></div>
                <div><span>Tests Analysed</span><strong>{filteredRows.length}</strong></div>
                <div><span>Accuracy</span><strong>{accuracy}%</strong></div>
              </div>

              {filteredRows.length === 0 ? (
                <div className="analyse-empty">
                  <Filter size={30} />
                  <strong>No test data matches these filters.</strong>
                  <span>Try changing the exam, calendar range, or question filters.</span>
                </div>
              ) : (
                <>
                  <section className="analyse-swot-panel">
                    <div className="analyse-section-title">
                      <h2>SWOT Analysis</h2>
                      <span>{totalCorrect}/{totalQuestions} questions correct across selected tests</span>
                    </div>
                    <div className="analyse-swot-grid">
                      {(Object.keys(swotMeta) as Array<keyof typeof swotMeta>).map((key) => {
                        const Icon = swotMeta[key].icon;
                        const points = Array.from(new Set(swotSummary[key]));

                        return (
                          <article key={key} className="analyse-swot-card">
                            <div>
                              <Icon size={18} />
                              <strong>{swotMeta[key].title}</strong>
                            </div>
                            <ul>
                              {points.slice(0, 4).map((point) => <li key={point}>{point}</li>)}
                            </ul>
                          </article>
                        );
                      })}
                    </div>
                  </section>

                  <div className="analyse-table-card">
                    {filteredRows.map((row) => (
                      <div key={row.id} className="analyse-row">
                        <div>
                          <strong>{row.name}</strong>
                          <span>{row.date} · {row.topic} · {row.difficulty} · {row.timeBucket}</span>
                        </div>
                        <div>
                          <BarChart3 size={18} />
                          <strong>{row.score}%</strong>
                          <span>{row.correct}/{row.questions}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </main>
          </div>
        </div>
      </AppShell>
    </RouteGuard>
  );
}
