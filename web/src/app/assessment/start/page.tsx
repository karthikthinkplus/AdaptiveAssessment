"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";

import { ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { deferEffect } from "@/lib/browserState";

interface BackendTopic {
  id: string;
  name: string;
  difficulty_level?: string;
  grade?: string;
  subject?: string;
}

export default function AssessmentStart() {
  const router = useRouter();
  const [grade, setGrade] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [backendTopics, setBackendTopics] = useState<BackendTopic[]>([]);
  const [useMock, setUseMock] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Auth guard — redirect to login if not logged in
  useEffect(() => {
    return deferEffect(() => {
      setMounted(true);
      const loggedIn = Boolean(sessionStorage.getItem("tp_logged_in"));
      setAuthChecked(loggedIn);
      if (!loggedIn) {
        router.replace("/login?next=assessment");
      }
    });
  }, [router]);

  // Load backend topics
  useEffect(() => {
    if (!mounted || !authChecked) return;
    return deferEffect(() => {
      const fetchTopics = async () => {
        try {
          const list = await api.get<BackendTopic[]>("/api/v1/topics");
          setBackendTopics(list || []);
          if (!list || list.length === 0) {
            setUseMock(true);
          }
        } catch (err) {
          console.error("Backend offline or failed to fetch topics. Falling back to local mock data.", err);
          setUseMock(true);
        }
      };
      fetchTopics();
    });
  }, [mounted, authChecked]);

  if (!mounted || !authChecked) return null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!grade) e.grade = "Please select a grade/topic to start the assessment.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    if (grade === "mock-session" || useMock) {
      await new Promise(r => setTimeout(r, 700));
      router.push("/assessment/session-001");
    } else {
      try {
        // Map selected grade to a backend topic ID
        const num = grade.replace(/\D/g, ""); // "8", "9", "10"
        
        // 1. Look for difficulty level or name matches
        const diffMap: Record<string, string> = {
          "8": "easy",
          "9": "medium",
          "10": "hard"
        };
        const targetDiff = diffMap[num];
        
        let matchedTopic = backendTopics.find(t => 
          t.difficulty_level === targetDiff || 
          (t as any).difficulty === targetDiff
        );
        
        if (!matchedTopic) {
          matchedTopic = backendTopics.find(t => 
            t.name.toLowerCase().includes(`grade ${num}`) || 
            t.name.toLowerCase().includes(`class ${num}`)
          );
        }
        
        // 2. Fallback to Complement topics mapping
        if (!matchedTopic) {
          if (num === "8") {
            matchedTopic = backendTopics.find(t => t.name.includes("10's Complement"));
          } else if (num === "9") {
            matchedTopic = backendTopics.find(t => t.name.includes("100's Complement"));
          } else if (num === "10") {
            matchedTopic = backendTopics.find(t => 
              t.name.includes("Mixed Complement Applications") || 
              t.name.includes("1000's Complement")
            );
          }
        }
        
        // 3. Last resort fallback
        const finalTopicId = matchedTopic ? matchedTopic.id : (backendTopics[0]?.id || "");
        
        if (!finalTopicId) {
          throw new Error("No backend topics available to start assessment.");
        }

        const response = await api.post<{
          session: { id: string; student_id: string };
          first_question: any;
        }>("/api/v1/learning/sessions/start", { topic_id: finalTopicId });

        if (response.session && response.session.student_id) {
          const tpUser = sessionStorage.getItem("tp_user");
          if (tpUser) {
            try {
              const parsed = JSON.parse(tpUser);
              parsed.student_id = response.session.student_id;
              sessionStorage.setItem("tp_user", JSON.stringify(parsed));
            } catch (e) {
              console.error("Failed to update user session with student_id", e);
            }
          }
        }

        if (response.first_question) {
          sessionStorage.setItem("tp_current_question", JSON.stringify(response.first_question));
        }

        router.push(`/assessment/${response.session.id}`);
      } catch (err: any) {
        setErrors({ grade: err.message || "Failed to start learning session on backend." });
        setLoading(false);
      }
    }
  };

  return (
    <AppShell role="student" title="Start Assessment">
      <style dangerouslySetInnerHTML={{ __html: `
        .assessment-start-layout {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .assessment-card-form {
          width: 100%;
          max-width: 480px;
        }

        @media (max-width: 860px) {
          .assessment-card-form {
            max-width: 100%;
          }
        }
      `}} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1.5rem" }}>
        <div className="assessment-start-layout">
          <form onSubmit={handleStart} className="assessment-card-form animate-fade-in-up">
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--border)", boxShadow: "var(--shadow-md)", padding: "2rem 1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              {/* Grade Dropdown */}
              <div>
                <label style={{ fontSize: "0.875rem", fontWeight: 600, display: "block", marginBottom: "0.5rem", color: "var(--text-primary)" }}>
                  Select Grade
                </label>
                <select
                  id="assessment-grade"
                  className="tp-select"
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                  required
                >
                  <option value="" disabled>Choose a grade...</option>
                  <option value="Grade 8">Grade 8 (Algebra, Geometry, Arithmetic)</option>
                  <option value="Grade 9">Grade 9 (Number Systems, Polynomials, Statistics)</option>
                  <option value="Grade 10">Grade 10 (Real Numbers, Quadratics, Trigonometry)</option>
                </select>
                {errors.grade && <p style={{ color: "var(--danger)", fontSize: "0.75rem", marginTop: "0.375rem" }}>{errors.grade}</p>}
              </div>

              {/* Rules and Guidelines */}
              <div style={{ background: "var(--surface)", borderRadius: 12, padding: "1.25rem", border: "1px solid var(--border)" }}>
                <h3 style={{ fontSize: "0.875rem", fontWeight: 700, marginBottom: "0.75rem", color: "var(--text-primary)" }}>
                  Assessment Rules &amp; Guidelines
                </h3>
                <ul style={{ paddingLeft: "1.15rem", margin: 0, fontSize: "0.8125rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "0.5rem", lineHeight: 1.4 }}>
                  <li><strong>Adaptive Engine:</strong> The questions adapt to your performance. Answering correctly leads to harder questions; incorrect answers lead to easier ones.</li>
                  <li><strong>Time Allotted:</strong> Take your time. There is no strict timer, but typical completion takes 20-30 minutes.</li>
                  <li><strong>Test Continuity:</strong> Do not refresh the page or close the tab, otherwise your progress will be lost.</li>
                  <li><strong>Independent Work:</strong> Please solve all problems on your own without external help or calculators.</li>
                </ul>
              </div>

              <button
                id="start-assessment"
                type="submit"
                className="tp-btn-primary"
                style={{ justifyContent: "center", padding: "0.875rem", fontSize: "1rem", opacity: loading ? 0.7 : 1 }}
                disabled={loading}
              >
                {loading ? "Initialising..." : (<>Start Test <ArrowRight size={18} /></>)}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
