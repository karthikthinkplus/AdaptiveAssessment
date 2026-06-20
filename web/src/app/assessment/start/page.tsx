"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PublicHeader from "@/components/layout/PublicHeader";
import { ArrowRight } from "lucide-react";

export default function AssessmentStart() {
  const router = useRouter();
  const [grade, setGrade] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authChecked] = useState(() =>
    typeof window !== "undefined" && Boolean(sessionStorage.getItem("tp_logged_in"))
  );

  // Auth guard — redirect to login if not logged in
  useEffect(() => {
    if (!authChecked) {
      router.replace("/login?next=assessment");
    }
  }, [authChecked, router]);

  if (!authChecked) return null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!grade) e.grade = "Please select a grade to write the assessment.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    router.push("/assessment/session-001");
  };

  return (
    <div style={{ minHeight: "100vh", background: "transparent", fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column" }}>
      <PublicHeader />
      <style dangerouslySetInnerHTML={{ __html: `
        .assessment-start-layout {
          width: 100%;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(320px, 450px) minmax(0, 1fr);
          align-items: center;
          justify-content: center;
          gap: 0;
        }

        .assessment-card-form {
          grid-column: 2;
          position: relative;
          z-index: 2;
          width: 100%;
        }

        .assessment-guide {
          grid-column: 3;
          position: relative;
          z-index: 3;
          justify-self: start;
          margin-left: -4rem;
          margin-top: 5.25rem;
          pointer-events: none;
        }

        @media (max-width: 860px) {
          .assessment-start-layout {
            grid-template-columns: 1fr;
            max-width: 520px;
            justify-items: center;
          }

          .assessment-card-form {
            grid-column: 1;
            max-width: 100%;
          }

          .assessment-guide {
            display: none;
          }
        }
      `}} />

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem 1.5rem" }}>
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
                  <option value="" disabled>Choose your grade...</option>
                  <option value="8">Grade 8 (Algebra, Geometry, Arithmetic)</option>
                  <option value="9">Grade 9 (Number Systems, Polynomials, Statistics)</option>
                  <option value="10">Grade 10 (Real Numbers, Quadratics, Trigonometry)</option>
                </select>
                {errors.grade && <p style={{ color: "var(--danger)", fontSize: "0.75rem", marginTop: "0.375rem" }}>{errors.grade}</p>}
              </div>

              {/* Rules and Guidelines */}
              <div style={{ background: "var(--surface)", borderRadius: 12, padding: "1.25rem", border: "1px solid var(--border)" }}>
                <h3 style={{ fontSize: "0.875rem", fontWeight: 700, marginBottom: "0.75rem", color: "var(--text-primary)" }}>
                  Assessment Rules & Guidelines
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

          <div className="assessment-guide animate-fade-in-up">
            <img
              src="/tech-raccoon.png"
              alt="ThinkPlus guide pointing toward the assessment card"
              style={{
                width: "min(43vw, 470px)",
                minWidth: 390,
                height: "auto",
                display: "block",
                borderRadius: 24,
                filter: "drop-shadow(0 18px 30px rgba(15, 23, 42, 0.16))",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
