"use client";

import { useEffect, useMemo, useState } from "react";
import { Award, Check, Lock, RotateCcw, X } from "lucide-react";
import { api } from "@/lib/api";
import { deferEffect } from "@/lib/browserState";

interface PracticeSelectorProps {
  role: "student" | "admin";
}

interface Topic {
  id: string;
  name: string;
  difficulty_level?: string;
}

type PracticeTopic = {
  id: string;
  name: string;
  group: "Arithmetic" | "Algebra";
  section: "Quantitative Aptitude" | "Verbal Ability";
  unlocked: boolean;
  attempts: number;
};

const FALLBACK_TOPICS: PracticeTopic[] = [
  { id: "time-work", name: "Time & Work", group: "Arithmetic", section: "Quantitative Aptitude", unlocked: true, attempts: 1 },
  { id: "mean-median-mode", name: "Mean, Median & Mode", group: "Arithmetic", section: "Quantitative Aptitude", unlocked: false, attempts: 0 },
  { id: "time-speed-distance", name: "Time, Speed & Distance", group: "Arithmetic", section: "Quantitative Aptitude", unlocked: false, attempts: 0 },
  { id: "ratio-proportion", name: "Ratio, Proportion & Variation", group: "Arithmetic", section: "Quantitative Aptitude", unlocked: false, attempts: 0 },
  { id: "mixture-alligation", name: "Mixture & Alligation", group: "Arithmetic", section: "Quantitative Aptitude", unlocked: false, attempts: 0 },
  { id: "profit-loss", name: "Profit & Loss", group: "Arithmetic", section: "Quantitative Aptitude", unlocked: false, attempts: 0 },
  { id: "simple-compound-interest", name: "Simple & Compound Interest", group: "Arithmetic", section: "Quantitative Aptitude", unlocked: false, attempts: 0 },
  { id: "progression-series", name: "Progression & Series", group: "Algebra", section: "Quantitative Aptitude", unlocked: true, attempts: 1 },
  { id: "inequalities", name: "Inequalities & Linear Equation", group: "Algebra", section: "Quantitative Aptitude", unlocked: false, attempts: 0 },
  { id: "functions", name: "Functions", group: "Algebra", section: "Quantitative Aptitude", unlocked: false, attempts: 0 },
  { id: "modulus", name: "Modulus", group: "Algebra", section: "Quantitative Aptitude", unlocked: false, attempts: 0 },
  { id: "minima-maxima", name: "Minima & Maxima", group: "Algebra", section: "Quantitative Aptitude", unlocked: false, attempts: 0 },
  { id: "polynomials-identities", name: "Polynomials & Identities", group: "Algebra", section: "Quantitative Aptitude", unlocked: false, attempts: 0 },
  { id: "reading-comprehension", name: "Reading Comprehension", group: "Arithmetic", section: "Verbal Ability", unlocked: true, attempts: 1 },
  { id: "grammar", name: "Grammar", group: "Algebra", section: "Verbal Ability", unlocked: false, attempts: 0 }
];

const PRACTICE_QUESTIONS = [
  {
    question: "During a certain time period, Car X traveled north along a straight road at a constant rate of 1 mile per minute and used fuel at a constant rate of 5 gallons every 2 hours. During this time period, if Car X used exactly 3.75 gallons of fuel, how many miles did Car X travel?",
    options: ["36", "40", "80", "90"],
    correctIndex: 3,
    explanation: [
      "Car X uses 5 gallons every 120 minutes.",
      "3.75 gallons is 3.75 / 5 of that time, which is 90 minutes.",
      "At 1 mile per minute, the car travels 90 miles."
    ]
  },
  {
    question: "A worker finishes a job in 12 days. Another worker finishes the same job in 18 days. How many days will they take working together?",
    options: ["6.2", "7.2", "8", "9"],
    correctIndex: 1,
    explanation: [
      "Their daily work rates are 1/12 and 1/18.",
      "Together they complete 5/36 of the job per day.",
      "The time needed is 36/5, or 7.2 days."
    ]
  },
  {
    question: "The average of five consecutive integers is 28. What is the largest integer?",
    options: ["28", "29", "30", "32"],
    correctIndex: 2,
    explanation: [
      "For five consecutive integers, the average is the middle number.",
      "The numbers are 26, 27, 28, 29, and 30.",
      "The largest number is 30."
    ]
  }
];

const progressDots = (attempts: number) => (
  <span className="practice-dots" aria-label={`${attempts} attempts`}>
    {[0, 1, 2, 3].map((dot) => (
      <span key={dot} className={dot < attempts ? "filled" : ""} />
    ))}
  </span>
);

