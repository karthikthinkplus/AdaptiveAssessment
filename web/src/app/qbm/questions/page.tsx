"use client";
import AppShell from "@/components/layout/AppShell";
import { Search, Trash, Edit, Plus, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

type Difficulty = "very_easy" | "easy" | "medium" | "hard" | "very_hard";

interface Question {
  id: string;
  index: number;
  totalQuestions: number;
  text: string;
  options: { key: "A" | "B" | "C" | "D"; text: string; is_correct?: boolean }[];
  skillBreadcrumb: { topic: string; skill: string };
  difficulty: Difficulty;
  status: string;
  topic_id?: string;
  subtopic_id?: string;
}

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
  const diff = difficulty?.toLowerCase();
  if (diff === "very_easy" || diff === "easy") return "tp-badge-success";
  if (diff === "medium") return "tp-badge-warning";
  return "tp-badge-danger";
};

export default function QBMQuestionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("QBM Developer");
  const [userAvatar, setUserAvatar] = useState("RK");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [newSubtopic, setNewSubtopic] = useState("");
  const [subtopics, setSubtopics] = useState<any[]>([]);
  const [newDifficulty, setNewDifficulty] = useState<Difficulty>("easy");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [correctOpt, setCorrectOpt] = useState<"A" | "B" | "C" | "D">("A");

  const loadData = async () => {
    try {
      setLoading(true);
      const rawTopics = await api.get<any[]>("/api/v1/topics");
      const topicsList = Array.isArray(rawTopics) ? rawTopics : [];
      setTopics(topicsList);
      
      const rawQuestions = await api.get<any[]>("/api/v1/questions");
      const questionsList = Array.isArray(rawQuestions) ? rawQuestions : [];

      const topicsMap: Record<string, string> = {};
      topicsList.forEach(t => {
        topicsMap[t.id] = t.name;
      });

      // Load subtopics for all topics to map subtopic names
      const subtopicsMap: Record<string, string> = {};
      await Promise.all(
        topicsList.map(async (t: any) => {
          try {
            const subList = await api.get<any[]>(`/api/v1/topics/${t.id}/subtopics`);
            const cleanSub = Array.isArray(subList) ? subList : [];
            cleanSub.forEach((s: any) => {
              subtopicsMap[s.id] = s.name;
            });
          } catch (e) {
            console.error(`Failed to load subtopics for topic ${t.id}`, e);
          }
        })
      );

      const activeQuestions = questionsList.filter((q: any) => q.status !== "archived");

      const mapped: Question[] = activeQuestions.map((q: any, idx: number) => {
        const optMapped = (Array.isArray(q.options) ? q.options : [])
          .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
          .map((o: any) => ({
            key: o.option_label as "A" | "B" | "C" | "D",
            text: o.option_text,
            is_correct: o.is_correct
          }));
        return {
          id: q.id,
          index: idx + 1,
          totalQuestions: activeQuestions.length,
          text: q.question_text,
          options: optMapped,
          skillBreadcrumb: {
            topic: topicsMap[q.topic_id] || "Mathematics",
            skill: q.subtopic_id ? subtopicsMap[q.subtopic_id] || q.question_code || "General" : q.question_code || "General"
          },
          difficulty: (q.difficulty_level?.toLowerCase() || "easy") as Difficulty,
          status: q.status,
          topic_id: q.topic_id,
          subtopic_id: q.subtopic_id
        };
      });
      setQuestions(mapped);
    } catch (err) {
      console.error("Failed to load questions from backend", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const tpUser = sessionStorage.getItem("tp_user");
      const user = tpUser ? JSON.parse(tpUser) : null;
      if (user) {
        setUserName(user.name || "QBM Developer");
        setUserAvatar(user.avatar || "RK");
      }
    }
    loadData();
  }, []);

  // Fetch subtopics when the selected topic in the modal changes
  useEffect(() => {
    if (newTopic) {
      api.get<any[]>(`/api/v1/topics/${newTopic}/subtopics`)
        .then(list => {
          setSubtopics(list || []);
          if (list && list.length > 0) {
            // Match subtopic if editing
            if (editingQuestion && list.some(s => s.id === editingQuestion.subtopic_id)) {
              setNewSubtopic(editingQuestion.subtopic_id || list[0].id);
            } else {
              setNewSubtopic(list[0].id);
            }
          } else {
            setNewSubtopic("");
          }
        })
        .catch(err => {
          console.error("Failed to load subtopics", err);
          setSubtopics([]);
          setNewSubtopic("");
        });
    } else {
      setSubtopics([]);
      setNewSubtopic("");
    }
  }, [newTopic, editingQuestion]);

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const optionsPayload = [
        { option_label: "A", option_text: optA, is_correct: correctOpt === "A", display_order: 0 },
        { option_label: "B", option_text: optB, is_correct: correctOpt === "B", display_order: 1 },
        { option_label: "C", option_text: optC, is_correct: correctOpt === "C", display_order: 2 },
        { option_label: "D", option_text: optD, is_correct: correctOpt === "D", display_order: 3 }
      ];

      if (editingQuestion) {
        // Prepare PATCH payload
        const payload = {
          topic_id: newTopic,
          subtopic_id: newSubtopic || null,
          question_text: newQuestionText,
          difficulty_level: newDifficulty,
          correct_answer: correctOpt
        };
        await api.patch(`/api/v1/questions/${editingQuestion.id}`, payload);
      } else {
        // Prepare POST payload
        const payload = {
          topic_id: newTopic,
          subtopic_id: newSubtopic || null,
          question_text: newQuestionText,
          difficulty_level: newDifficulty,
          question_type: "mcq",
          options: optionsPayload,
          correct_answer: correctOpt,
          status: "approved"
        };
        await api.post("/api/v1/questions", payload);
      }

      await loadData();
      setIsModalOpen(false);
      setEditingQuestion(null);
      setNewQuestionText("");
      setOptA("");
      setOptB("");
      setOptC("");
      setOptD("");
    } catch (err: any) {
      alert("Failed to save question: " + err.message);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      try {
        await api.patch(`/api/v1/questions/${id}`, { status: "archived" });
        await loadData();
      } catch (err: any) {
        alert("Failed to delete question: " + err.message);
      }
    }
  };

  const filtered = questions.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          q.skillBreadcrumb.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = !selectedTopic || q.topic_id === selectedTopic;
    const matchesDifficulty = !selectedDifficulty || q.difficulty === selectedDifficulty;
    return matchesSearch && matchesTopic && matchesDifficulty;
  });

  return (
    <AppShell role="qbm" userName={userName} userAvatar={userAvatar} title="Question Bank Browser">
      {/* ── Actions Row ────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
        <button 
          onClick={() => {
            setEditingQuestion(null);
            setNewQuestionText("");
            if (topics.length > 0) {
              setNewTopic(topics[0].id);
            } else {
              setNewTopic("");
            }
            setNewDifficulty("easy");
            setOptA("");
            setOptB("");
            setOptC("");
            setOptD("");
            setCorrectOpt("A");
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
            placeholder="Search questions by text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="tp-select" 
          style={{ width: 200 }}
          value={selectedTopic}
          onChange={e => setSelectedTopic(e.target.value)}
        >
          <option value="">All Topics</option>
          {topics.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <select 
          className="tp-select" 
          style={{ width: 180 }}
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
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
            Loading Question Bank...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
            No questions found matching your filter selections.
          </div>
        ) : (
          filtered.map((q, idx) => (
            <div key={q.id} className="tp-card animate-fade-in-up" style={{ padding: "1.25rem", animationDelay: `${idx * 0.05}s` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "0.75rem" }}>
                <p style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9375rem", lineHeight: 1.45, margin: 0, flex: 1 }}>
                  {q.text}
                </p>
                <div style={{ display: "flex", gap: "0.35rem", flexShrink: 0 }}>
                  <button 
                    onClick={() => {
                      setEditingQuestion(q);
                      setNewQuestionText(q.text);
                      setNewTopic(q.topic_id || "");
                      setNewDifficulty(q.difficulty);
                      setOptA(q.options.find(o => o.key === "A")?.text || "");
                      setOptB(q.options.find(o => o.key === "B")?.text || "");
                      setOptC(q.options.find(o => o.key === "C")?.text || "");
                      setOptD(q.options.find(o => o.key === "D")?.text || "");
                      const backendCorrectLabel = q.options.find((o: any) => o.is_correct)?.key || "A";
                      setCorrectOpt(backendCorrectLabel);
                      setIsModalOpen(true);
                    }}
                    className="tp-btn-ghost" 
                    style={{ padding: "0.35rem", borderRadius: "6px" }} 
                    title="Edit"
                  >
                    <Edit size={14} />
                  </button>
                  <button onClick={() => handleDeleteQuestion(q.id)} className="tp-btn-ghost" style={{ padding: "0.35rem", borderRadius: "6px", color: "var(--danger)" }} title="Delete">
                    <Trash size={14} />
                  </button>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                {q.options.map(opt => (
                  <div key={opt.key} style={{ display: "flex", gap: "0.5rem", padding: "0.375rem 0.625rem", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "0.8125rem", background: "var(--surface)" }}>
                    <strong style={{ color: "var(--primary)" }}>{opt.key}:</strong>
                    <span>{opt.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
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
                  <select className="tp-select" value={newTopic} onChange={e => setNewTopic(e.target.value)} required>
                    {topics.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.8125rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Subtopic</label>
                  <select className="tp-select" value={newSubtopic} onChange={e => setNewSubtopic(e.target.value)} required>
                    {subtopics.length === 0 ? (
                      <option value="">No subtopics</option>
                    ) : (
                      subtopics.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: "0.8125rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Difficulty</label>
                  <select className="tp-select" value={newDifficulty} onChange={e => setNewDifficulty(e.target.value as Difficulty)}>
                    {DIFFICULTY_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.8125rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Correct Option</label>
                  <select className="tp-select" value={correctOpt} onChange={e => setCorrectOpt(e.target.value as any)}>
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
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
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingQuestion(null); }} className="tp-btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>Cancel</button>
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
