"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PublicHeader from "@/components/layout/PublicHeader";
import {
  AlertTriangle,
  ArrowRight,
  FileText,
  Sparkles,
  X,
} from "lucide-react";

export default function LandingPage() {
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const triggerArrowAnimation = (index: number) => {
    const arrow = document.getElementById(`arrow-${index}`);
    if (arrow) {
      arrow.classList.remove("arrow-animating");
      void arrow.offsetWidth; // Force reflow
      arrow.classList.add("arrow-animating");
    }
  };

  useEffect(() => {
    const cleanup = (e: AnimationEvent) => {
      const target = e.target as HTMLElement;
      target.classList.remove("arrow-animating");
    };
    const arrow1 = document.getElementById("arrow-1");
    const arrow2 = document.getElementById("arrow-2");
    const arrow3 = document.getElementById("arrow-3");
    
    arrow1?.addEventListener("animationend", cleanup);
    arrow2?.addEventListener("animationend", cleanup);
    arrow3?.addEventListener("animationend", cleanup);
    return () => {
      arrow1?.removeEventListener("animationend", cleanup);
      arrow2?.removeEventListener("animationend", cleanup);
      arrow3?.removeEventListener("animationend", cleanup);
    };
  }, []);

  return (
    <main style={{ minHeight: "100vh", color: "var(--text-primary)", fontFamily: "\"Aeonik\", \"Inter\", \"Segoe UI\", sans-serif" }}>
      <PublicHeader />

      {/* ── Hero Section (Tightened Padding & Heights) ── */}
      <section style={{ padding: "4rem 2rem 1rem", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.02fr 0.98fr",
          gap: "2rem",
          alignItems: "center",
          width: "100%",
        }}>
          <div className="animate-fade-in-up">
            <h1 style={{
              fontSize: "3.8rem",
              lineHeight: 1.04,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              marginBottom: "1.25rem",
              color: "#1F2A44",
            }}>
              Adaptive Learning and Assessment
            </h1>
            <p style={{ maxWidth: 510, color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: 1.75, marginBottom: "2rem" }}>
              ThinkPlus adapts to you, not the other way around. Take smarter tests, get better insights, improve faster.
            </p>
            <div style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap" }}>
              <Link href="/register" className="tp-btn-primary" style={{ textDecoration: "none", padding: "0.875rem 1.35rem" }}>
                Get Started <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          <div className="hero-raccoon-stage animate-fade-in-up stagger-2" style={{ alignSelf: "center", position: "relative" }}>
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 420,
              height: 320,
              borderRadius: "50%",
              background: "radial-gradient(ellipse, rgba(242,90,167,0.10) 0%, rgba(58,174,216,0.06) 55%, transparent 80%)",
              filter: "blur(20px)",
              zIndex: 0,
            }} />

            <div className="hero-raccoon-blob hero-raccoon-blob-blue" />
            <div className="hero-raccoon-blob hero-raccoon-blob-pink" />

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/raccoon_reading.png"
              alt="A raccoon reading a book — representing the joy of learning"
              className="hero-raccoon-image"
            />
          </div>
        </div>
      </section>

      {/* ── Dynamic Smooth Snake Path Styles ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        .journey-scroll-wrapper {
          width: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          padding: 2rem 1rem 4rem;
          scroll-behavior: smooth;
        }
        .journey-scroll-wrapper::-webkit-scrollbar {
          height: 8px;
        }
        .journey-scroll-wrapper::-webkit-scrollbar-track {
          background: #F3F4F6;
          border-radius: 999px;
        }
        .journey-scroll-wrapper::-webkit-scrollbar-thumb {
          background: #D1D5DB;
          border-radius: 999px;
        }
        .journey-scroll-wrapper::-webkit-scrollbar-thumb:hover {
          background: #9CA3AF;
        }

        .journey-container {
          position: relative;
          width: 1550px;
          height: 660px;
          margin: 0 auto;
        }
        .journey-stone {
          position: absolute;
          z-index: 5;
          transform: translate(-50%, -50%);
        }

        .stone-hover-wrapper {
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
        }
        .stone-hover-wrapper:hover {
          transform: translateY(-6px) scale(1.05);
        }

        .journey-image {
          position: absolute;
          z-index: 4;
          height: auto;
          transition: transform 0.3s ease;
          transform: translate(-50%, -50%);
        }

        .journey-arrow {
          position: absolute;
          width: 32px;
          height: 32px;
          pointer-events: none;
          opacity: 0;
          z-index: 10;
        }
        
        #arrow-1 {
          offset-path: path('M 160 330 C 255 160, 445 160, 540 330');
          offset-rotate: auto;
        }
        #arrow-2 {
          offset-path: path('M 540 330 C 635 500, 825 500, 920 330');
          offset-rotate: auto;
        }
        #arrow-3 {
          offset-path: path('M 920 330 C 1015 160, 1205 160, 1300 330');
          offset-rotate: auto;
        }

        .stone-card {
          position: absolute;
          background: 
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 1px,
              rgba(139, 90, 43, 0.02) 1px,
              rgba(139, 90, 43, 0.02) 2px
            ),
            linear-gradient(135deg, #E8D7C3 0%, #DCC4A8 40%, #D4B896 100%);
          border: 1px solid rgba(139, 90, 43, 0.2);
          border-radius: 14px;
          padding: 1.2rem;
          box-shadow: 
            inset -1px -1px 3px rgba(139, 90, 43, 0.15),
            inset 1px 1px 2px rgba(255, 255, 255, 0.5),
            0 5px 12px rgba(0, 0, 0, 0.12),
            -2px 2px 4px rgba(0, 0, 0, 0.06);
          opacity: 0;
          pointer-events: none;
          transform: scale(0.85) translate(-50%, -50%);
          transform-origin: 0 0;
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease, box-shadow 0.35s ease;
          z-index: 12;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stone-card::before {
          content: '';
          position: absolute;
          inset: -1px;
          background: 
            radial-gradient(ellipse 60% 50% at 30% 40%, rgba(139, 90, 43, 0.15) 0%, transparent 40%),
            radial-gradient(ellipse 40% 60% at 70% 60%, rgba(165, 120, 75, 0.12) 0%, transparent 35%),
            radial-gradient(circle at 15% 20%, rgba(101, 67, 33, 0.08) 0%, transparent 20%),
            radial-gradient(circle at 85% 85%, rgba(139, 90, 43, 0.1) 0%, transparent 25%);
          pointer-events: none;
          border-radius: 14px;
        }
        .stone-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: 
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 3px,
              rgba(139, 90, 43, 0.015) 3px,
              rgba(139, 90, 43, 0.015) 4px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 3px,
              rgba(101, 67, 33, 0.01) 3px,
              rgba(101, 67, 33, 0.01) 4px
            );
          pointer-events: none;
          opacity: 0.8;
          border-radius: 14px;
        }
        .stone-card-content {
          position: relative;
          z-index: 3;
          text-align: center;
          font-size: 1.05rem;
          font-weight: 800;
          color: #5C4033;
          line-height: 1.35;
          text-shadow: 0.5px 0.5px 0.5px rgba(255, 255, 255, 0.4);
          font-family: "Georgia", "Garamond", serif;
        }
        
        .card-1.card-visible { transform: scale(1) rotate(-1.5deg); opacity: 1; }
        .card-2.card-visible { transform: scale(1) rotate(1.5deg); opacity: 1; }
        .card-3.card-visible { transform: scale(1) rotate(-1.5deg); opacity: 1; }
        .card-4.card-visible { transform: scale(1) rotate(1.5deg); opacity: 1; }

        .stone-card.card-visible:hover {
          box-shadow: 
            inset -1px -1px 3px rgba(139, 90, 43, 0.15),
            inset 1px 1px 2px rgba(255, 255, 255, 0.5),
            0 10px 20px rgba(0, 0, 0, 0.18),
            -3px 3px 6px rgba(0, 0, 0, 0.08);
        }

        .arrow-animating {
          animation: move-arrow 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes move-arrow {
          0% { offset-distance: 0%; opacity: 0; transform: scale(0.6); }
          15% { opacity: 1; transform: scale(1.1); }
          85% { opacity: 1; transform: scale(1.1); }
          100% { offset-distance: 100%; opacity: 0; transform: scale(0.6); }
        }
      `}} />

      {/* ── Adaptive Learning Path Section (Tightened Padding Configuration) ── */}
      <section style={{ padding: "1rem 2rem 2rem", background: "linear-gradient(180deg, #FFFFFF 0%, #F3F4F6 100%)", overflow: "hidden", position: "relative" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center", marginBottom: "1rem" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.1em", background: "var(--primary-light)", padding: "0.35rem 0.85rem", borderRadius: "999px" }}>
            The ThinkPlus Journey
          </span>
          <h2 style={{ fontSize: "2.5rem", fontWeight: 900, color: "#1F2A44", marginTop: "0.75rem", marginBottom: "0.5rem" }}>
            Your Adaptive Learning Path
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", maxWidth: 600, margin: "0 auto" }}>
            Follow the stepping stones horizontally to see how our engine dynamically adjusts to build your knowledge.
          </p>
        </div>

        {/* Scroll Wrapper */}
        <div className="journey-scroll-wrapper">
          <div className="journey-container" onMouseLeave={() => setActiveStep(null)}>
            
            {/* Smooth Snake Curve SVG Path Layer */}
            <svg className="journey-svg-path" viewBox="0 0 1550 660" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1 }}>
              {/* Segment 1 */}
              <path 
                d="M 160 330 C 255 160, 445 160, 540 330" 
                stroke="#9CA3AF" 
                strokeWidth="6" 
                strokeDasharray="14 14" 
                fill="none" 
                strokeLinecap="round" 
                style={{ pointerEvents: "none" }}
              />
              <path 
                d="M 160 330 C 255 160, 445 160, 540 330" 
                stroke="transparent" 
                strokeWidth="24" 
                fill="none" 
                style={{ cursor: "pointer", pointerEvents: "stroke" }}
                onMouseEnter={() => { setActiveStep(1); triggerArrowAnimation(1); }}
              />

              {/* Segment 2 */}
              <path 
                d="M 540 330 C 635 500, 825 500, 920 330" 
                stroke="#9CA3AF" 
                strokeWidth="6" 
                strokeDasharray="14 14" 
                fill="none" 
                strokeLinecap="round" 
                style={{ pointerEvents: "none" }}
              />
              <path 
                d="M 540 330 C 635 500, 825 500, 920 330" 
                stroke="transparent" 
                strokeWidth="24" 
                fill="none" 
                style={{ cursor: "pointer", pointerEvents: "stroke" }}
                onMouseEnter={() => { setActiveStep(2); triggerArrowAnimation(2); }}
              />

              {/* Segment 3 */}
              <path 
                d="M 920 330 C 1015 160, 1205 160, 1300 330" 
                stroke="#9CA3AF" 
                strokeWidth="6" 
                strokeDasharray="14 14" 
                fill="none" 
                strokeLinecap="round" 
                style={{ pointerEvents: "none" }}
              />
              <path 
                d="M 920 330 C 1015 160, 1205 160, 1300 330" 
                stroke="transparent" 
                strokeWidth="24" 
                fill="none" 
                style={{ cursor: "pointer", pointerEvents: "stroke" }}
                onMouseEnter={() => { setActiveStep(3); triggerArrowAnimation(3); }}
              />
            </svg>

            {/* Animated Arrowheads */}
            <svg id="arrow-1" className="journey-arrow" viewBox="0 0 24 24">
              <path d="M 22 12 L 12 22 L 12 17 L 2 17 L 2 7 L 12 7 L 12 2 Z" fill="#9CA3AF" stroke="#1F2937" strokeWidth="2.5" strokeLinejoin="round" />
            </svg>
            <svg id="arrow-2" className="journey-arrow" viewBox="0 0 24 24">
              <path d="M 22 12 L 12 22 L 12 17 L 2 17 L 2 7 L 12 7 L 12 2 Z" fill="#9CA3AF" stroke="#1F2937" strokeWidth="2.5" strokeLinejoin="round" />
            </svg>
            <svg id="arrow-3" className="journey-arrow" viewBox="0 0 24 24">
              <path d="M 22 12 L 12 22 L 12 17 L 2 17 L 2 7 L 12 7 L 12 2 Z" fill="#9CA3AF" stroke="#1F2937" strokeWidth="2.5" strokeLinejoin="round" />
            </svg>

            {/* Big Info Cards alternating opposite to the raccoon positions */}
            <div className={`stone-card card-1 ${activeStep === 1 ? "card-visible" : ""}`} style={{ width: "250px", height: "130px", left: "35px", top: "510px" }}>
              <div className="stone-card-content">Take our Adaptive Test.</div>
            </div>
            
            <div className={`stone-card card-2 ${activeStep === 2 ? "card-visible" : ""}`} style={{ width: "250px", height: "130px", left: "415px", top: "110px" }}>
              <div className="stone-card-content">Identify your Skill.</div>
            </div>

            <div className={`stone-card card-3 ${activeStep === 3 ? "card-visible" : ""}`} style={{ width: "250px", height: "130px", left: "795px", top: "510px" }}>
              <div className="stone-card-content">Know your conceptual gaps.</div>
            </div>

            <div className={`stone-card card-4 ${activeStep === 4 ? "card-visible" : ""}`} style={{ width: "250px", height: "130px", left: "1175px", top: "110px" }}>
              <div className="stone-card-content">Get a detailed report</div>
            </div>

            {/* Step 1 */}
            <div className="journey-stone stone-1" style={{ left: "160px", top: "330px" }} onMouseEnter={() => { setActiveStep(1); triggerArrowAnimation(1); }}>
              <div className="stone-hover-wrapper">
                <svg viewBox="0 0 100 85" style={{ width: 125, height: "auto", filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.12))" }}>
                  <ellipse cx="50" cy="74" rx="34" ry="7" fill="rgba(0,0,0,0.15)" />
                  <polygon points="12,48 35,62 65,62 88,48 88,58 65,72 35,72 12,58" fill="#4B5563" stroke="#1F2937" strokeWidth="4.5" strokeLinejoin="round" />
                  <polygon points="35,12 65,12 88,32 88,48 65,62 35,62 12,48 12,32" fill="#9CA3AF" stroke="#1F2937" strokeWidth="4.5" strokeLinejoin="round" />
                  <polygon points="36,17 64,17 83,34 83,43 64,55 36,55 17,43 17,34" fill="#D1D5DB" />
                  <polygon points="38,22 62,22 78,35 78,40 62,49 38,49 22,40 22,35" fill="#E5E7EB" />
                </svg>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img4.png" alt="Standing raccoon" className="journey-image image-1" style={{ width: "230px", left: "160px", top: "140px" }} />

            {/* Step 2 */}
            <div className="journey-stone stone-2" style={{ left: "540px", top: "330px" }} onMouseEnter={() => { setActiveStep(2); triggerArrowAnimation(2); }}>
              <div className="stone-hover-wrapper">
                <svg viewBox="0 0 100 85" style={{ width: 125, height: "auto", filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.12))" }}>
                  <ellipse cx="50" cy="74" rx="34" ry="7" fill="rgba(0,0,0,0.15)" />
                  <polygon points="12,48 35,62 65,62 88,48 88,58 65,72 35,72 12,58" fill="#4B5563" stroke="#1F2937" strokeWidth="4.5" strokeLinejoin="round" />
                  <polygon points="35,12 65,12 88,32 88,48 65,62 35,62 12,48 12,32" fill="#9CA3AF" stroke="#1F2937" strokeWidth="4.5" strokeLinejoin="round" />
                  <polygon points="36,17 64,17 83,34 83,43 64,55 36,55 17,43 17,34" fill="#D1D5DB" />
                  <polygon points="38,22 62,22 78,35 78,40 62,49 38,49 22,40 22,35" fill="#E5E7EB" />
                </svg>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img2.png" alt="Thinking raccoon" className="journey-image image-2" style={{ width: "230px", left: "540px", top: "520px" }} />

            {/* Step 3 */}
            <div className="journey-stone stone-3" style={{ left: "920px", top: "330px" }} onMouseEnter={() => { setActiveStep(3); triggerArrowAnimation(3); }}>
              <div className="stone-hover-wrapper">
                <svg viewBox="0 0 100 85" style={{ width: 125, height: "auto", filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.12))" }}>
                  <ellipse cx="50" cy="74" rx="34" ry="7" fill="rgba(0,0,0,0.15)" />
                  <polygon points="12,48 35,62 65,62 88,48 88,58 65,72 35,72 12,58" fill="#4B5563" stroke="#1F2937" strokeWidth="4.5" strokeLinejoin="round" />
                  <polygon points="35,12 65,12 88,32 88,48 65,62 35,62 12,48 12,32" fill="#9CA3AF" stroke="#1F2937" strokeWidth="4.5" strokeLinejoin="round" />
                  <polygon points="36,17 64,17 83,34 83,43 64,55 36,55 17,43 17,34" fill="#D1D5DB" />
                  <polygon points="38,22 62,22 78,35 78,40 62,49 38,49 22,40 22,35" fill="#E5E7EB" />
                </svg>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img3.png" alt="Raccoon with clipboard" className="journey-image image-3" style={{ width: "230px", left: "920px", top: "140px" }} />

            {/* Step 4 */}
            <div className="journey-stone stone-4" style={{ left: "1300px", top: "330px" }} onMouseEnter={() => { setActiveStep(4); triggerArrowAnimation(3); }}>
              <div className="stone-hover-wrapper">
                <svg viewBox="0 0 100 85" style={{ width: 125, height: "auto", filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.12))" }}>
                  <ellipse cx="50" cy="74" rx="34" ry="7" fill="rgba(0,0,0,0.15)" />
                  <polygon points="12,48 35,62 65,62 88,48 88,58 65,72 35,72 12,58" fill="#4B5563" stroke="#1F2937" strokeWidth="4.5" strokeLinejoin="round" />
                  <polygon points="35,12 65,12 88,32 88,48 65,62 35,62 12,48 12,32" fill="#9CA3AF" stroke="#1F2937" strokeWidth="4.5" strokeLinejoin="round" />
                  <polygon points="36,17 64,17 83,34 83,43 64,55 36,55 17,43 17,34" fill="#D1D5DB" />
                  <polygon points="38,22 62,22 78,35 78,40 62,49 38,49 22,40 22,35" fill="#E5E7EB" />
                </svg>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img1.png" alt="Raccoon with lightbulb" className="journey-image image-4" style={{ width: "230px", left: "1300px", top: "520px" }} />

          </div>
        </div>
      </section>

      {showFeaturesModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          background: "rgba(217, 234, 250, 0.7)",
          backdropFilter: "blur(8px)",
        }}>
          <div className="tp-card animate-scale-in" style={{ maxWidth: 550, width: "100%", padding: "2rem", position: "relative", display: "flex", flexDirection: "column", gap: "1.4rem" }}>
            <button
              onClick={() => setShowFeaturesModal(false)}
              aria-label="Close"
              style={{ position: "absolute", top: 18, right: 18, width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--border)", background: "#fff", color: "var(--text-secondary)", display: "grid", placeItems: "center", cursor: "pointer" }}
            >
              <X size={18} />
            </button>

            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.45rem" }}>ThinkPlus Features</h2>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Discover how ThinkPlus helps students learn and assess adaptively.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                {
                  icon: <Sparkles size={20} />,
                  title: "Adaptive Testing",
                  desc: "Test the student through adaptivity, serving real-time adjusted questions matching their precise ability level.",
                  bg: "#FFEAF5",
                  color: "#F25AA7",
                },
                {
                  icon: <AlertTriangle size={20} />,
                  title: "Error & Gap Diagnosis",
                  desc: "Identify the gaps that caused the error, whether it is a conceptual gap, calculation error, or comprehension error.",
                  bg: "#FFF6CB",
                  color: "#E0AA10",
                },
                {
                  icon: <FileText size={20} />,
                  title: "Detailed Reports",
                  desc: "Give a detailed report on the student's weak points and strengths, as well as their understanding of the concepts.",
                  bg: "#E6F7FF",
                  color: "#3AAED8",
                },
              ].map((feature) => (
                <div key={feature.title} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <div style={{ width: 42, height: 42, borderRadius: 14, background: feature.bg, color: feature.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 800, fontSize: "0.95rem", marginBottom: "0.25rem" }}>{feature.title}</h3>
                    <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", borderTop: "1px solid var(--border)", paddingTop: "1.1rem" }}>
              <button className="tp-btn-ghost" onClick={() => setShowFeaturesModal(false)}>Close</button>
              <Link href="/register" className="tp-btn-primary" style={{ textDecoration: "none" }}>Get Started</Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}