export default function PracticeSelector({ role }: PracticeSelectorProps) {
  const [topics, setTopics] = useState<PracticeTopic[]>(FALLBACK_TOPICS);
  const [activeTab, setActiveTab] = useState<PracticeTopic["section"]>("Quantitative Aptitude");
  const [activeSession, setActiveSession] = useState<PracticeTopic | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    return deferEffect(() => {
      api.get<Topic[]>("/api/v1/topics")
        .then((list) => {
          if (!Array.isArray(list) || list.length === 0) return;
          const mapped: PracticeTopic[] = list.slice(0, 12).map((topic, index) => ({
            id: topic.id,
            name: topic.name,
            group: index < 7 ? "Arithmetic" as const : "Algebra" as const,
            section: "Quantitative Aptitude" as const,
            unlocked: role === "admin" || index === 0 || index === 7,
            attempts: index === 0 || index === 7 ? 1 : 0
          }));
          setTopics([...mapped, ...FALLBACK_TOPICS.filter((topic) => topic.section === "Verbal Ability")]);
        })
        .catch((err) => console.error("Failed to load practice topics", err));
    });
  }, [role]);

  const visibleTopics = useMemo(
    () => topics.filter((topic) => topic.section === activeTab),
    [activeTab, topics]
  );

  const groupedTopics = useMemo(() => ({
    Arithmetic: visibleTopics.filter((topic) => topic.group === "Arithmetic"),
    Algebra: visibleTopics.filter((topic) => topic.group === "Algebra")
  }), [visibleTopics]);

  const startPractice = (topic: PracticeTopic) => {
    if (!topic.unlocked && role !== "admin") return;
    setActiveSession(topic);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setChecked(false);
    setScore(null);
  };

  const handleNext = () => {
    if (!checked) {
      setChecked(true);
      return;
    }

    if (currentQuestionIndex < PRACTICE_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((index) => index + 1);
      setChecked(false);
      return;
    }

    const correct = PRACTICE_QUESTIONS.reduce((total, question, index) => (
      answers[index] === question.correctIndex ? total + 1 : total
    ), 0);
    setScore(Math.round((correct / PRACTICE_QUESTIONS.length) * 100));
  };

  const currentQuestion = PRACTICE_QUESTIONS[currentQuestionIndex];

  if (activeSession) {
    return (
      <div className="practice-player-shell">
        <div className="practice-player-top">
          <img src="/logo.png" alt="After Boards" />
          <button type="button" onClick={() => setActiveSession(null)}>Exit Exam</button>
        </div>

        <div className="practice-player-card">
          {score !== null ? (
            <div className="practice-score">
              <Award size={48} />
              <h2>Practice Completed</h2>
              <p>{activeSession.name}</p>
              <strong>{score}%</strong>
              <button type="button" className="tp-btn-primary" onClick={() => setActiveSession(null)}>
                Back to Topics
              </button>
            </div>
          ) : (
            <>
              <div className="practice-player-meta">
                <div className="practice-number-strip">
                  {PRACTICE_QUESTIONS.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      className={index === currentQuestionIndex ? "active" : ""}
                      onClick={() => {
                        setCurrentQuestionIndex(index);
                        setChecked(false);
                      }}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <div className="practice-breadcrumb">
                  {progressDots(1)}
                  <span>{activeSession.group} &gt; {activeSession.name}</span>
                </div>
              </div>

              <div className="practice-question-head">
                <span>Question {currentQuestionIndex + 1}/{PRACTICE_QUESTIONS.length}:</span>
                <code>00:08</code>
              </div>

              <p className="practice-question-text">{currentQuestion.question}</p>

              <div className="practice-options">
                {currentQuestion.options.map((option, index) => {
                  const selected = answers[currentQuestionIndex] === index;
                  return (
                    <button
                      key={option}
                      type="button"
                      className={selected ? "selected" : ""}
                      onClick={() => !checked && setAnswers({ ...answers, [currentQuestionIndex]: index })}
                    >
                      <span />
                      {option}
                    </button>
                  );
                })}
              </div>

              {checked && (
                <div className="practice-explanation">
                  <strong>
                    {answers[currentQuestionIndex] === currentQuestion.correctIndex ? (
                      <><Check size={18} /> Correct Option: {currentQuestion.correctIndex + 1}</>
                    ) : (
                      <><X size={18} /> Correct Option: {currentQuestion.correctIndex + 1}</>
                    )}
                  </strong>
                  <p>Understanding what we know:</p>
                  {currentQuestion.explanation.map((line) => (
                    <span key={line}>- {line}</span>
                  ))}
                </div>
              )}

              <div className="practice-player-actions">
                <button type="button" className="tp-btn-ghost" onClick={() => setChecked(false)}>
                  <RotateCcw size={15} /> Reset
                </button>
                <button
                  type="button"
                  className="tp-btn-primary"
                  disabled={answers[currentQuestionIndex] === undefined}
                  onClick={handleNext}
                >
                  {checked ? currentQuestionIndex === PRACTICE_QUESTIONS.length - 1 ? "Finish Session" : "Next Question" : "Check Answer"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="practice-topic-page">
      <div className="practice-topic-header">
        <div className="practice-tabs" role="tablist" aria-label="Practice sections">
          {(["Quantitative Aptitude", "Verbal Ability"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <button type="button" className="tp-btn-ghost">Review Tests</button>
      </div>

      {(["Arithmetic", "Algebra"] as const).map((group) => (
        <section key={group} className="practice-topic-section">
          <h2>{group}</h2>
          <div className="practice-topic-list">
            {groupedTopics[group].map((topic) => (
              <div key={topic.id} className="practice-topic-row">
                <span>{topic.name}</span>
                <div>
                  {progressDots(topic.attempts)}
                  <button
                    type="button"
                    className="practice-row-button"
                    onClick={() => startPractice(topic)}
                    aria-label={topic.unlocked ? `Practice ${topic.name}` : `${topic.name} is locked`}
                  >
                    {topic.unlocked || role === "admin" ? "Practice" : <Lock size={14} />}
                  </button>
                </div>
              </div>
            ))}
            {groupedTopics[group].length === 0 && (
              <div className="practice-topic-empty">No topics available in this section yet.</div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
