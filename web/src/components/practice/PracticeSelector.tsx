"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { ChevronRight, ChevronDown, BookOpen, Layers, CheckSquare, Square, Target, HelpCircle, Check, Loader2, Award } from "lucide-react";

interface PracticeSelectorProps {
  role: "student" | "admin";
}

interface Topic {
  id: string;
  name: string;
  difficulty_level: string;
}

interface Subtopic {
  id: string;
  topic_id: string;
  name: string;
  description: string;
}

export default function PracticeSelector({ role }: PracticeSelectorProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subtopicsMap, setSubtopicsMap] = useState<Record<string, Subtopic[]>>({});
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  const [loadingSubtopics, setLoadingSubtopics] = useState<Record<string, boolean>>({});
  const [loadingTopics, setLoadingTopics] = useState(true);

  // Checkbox states
  const [selectedSections, setSelectedSections] = useState<Record<string, boolean>>({
    Quant: false,
    Math: false
  });
  const [selectedTopics, setSelectedTopics] = useState<Record<string, boolean>>({});
  const [selectedSubtopics, setSelectedSubtopics] = useState<Record<string, boolean>>({});

  // Section accordion expand/collapse
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    Quant: false,
    Math: false
  });

  const toggleSectionExpand = (sectionKey: "Quant" | "Math") => {
    setExpandedSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  // Practice session state (for students)
  const [activeSession, setActiveSession] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [sessionScore, setSessionScore] = useState<number | null>(null);

  // Student Explanations States
  const [showExplanationArea, setShowExplanationArea] = useState(false);
  const [explanations, setExplanations] = useState<Record<number, string>>({});

  // Grouping topics into sections
  const getSectionForTopic = (topicName: string): "Quant" | "Math" => {
    const name = topicName.toLowerCase();
    if (name.includes("complement") || name.includes("average") || name.includes("quant")) {
      return "Quant";
    }
    return "Math";
  };

  useEffect(() => {
    // Fetch all topics from DB
    api.get<any[]>("/api/v1/topics")
      .then((res) => {
        const topicsList = res || [];
        setTopics(topicsList);
        // Initialize topic select states
        const initialTopics: Record<string, boolean> = {};
        topicsList.forEach(t => {
          initialTopics[t.id] = false;
        });
        setSelectedTopics(initialTopics);
        setLoadingTopics(false);
      })
      .catch((err) => {
        console.error("Failed to load topics", err);
        setLoadingTopics(false);
      });
  }, []);

  // Fetch subtopics from DB when a topic is expanded
  const toggleTopicExpand = async (topicId: string) => {
    const isExpanded = !!expandedTopics[topicId];
    setExpandedTopics({ ...expandedTopics, [topicId]: !isExpanded });

    if (!isExpanded && !subtopicsMap[topicId]) {
      setLoadingSubtopics({ ...loadingSubtopics, [topicId]: true });
      try {
        const subList = await api.get<Subtopic[]>(`/api/v1/topics/${topicId}/subtopics`);
        const list = subList || [];
        setSubtopicsMap(prev => ({ ...prev, [topicId]: list }));

        // If parent topic was already selected, select all newly loaded subtopics
        if (selectedTopics[topicId]) {
          setSelectedSubtopics(prev => {
            const updated = { ...prev };
            list.forEach(st => {
              updated[st.id] = true;
            });
            return updated;
          });
        }
      } catch (err) {
        console.error(`Failed to load subtopics for topic ${topicId}`, err);
      } finally {
        setLoadingSubtopics(prev => ({ ...prev, [topicId]: false }));
      }
    }
  };

  // ── Checked Actions ────────────────────────────────────────────────────────

  // Select all inside a section
  const handleSectionSelect = (sectionKey: "Quant" | "Math") => {
    const nextVal = !selectedSections[sectionKey];
    setSelectedSections({ ...selectedSections, [sectionKey]: nextVal });

    const sectionTopics = topics.filter(t => getSectionForTopic(t.name) === sectionKey);
    
    setSelectedTopics(prev => {
      const updated = { ...prev };
      sectionTopics.forEach(t => {
        updated[t.id] = nextVal;
      });
      return updated;
    });

    setSelectedSubtopics(prev => {
      const updated = { ...prev };
      sectionTopics.forEach(t => {
        const subs = subtopicsMap[t.id] || [];
        subs.forEach(sub => {
          updated[sub.id] = nextVal;
        });
      });
      return updated;
    });
  };

  // Select all inside a topic
  const handleTopicSelect = (topicId: string, sectionKey: "Quant" | "Math") => {
    const nextVal = !selectedTopics[topicId];
    setSelectedTopics({ ...selectedTopics, [topicId]: nextVal });

    // Set all its subtopics
    const subs = subtopicsMap[topicId] || [];
    setSelectedSubtopics(prev => {
      const updated = { ...prev };
      subs.forEach(sub => {
        updated[sub.id] = nextVal;
      });
      return updated;
    });

    // Update section checkbox
    updateSectionState(sectionKey, topicId, nextVal);
  };

  const updateSectionState = (sectionKey: "Quant" | "Math", changedTopicId: string, nextTopicVal: boolean) => {
    const sectionTopics = topics.filter(t => getSectionForTopic(t.name) === sectionKey);
    let allSelected = true;
    sectionTopics.forEach(t => {
      const val = t.id === changedTopicId ? nextTopicVal : !!selectedTopics[t.id];
      if (!val) allSelected = false;
    });
    setSelectedSections(prev => ({ ...prev, [sectionKey]: allSelected }));
  };

  // Select a subtopic
  const handleSubtopicSelect = (subtopicId: string, topicId: string, sectionKey: "Quant" | "Math") => {
    const nextVal = !selectedSubtopics[subtopicId];
    setSelectedSubtopics({ ...selectedSubtopics, [subtopicId]: nextVal });

    // Update topic checkbox if all subtopics checked
    const subs = subtopicsMap[topicId] || [];
    let allSelected = true;
    subs.forEach(s => {
      const val = s.id === subtopicId ? nextVal : !!selectedSubtopics[s.id];
      if (!val) allSelected = false;
    });

    setSelectedTopics(prev => {
      const updated = { ...prev, [topicId]: allSelected };
      // Also update section checked status
      updateSectionState(sectionKey, topicId, allSelected);
      return updated;
    });
  };

  // Helper counts
  const totalSelectedSubtopics = Object.values(selectedSubtopics).filter(Boolean).length;
  const totalSelectedTopics = Object.values(selectedTopics).filter(Boolean).length;

  // Mock Practice Questions for simulated experience (especially for newly added Averages)
  const samplePracticeQuestions = [
    {
      question: "The average of 5 consecutive numbers is 20. What is the largest of these numbers?",
      options: ["A. 20", "B. 22", "C. 24", "D. 25"],
      correct: "B"
    },
    {
      question: "Find the average speed (in km/h) of a car that travels 150 km in 3 hours.",
      correct: "50"
    },
    {
      question: "In a class of 40 students, the average score is 70%. In another class of 60 students, the average score is 80%. What is the weighted average score of both classes?",
      options: ["A. 74%", "B. 75%", "C. 76%", "D. 77%"],
      correct: "C"
    }
  ];

  const handleStartPractice = () => {
    if (totalSelectedSubtopics === 0) {
      alert("Please select at least one subtopic to practice.");
      return;
    }
    setActiveSession(true);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setSessionScore(null);
    setShowExplanationArea(false);
    setExplanations({});
  };

  const handleAnswerSelect = (optionLabel: string) => {
    setUserAnswers({ ...userAnswers, [currentQuestionIndex]: optionLabel });
  };

  const handleNextQuestion = () => {
    setShowExplanationArea(false);
    if (currentQuestionIndex < samplePracticeQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate score
      let correctCount = 0;
      samplePracticeQuestions.forEach((q, idx) => {
        const userAns = (userAnswers[idx] || "").trim().toLowerCase();
        const correctAns = q.correct.trim().toLowerCase();
        if (userAns === correctAns) {
          correctCount++;
        }
      });
      setSessionScore(Math.round((correctCount / samplePracticeQuestions.length) * 100));
    }
  };

  const quantTopics = topics.filter(t => getSectionForTopic(t.name) === "Quant");
  const mathTopics = topics.filter(t => getSectionForTopic(t.name) === "Math");

  return (
    <div style={{ display: "grid", gridTemplateColumns: activeSession ? "1fr" : "minmax(0, 1.8fr) minmax(0, 1.2fr)", gap: "1.5rem" }}>
      
      {/* ── Active Practice View ────────────────────────────────────────── */}
      {activeSession ? (
        <div className="tp-card animate-fade-in-up" style={{ padding: "2.5rem", maxWidth: 700, margin: "2rem auto", position: "relative" }}>
          {sessionScore !== null ? (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--success-light)", color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem auto" }}>
                <Award size={48} />
              </div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1F2A44", marginBottom: "0.5rem" }}>Practice Completed!</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                You have finished your adaptive practice session on your selected subtopics.
              </p>
              <div style={{ fontSize: "3rem", fontWeight: 900, color: "var(--primary)", marginBottom: "2rem" }}>
                {sessionScore}%
              </div>
              <button 
                onClick={() => setActiveSession(false)} 
                className="tp-btn-primary" 
                style={{ padding: "0.625rem 2rem" }}
              >
                Go Back to Selector
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Custom Practice Session
                  </span>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#1F2A44", marginTop: "0.15rem" }}>
                    Question {currentQuestionIndex + 1} of {samplePracticeQuestions.length}
                  </h3>
                </div>
                <button 
                  onClick={() => setActiveSession(false)}
                  style={{ background: "none", border: "none", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}
                >
                  Exit Practice
                </button>
              </div>

              {/* Progress Bar */}
              <div style={{ height: 4, background: "#E2E8F0", borderRadius: 2, marginBottom: "2.5rem", overflow: "hidden" }}>
                <div style={{ height: "100%", background: "var(--primary)", width: `${((currentQuestionIndex + 1) / samplePracticeQuestions.length) * 100}%`, transition: "width 0.3s" }} />
              </div>

              {/* Action Button on top of Question Card */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>PRACTICE EXERCISE</span>
                <button
                  onClick={() => setShowExplanationArea(true)}
                  style={{
                    background: "#FFF",
                    border: "1.5px solid rgba(242, 90, 167, 0.3)",
                    color: "var(--primary)",
                    borderRadius: "20px",
                    padding: "0.35rem 0.85rem",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    boxShadow: "0 2px 4px rgba(242, 90, 167, 0.05)",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--primary)";
                    e.currentTarget.style.color = "#FFF";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#FFF";
                    e.currentTarget.style.color = "var(--primary)";
                  }}
                >
                  📝 Steps of Solving
                </button>
              </div>

              {/* Custom Student Explanation Card Modal Overlay */}
              {showExplanationArea && (
                <div style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(31, 42, 68, 0.4)",
                  backdropFilter: "blur(4px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 9999
                }}>
                  <div className="tp-card" style={{
                    width: "90%",
                    maxWidth: "500px",
                    background: "#FFF",
                    padding: "2rem",
                    borderRadius: "16px",
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}>
                    <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#1F2A44", marginBottom: "0.5rem" }}>
                      Steps of Solving
                    </h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1.25rem", lineHeight: 1.4 }}>
                      Outline the solving steps you took to find the correct answer, incorporating any analogies or interests.
                    </p>
                    
                    <textarea
                      placeholder="E.g., I imagined sharing 150 items among 3 friends, which means each gets 50..."
                      value={explanations[currentQuestionIndex] || ""}
                      onChange={(e) => setExplanations({ ...explanations, [currentQuestionIndex]: e.target.value })}
                      style={{
                        width: "100%",
                        minHeight: "120px",
                        border: "1.5px solid var(--border)",
                        borderRadius: "10px",
                        padding: "0.75rem",
                        fontSize: "0.875rem",
                        outline: "none",
                        resize: "vertical",
                        marginBottom: "1.5rem",
                        fontFamily: "inherit"
                      }}
                    />
                    
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                      <button
                        onClick={() => setShowExplanationArea(false)}
                        style={{
                          background: "#F1F5F9",
                          color: "var(--text-secondary)",
                          border: "none",
                          borderRadius: "8px",
                          padding: "0.5rem 1.25rem",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setShowExplanationArea(false)}
                        className="tp-btn-primary"
                        style={{
                          padding: "0.5rem 1.5rem",
                          fontSize: "0.8rem",
                          fontWeight: 700
                        }}
                      >
                        Save Steps
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ fontSize: "1.1rem", color: "#1F2A44", fontWeight: 700, lineHeight: 1.5, marginBottom: "1.5rem" }}>
                {samplePracticeQuestions[currentQuestionIndex].question}
              </div>

              {/* MCQ Options vs Blank Fill In The Blank Line */}
              {samplePracticeQuestions[currentQuestionIndex].options ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
                  {samplePracticeQuestions[currentQuestionIndex].options.map((opt) => {
                    const label = opt.charAt(0);
                    const isSelected = userAnswers[currentQuestionIndex] === label;
                    return (
                      <button
                        key={opt}
                        onClick={() => handleAnswerSelect(label)}
                        style={{
                          textAlign: "left",
                          width: "100%",
                          padding: "1rem",
                          borderRadius: "10px",
                          border: isSelected ? "2.5px solid var(--primary)" : "1.5px solid var(--border)",
                          background: isSelected ? "rgba(242, 90, 167, 0.04)" : "#FFF",
                          color: isSelected ? "var(--primary)" : "var(--text-primary)",
                          fontSize: "0.875rem",
                          fontWeight: isSelected ? 700 : 500,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          transition: "all 0.15s"
                        }}
                      >
                        <span>{opt}</span>
                        {isSelected && <div style={{ width: 16, height: 16, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF" }}><Check size={10} strokeWidth={3} /></div>}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div style={{ marginBottom: "2.5rem", marginTop: "1.5rem" }}>
                  <input
                    type="text"
                    placeholder="Type your numeric answer here..."
                    value={userAnswers[currentQuestionIndex] || ""}
                    onChange={(e) => handleAnswerSelect(e.target.value)}
                    style={{
                      width: "100%",
                      border: "none",
                      borderBottom: "2.5px solid var(--border)",
                      outline: "none",
                      fontSize: "1.125rem",
                      fontWeight: 700,
                      padding: "0.6rem 0",
                      color: "var(--text-primary)",
                      background: "transparent",
                      transition: "border-color 0.2s"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                    onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                  />
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>Type your answer above to fill the blank line</div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  disabled={!userAnswers[currentQuestionIndex]}
                  onClick={handleNextQuestion}
                  className="tp-btn-primary"
                  style={{
                    padding: "0.625rem 2rem",
                    opacity: userAnswers[currentQuestionIndex] ? 1 : 0.5,
                    cursor: userAnswers[currentQuestionIndex] ? "pointer" : "not-allowed"
                  }}
                >
                  {currentQuestionIndex === samplePracticeQuestions.length - 1 ? "Finish Session" : "Next Question"}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* ── Tree Selector Panel ────────────────────────────────────────── */}
          <div className="tp-card animate-fade-in-up" style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#1F2A44", marginBottom: "1rem" }}>
              Select Topics for Practice
            </h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "2rem", lineHeight: 1.4 }}>
              Choose specific mathematical domains, topics, and subtopics to customize your learning. Checked sections automatically select all underlying concepts.
            </p>

            {loadingTopics ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "4rem 0", color: "var(--text-muted)" }}>
                <Loader2 className="animate-spin" size={20} />
                <span>Loading curriculum hierarchy...</span>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                
                {/* ── Section: Quant ────────────────────────────────────── */}
                <div style={{ border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
                  {/* Section Header */}
                  <div
                    style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: expandedSections.Quant ? "rgba(0, 163, 150, 0.07)" : "rgba(0, 163, 150, 0.03)", padding: "0.85rem 1rem", borderBottom: expandedSections.Quant ? "1px solid var(--border)" : "none", cursor: "pointer", userSelect: "none" }}
                    onClick={() => toggleSectionExpand("Quant")}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSectionSelect("Quant"); }}
                      style={{ background: "none", border: "none", display: "flex", alignItems: "center", cursor: "pointer", color: "var(--primary)", padding: 0, flexShrink: 0 }}
                    >
                      {selectedSections.Quant ? <CheckSquare size={18} /> : <Square size={18} />}
                    </button>
                    <Layers size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
                    <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#1F2A44", flex: 1 }}>Quantitative Aptitude (Quant)</span>
                    <ChevronRight
                      size={18}
                      color="#9CA3AF"
                      style={{ transform: expandedSections.Quant ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s ease", flexShrink: 0 }}
                    />
                  </div>

                  {/* Topics List – only shown when section is expanded */}
                  {expandedSections.Quant && (
                  <div style={{ padding: "0.5rem" }}>
                    {quantTopics.map((topic, index) => {
                      const isExpanded = !!expandedTopics[topic.id];
                      const isSelected = !!selectedTopics[topic.id];
                      return (
                        <div key={topic.id} style={{ borderBottom: index === quantTopics.length - 1 ? "none" : "1px solid #F1F5F9" }}>
                          {/* Topic Entry */}
                          <div style={{ display: "flex", alignItems: "center", justifyItems: "center", padding: "0.6rem 0.5rem", gap: "0.5rem" }}>
                            <button
                              onClick={() => toggleTopicExpand(topic.id)}
                              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "var(--text-muted)", padding: 0 }}
                            >
                              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                            <button
                              onClick={() => handleTopicSelect(topic.id, "Quant")}
                              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "var(--primary)", padding: 0 }}
                            >
                              {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                            </button>
                            <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#1F2A44", cursor: "pointer" }} onClick={() => toggleTopicExpand(topic.id)}>
                              {topic.name}
                            </span>
                            <span style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem", borderRadius: "10px", background: "#F1F5F9", color: "var(--text-secondary)", textTransform: "capitalize", marginLeft: "auto" }}>
                              {topic.difficulty_level}
                            </span>
                          </div>

                          {/* Subtopics List (Render when expanded) */}
                          {isExpanded && (
                            <div style={{ paddingLeft: "2rem", paddingBottom: "0.5rem", background: "#FAFBFD" }}>
                              {loadingSubtopics[topic.id] ? (
                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", padding: "0.5rem 0", display: "flex", gap: "0.25rem" }}>
                                  <Loader2 className="animate-spin" size={12} /> Fetching subtopics...
                                </div>
                              ) : (
                                (subtopicsMap[topic.id] || []).map((sub) => {
                                  const isSubSelected = !!selectedSubtopics[sub.id];
                                  return (
                                    <div key={sub.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 0" }}>
                                      <button
                                        onClick={() => handleSubtopicSelect(sub.id, topic.id, "Quant")}
                                        style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "var(--primary)", padding: 0 }}
                                      >
                                        {isSubSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                                      </button>
                                      <div style={{ display: "flex", flexDirection: "column" }}>
                                        <span style={{ fontSize: "0.825rem", color: "var(--text-primary)", fontWeight: isSubSelected ? 700 : 500 }}>
                                          {sub.name}
                                        </span>
                                        {sub.description && (
                                          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                                            {sub.description}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                              {(!loadingSubtopics[topic.id] && (!subtopicsMap[topic.id] || subtopicsMap[topic.id].length === 0)) && (
                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", padding: "0.5rem 0" }}>
                                  No subtopics found for this topic.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  )}
                </div>

                {/* ── Section: Math ─────────────────────────────────────── */}
                <div style={{ border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
                  {/* Section Header */}
                  <div
                    style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: expandedSections.Math ? "rgba(0, 163, 150, 0.07)" : "rgba(0, 163, 150, 0.03)", padding: "0.85rem 1rem", borderBottom: expandedSections.Math ? "1px solid var(--border)" : "none", cursor: "pointer", userSelect: "none" }}
                    onClick={() => toggleSectionExpand("Math")}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSectionSelect("Math"); }}
                      style={{ background: "none", border: "none", display: "flex", alignItems: "center", cursor: "pointer", color: "var(--primary)", padding: 0, flexShrink: 0 }}
                    >
                      {selectedSections.Math ? <CheckSquare size={18} /> : <Square size={18} />}
                    </button>
                    <Layers size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
                    <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#1F2A44", flex: 1 }}>School Mathematics (Math)</span>
                    <ChevronRight
                      size={18}
                      color="#9CA3AF"
                      style={{ transform: expandedSections.Math ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s ease", flexShrink: 0 }}
                    />
                  </div>

                  {/* Topics List – only shown when section is expanded */}
                  {expandedSections.Math && (
                  <div style={{ padding: "0.5rem" }}>
                    {mathTopics.map((topic, index) => {
                      const isExpanded = !!expandedTopics[topic.id];
                      const isSelected = !!selectedTopics[topic.id];
                      return (
                        <div key={topic.id} style={{ borderBottom: index === mathTopics.length - 1 ? "none" : "1px solid #F1F5F9" }}>
                          {/* Topic Entry */}
                          <div style={{ display: "flex", alignItems: "center", justifyItems: "center", padding: "0.6rem 0.5rem", gap: "0.5rem" }}>
                            <button
                              onClick={() => toggleTopicExpand(topic.id)}
                              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "var(--text-muted)", padding: 0 }}
                            >
                              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                            <button
                              onClick={() => handleTopicSelect(topic.id, "Math")}
                              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "var(--primary)", padding: 0 }}
                            >
                              {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                            </button>
                            <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#1F2A44", cursor: "pointer" }} onClick={() => toggleTopicExpand(topic.id)}>
                              {topic.name}
                            </span>
                            <span style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem", borderRadius: "10px", background: "#F1F5F9", color: "var(--text-secondary)", textTransform: "capitalize", marginLeft: "auto" }}>
                              {topic.difficulty_level}
                            </span>
                          </div>

                          {/* Subtopics List (Render when expanded) */}
                          {isExpanded && (
                            <div style={{ paddingLeft: "2rem", paddingBottom: "0.5rem", background: "#FAFBFD" }}>
                              {loadingSubtopics[topic.id] ? (
                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", padding: "0.5rem 0", display: "flex", gap: "0.25rem" }}>
                                  <Loader2 className="animate-spin" size={12} /> Fetching subtopics...
                                </div>
                              ) : (
                                (subtopicsMap[topic.id] || []).map((sub) => {
                                  const isSubSelected = !!selectedSubtopics[sub.id];
                                  return (
                                    <div key={sub.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 0" }}>
                                      <button
                                        onClick={() => handleSubtopicSelect(sub.id, topic.id, "Math")}
                                        style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "var(--primary)", padding: 0 }}
                                      >
                                        {isSubSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                                      </button>
                                      <div style={{ display: "flex", flexDirection: "column" }}>
                                        <span style={{ fontSize: "0.825rem", color: "var(--text-primary)", fontWeight: isSubSelected ? 700 : 500 }}>
                                          {sub.name}
                                        </span>
                                        {sub.description && (
                                          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                                            {sub.description}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                              {(!loadingSubtopics[topic.id] && (!subtopicsMap[topic.id] || subtopicsMap[topic.id].length === 0)) && (
                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", padding: "0.5rem 0" }}>
                                  No subtopics found for this topic.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* ── Selection Summary Panel ────────────────────────────────────── */}
          <div className="tp-card animate-fade-in-up stagger-1" style={{ height: "fit-content", background: "#FAFBFD", border: "1.5px solid var(--border)" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#1F2A44", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "1rem" }}>
              <Target size={18} color="var(--primary)" /> Practice Summary
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginBottom: "1.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                <span>Selected Topics</span>
                <span style={{ fontWeight: 700, color: "#1F2A44" }}>{totalSelectedTopics}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                <span>Selected Subtopics</span>
                <span style={{ fontWeight: 700, color: "var(--primary)" }}>{totalSelectedSubtopics}</span>
              </div>
            </div>

            {role === "student" ? (
              <button
                disabled={totalSelectedSubtopics === 0}
                onClick={handleStartPractice}
                className="tp-btn-primary"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  opacity: totalSelectedSubtopics === 0 ? 0.55 : 1,
                  cursor: totalSelectedSubtopics === 0 ? "not-allowed" : "pointer"
                }}
              >
                Start Practice ({totalSelectedSubtopics})
              </button>
            ) : (
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", background: "#FFF", border: "1px dashed var(--border)", padding: "0.75rem", borderRadius: "8px", textAlign: "center" }}>
                Logged in as Admin. Review selection behavior. Practice button disabled for Admin views.
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
}
