"use client";
import AppShell from "@/components/layout/AppShell";
import { SAMPLE_QUESTIONS, type Question } from "@/lib/mockData";
import { Search, Trash, Edit, Plus, BookOpen } from "lucide-react";
import { useState } from "react";

type Difficulty = "very_easy" | "easy" | "medium" | "hard" | "very_hard";

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: "very_easy", label: "Very Easy" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "very_hard", label: "Very Hard" },
];

const difficultyLabel = (difficulty: Difficulty) =>
  DIFFICULTY_OPTIONS.find(option => option.value === difficulty)?.label || difficulty;

const difficultyBadgeClass = (difficulty: Difficulty) => {
  if (difficulty === "very_easy" || difficulty === "easy") return "tp-badge-success";
  if (difficulty === "medium") return "tp-badge-warning";
  return "tp-badge-danger";
};

export default function QBMQuestionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [questions, setQuestions] = useState(SAMPLE_QUESTIONS);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newTopic, setNewTopic] = useState("Algebra");
  const [newDifficulty, setNewDifficulty] = useState<Difficulty>("easy");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingQuestion) {
      const updated = questions.map(q => {
        if (q.id === editingQuestion.id) {
          return {
            ...q,
            text: newQuestionText,
            skillBreadcrumb: { topic: newTopic, skill: q.skillBreadcrumb.skill },
            difficulty: newDifficulty,
            options: [
              { key: "A" as const, text: optA },
              { key: "B" as const, text: optB },
              { key: "C" as const, text: optC },
              { key: "D" as const, text: optD }
            ]
          };
        }
        return q;
      });
      setQuestions(updated);
    } else {
      const newQ = {
        id: `q${questions.length + 1}`,
        index: questions.length + 1,
        totalQuestions: questions.length + 1,
        text: newQuestionText,
        options: [
          { key: "A" as const, text: optA },
          { key: "B" as const, text: optB },
          { key: "C" as const, text: optC },
          { key: "D" as const, text: optD }
        ],
        skillBreadcrumb: { topic: newTopic, skill: "General Assessment" },
        grade: 10,
        difficulty: newDifficulty,
        wordProblem: false
      };
      setQuestions([...questions, newQ]);
    }
    setIsModalOpen(false);
    setEditingQuestion(null);
    setNewQuestionText("");
    setOptA("");
    setOptB("");
    setOptC("");
    setOptD("");
  };

  const filtered = questions.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          q.skillBreadcrumb.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = !selectedTopic || q.skillBreadcrumb.topic === selectedTopic;
    const matchesDifficulty = !selectedDifficulty || q.difficulty === selectedDifficulty;
    return matchesSearch && matchesTopic && matchesDifficulty;
  });

  return (
    <AppShell title="Question Bank Browser">
      {/* ── Actions Row ────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
        <button 
          onClick={() => {
            setEditingQuestion(null);
            setNewQuestionText("");
            setNewTopic("Algebra");
            setNewDifficulty("easy");
            setOptA("");
            setOptB("");
            setOptC("");
            setOptD("");
            setIsModalOpen(true);
          }} 
          className="tp-btn-primary" 
          style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
        >
          <Plus size={16} /> Add Question
        </button>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
          <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            className="tp-input"
            style={{ paddingLeft: "2.5rem" }}
            placeholder="Search questions by text or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="tp-select" 
          style={{ width: 150 }}
          value={selectedTopic}
          onChange={e => setSelectedTopic(e.target.value)}
        >
          <option value="">All Topics</option>
          <option value="Algebra">Algebra</option>
          <option value="Arithmetic">Arithmetic</option>
          <option value="Geometry">Geometry</option>
        </select>
        <select 
          className="tp-select" 
          style={{ width: 150 }}
          value={selectedDifficulty}
          onChange={e => setSelectedDifficulty(e.target.value)}
        >
          <option value="">All Difficulties</option>
          {DIFFICULTY_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* ── Questions List ───────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {filtered.map((q, idx) => (
          <div key={q.id} className="tp-card animate-fade-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <span className="tp-badge tp-badge-neutral"><BookOpen size={12} style={{ marginRight: 2 }} /> {q.skillBreadcrumb.topic}</span>
                <span className="tp-badge tp-badge-neutral">{q.skillBreadcrumb.skill}</span>
                <span className={`tp-badge ${difficultyBadgeClass(q.difficulty)}`}>{difficultyLabel(q.difficulty)}</span>
              </div>
              <div style={{ display: "flex", gap: "0.35rem" }}>
                <button 
                  onClick={() => {
                    setEditingQuestion(q);
                    setNewQuestionText(q.text);
                    setNewTopic(q.skillBreadcrumb.topic);
                    setNewDifficulty(q.difficulty);
                    setOptA(q.options[0]?.text || "");
                    setOptB(q.options[1]?.text || "");
                    setOptC(q.options[2]?.text || "");
                    setOptD(q.options[3]?.text || "");
                    setIsModalOpen(true);
                  }}
                  className="tp-btn-ghost" 
                  style={{ padding: "0.35rem", borderRadius: "6px" }} 
                  title="Edit"
                >
                  <Edit size={14} />
                </button>
                <button onClick={() => setQuestions(questions.filter(item => item.id !== q.id))} className="tp-btn-ghost" style={{ padding: "0.35rem", borderRadius: "6px", color: "var(--danger)" }} title="Delete">
                  <Trash size={14} />
                </button>
              </div>
            </div>
            <p style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9375rem", lineHeight: 1.5, marginBottom: "1rem" }}>
              {q.text}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              {q.options.map(opt => (
                <div key={opt.key} style={{ display: "flex", gap: "0.5rem", padding: "0.5rem 0.75rem", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "0.8125rem", background: "var(--surface)" }}>
                  <strong style={{ color: "var(--primary)" }}>{opt.key}:</strong>
                  <span>{opt.text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
            No questions found matching your filter selections.
          </div>
        )}
      </div>

      {/* ── Add/Edit Question Modal ──────────────────────────────────────── */}
      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div className="animate-scale-in" style={{ width: "100%", maxWidth: "500px", background: "#fff", borderRadius: "12px", border: "1px solid var(--border)", padding: "1.5rem", boxShadow: "var(--shadow-lg)" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1rem" }}>
              {editingQuestion ? "Edit Question" : "Add New Question"}
            </h2>
            <form onSubmit={handleSaveQuestion} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.8125rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Question Prompt</label>
                <textarea className="tp-input" style={{ minHeight: "80px", resize: "vertical" }} placeholder="Type the question content..." value={newQuestionText} onChange={e => setNewQuestionText(e.target.value)} required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: "0.8125rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Topic</label>
                  <select className="tp-select" value={newTopic} onChange={e => setNewTopic(e.target.value)}>
                    <option value="Algebra">Algebra</option>
                    <option value="Arithmetic">Arithmetic</option>
                    <option value="Geometry">Geometry</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.8125rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Difficulty</label>
                  <select className="tp-select" value={newDifficulty} onChange={e => setNewDifficulty(e.target.value as Difficulty)}>
                    {DIFFICULTY_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, display: "block" }}>Option A</label>
                  <input type="text" className="tp-input" placeholder="Value A" value={optA} onChange={e => setOptA(e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, display: "block" }}>Option B</label>
                  <input type="text" className="tp-input" placeholder="Value B" value={optB} onChange={e => setOptB(e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, display: "block" }}>Option C</label>
                  <input type="text" className="tp-input" placeholder="Value C" value={optC} onChange={e => setOptC(e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, display: "block" }}>Option D</label>
                  <input type="text" className="tp-input" placeholder="Value D" value={optD} onChange={e => setOptD(e.target.value)} required />
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="tp-btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>Cancel</button>
                <button type="submit" className="tp-btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
                  {editingQuestion ? "Save Changes" : "Add Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
