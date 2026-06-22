"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import PublicHeader from "@/components/layout/PublicHeader";
import { SAMPLE_QUESTIONS } from "@/lib/mockData";
import { ChevronRight, ChevronLeft, AlertTriangle, Clock } from "lucide-react";
import { api } from "@/lib/api";

export default function AssessmentPlayer() {
  const router = useRouter();
  const params = useParams();
  const sessionId = (params?.sessionId as string) || "session-001";
  const isMock = sessionId === "session-001";

  // Mock-specific states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  
  // Backend-specific states
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(1);
  const [loadingQuestion, setLoadingQuestion] = useState(false);

  // Common states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Load first question if backend session
  useEffect(() => {
    if (!isMock && typeof window !== "undefined") {
      const q = sessionStorage.getItem("tp_current_question");
      if (q) {
        try {
          setCurrentQuestion(JSON.parse(q));
        } catch (e) {
          console.error("Failed to parse first question from session storage", e);
        }
      }
    }
  }, [sessionId, isMock]);

  // Clean local storage stats on mount and run timer
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(`assessment_answers_${sessionId}`);
      localStorage.removeItem("assessment_answers");
    }
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionId]);

  const confirmSubmit = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);
    if (isMock) {
      if (typeof window !== "undefined") {
        localStorage.setItem(`assessment_answers_${sessionId}`, JSON.stringify(answers));
        localStorage.setItem("assessment_answers", JSON.stringify(answers));
        localStorage.setItem(`assessment_time_${sessionId}`, String(timeElapsed));
        localStorage.setItem("assessment_time", String(timeElapsed));
      }
      await new Promise(r => setTimeout(r, 1800));
      router.push(`/report/${sessionId}`);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Resolve current active question details
  const question = isMock ? SAMPLE_QUESTIONS[currentIndex] : (currentQuestion ? {
    id: currentQuestion.id,
    index: questionCount,
    totalQuestions: 15,
    text: currentQuestion.question_text,
    options: currentQuestion.options.map((opt: any) => ({
      key: opt.option_label,
      text: opt.option_text,
      id: opt.id
    })),
    skillBreadcrumb: { topic: "Mathematics", skill: currentQuestion.difficulty_level }
  } : null);

  const isLast = isMock ? (currentIndex === SAMPLE_QUESTIONS.length - 1) : false;
  const currentSelected = isMock ? (answers[currentIndex] || null) : selectedOptionId;

  const handleNext = async () => {
    if (isMock) {
      if (isLast) {
        setShowConfirmModal(true);
      } else {
        setCurrentIndex(i => i + 1);
      }
    } else {
      if (!currentQuestion || !selectedOptionId) return;
      setLoadingQuestion(true);
      
      try {
        const response = await api.post<{
          is_correct: boolean;
          session: any;
          next_question: any;
        }>(`/api/v1/learning/sessions/${sessionId}/submit`, {
          question_id: currentQuestion.id,
          selected_option_id: selectedOptionId,
          submitted_answer: null,
          response_time_seconds: timeElapsed
        });

        setTimeElapsed(0);
        setSelectedOptionId(null);

        if (response.next_question) {
          sessionStorage.setItem("tp_current_question", JSON.stringify(response.next_question));
          setCurrentQuestion(response.next_question);
          setQuestionCount(c => c + 1);
        } else {
          // Finished session on backend
          setSubmitting(true);
          const tpUser = sessionStorage.getItem("tp_user");
          const userId = tpUser ? JSON.parse(tpUser).id : null;
          await api.post(`/api/v1/learning/sessions/${sessionId}/end`);
          router.push(`/report/${sessionId}`);
        }
      } catch (err) {
        console.error("Failed to submit answer to backend", err);
      } finally {
        setLoadingQuestion(false);
      }
    }
  };

  const handlePrevious = () => {
    if (isMock && currentIndex > 0) {
      setCurrentIndex(i => i - 1);
    }
  };

  const selectOption = (optKey: string, optId?: string) => {
    if (isMock) {
      setAnswers(prev => ({
        ...prev,
        [currentIndex]: optKey
      }));
    } else if (optId) {
      setSelectedOptionId(optId);
    }
  };

  if (submitting) {
    return (
      <div style={{ minHeight: "100vh", background: "transparent", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Aeonik', 'Inter', sans-serif" }}>
        <div className="tp-card animate-fade-in-up" style={{ maxWidth: 450, padding: "3rem 2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
          <div className="animate-spin" style={{ width: 44, height: 44, border: "4px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%" }} />
          <div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
              Assessment submitted successfully.
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              Generating report...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div style={{ minHeight: "100vh", background: "transparent", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Aeonik', 'Inter', sans-serif" }}>
        <div style={{ color: "var(--primary)", fontWeight: 700 }}>
          Loading assessment question...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "transparent", fontFamily: "'Aeonik', 'Inter', sans-serif", display: "flex", flexDirection: "column", position: "relative" }}>
      <PublicHeader />

      <div style={{ display: "flex", justifyContent: "center", padding: "1.25rem 1.5rem 0" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "#FFF6CB",
          border: "1px solid #F4D85C",
          borderRadius: 999,
          padding: "0.45rem 0.9rem",
          fontSize: "0.875rem",
          fontWeight: 700,
          color: "#8A6800",
          fontFamily: "monospace",
        }}>
          <Clock size={15} color="#E0AA10" />
          <span>{formatTime(timeElapsed)}</span>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 760, margin: "0 auto", width: "100%", padding: "3rem 1.5rem" }}>
        <div className="tp-card animate-scale-in" key={isMock ? currentIndex : question.id} style={{ padding: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Topic:</span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 700 }}>{question.skillBreadcrumb.topic}</span>
            <ChevronRight size={12} color="var(--text-muted)" />
            <span style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 800 }}>{question.skillBreadcrumb.skill}</span>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.375rem", fontWeight: 800, lineHeight: 1.45, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
              {question.text}
            </h2>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", fontWeight: 600 }}>
              Select the most appropriate answer.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2.5rem" }}>
            {question.options.map((opt: any) => {
              const isSelected = isMock ? (currentSelected === opt.key) : (selectedOptionId === opt.id);
              return (
                <div
                  key={opt.key}
                  id={`option-${opt.key}`}
                  className={`option-card ${isSelected ? "selected" : ""}`}
                  onClick={() => selectOption(opt.key, opt.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") selectOption(opt.key, opt.id); }}
                  aria-label={`Option ${opt.key}: ${opt.text}`}
                >
                  <div className="option-key">{opt.key}</div>
                  <span style={{ fontSize: "1rem", color: "var(--text-primary)", fontWeight: isSelected ? 700 : 500 }}>
                    {opt.text}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              id="prev-question"
              className="tp-btn-ghost"
              onClick={handlePrevious}
              disabled={isMock ? (currentIndex === 0) : true}
              style={{ opacity: (isMock ? currentIndex === 0 : true) ? 0.4 : 1, padding: "0.75rem 1.5rem" }}
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <button
              id="next-question"
              className="tp-btn-primary"
              onClick={handleNext}
              disabled={loadingQuestion || !currentSelected}
              style={{ opacity: (loadingQuestion || !currentSelected) ? 0.5 : 1, padding: "0.75rem 2rem", fontSize: "0.9375rem" }}
            >
              {loadingQuestion ? "Loading..." : isMock && isLast ? "Submit Assessment" : isLast ? "Submit Assessment" : (<>Next <ChevronRight size={16} /></>)}
            </button>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(217, 234, 250, 0.7)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 999,
          backdropFilter: "blur(4px)"
        }}>
          <div className="tp-card animate-scale-in" style={{ maxWidth: 450, width: "90%", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--warning-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <AlertTriangle size={24} color="var(--warning)" />
              </div>
              <div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.375rem" }}>
                  Submit Assessment
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  Are you sure you want to submit your assessment?
                </p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
              <button 
                className="tp-btn-ghost" 
                onClick={() => setShowConfirmModal(false)}
                style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem" }}
              >
                Continue Assessment
              </button>
              <button 
                className="tp-btn-primary" 
                onClick={confirmSubmit}
                style={{ padding: "0.5rem 1.5rem", fontSize: "0.875rem" }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
