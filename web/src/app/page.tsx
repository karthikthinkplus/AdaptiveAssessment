"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PublicHeader from "@/components/layout/PublicHeader";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
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
    <main style={{ minHeight: "100vh", color: "var(--text-primary)", fontFamily: "'Aeonik', 'Inter', 'Segoe UI', sans-serif" }}>
      <PublicHeader />

      {/* ── Hero Section (Kept Intact) ── */}
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
              <Link href="/register" className="tp-btn-primary" style={{ padding: "0.875rem 1.35rem", display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
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
              alt="A raccoon reading a book"
              className="hero-raccoon-image"
            />
          </div>
        </div>
      </section>

      {/* ── Dynamic Smooth Snake Path Styles (Optimized for Fitted Full-Screen Scale) ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        .journey-wrapper {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .journey-container {
          position: relative;
          width: 100%;
          height: 480px; /* Bounded dimension box ensures path, cards and raccoons live together */
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
          transform: translateY(-4px) scale(1.05);
        }

        .journey-image {
          position: absolute;
          z-index: 4;
          height: auto;
          transition: transform 0.3s ease;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .journey-arrow {
          position: absolute;
          width: 28px;
          height: 28px;
          pointer-events: none;
          opacity: 0;
          z-index: 10;
        }
        
        #arrow-1 {
          offset-path: path('M 80 240 C 170 110, 340 110, 425 240');
          offset-rotate: auto;
        }
        #arrow-2 {
          offset-path: path('M 425 240 C 510 370, 690 370, 775 240');
          offset-rotate: auto;
        }
        #arrow-3 {
          offset-path: path('M 775 240 C 860 110, 1030 110, 1120 240');
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
          border-radius: 12px;
          padding: 0.9rem;
          box-shadow: 
            inset -1px -1px 3px rgba(139, 90, 43, 0.15),
            inset 1px 1px 2px rgba(255, 255, 255, 0.5),
            0 5px 12px rgba(0, 0, 0, 0.12);
          opacity: 0;
          pointer-events: none;
          transform: scale(0.85) translate(-50%, -50%);
          transform-origin: 0 0;
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease;
          z-index: 12;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stone-card-content {
          position: relative;
          z-index: 3;
          text-align: center;
          font-size: 0.95rem;
          font-weight: 800;
          color: #5C4033;
          line-height: 1.3;
          font-family: "Georgia", "Garamond", serif;
        }
        
        .card-1.card-visible { transform: scale(1) rotate(-1.5deg); opacity: 1; }
        .card-2.card-visible { transform: scale(1) rotate(1.5deg); opacity: 1; }
        .card-3.card-visible { transform: scale(1) rotate(-1.5deg); opacity: 1; }
        .card-4.card-visible { transform: scale(1) rotate(1.5deg); opacity: 1; }

        .arrow-animating {
          animation: move-arrow 1.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes move-arrow {
          0% { offset-distance: 0%; opacity: 0; transform: scale(0.6); }
          15% { opacity: 1; transform: scale(1.1); }
          85% { opacity: 1; transform: scale(1.1); }
          100% { offset-distance: 100%; opacity: 0; transform: scale(0.6); }
        }
      `}} />

      {/* ── Adaptive Learning Path Section (Redesigned Full-Screen Viewport Frame) ── */}
      <section style={{ 
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "3.5rem 2rem 2.5rem", 
        overflow: "hidden", 
        position: "relative",
        backgroundColor: "#EBF5FF",
        backgroundImage: "linear-gradient(rgba(30, 144, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(30, 144, 255, 0.05) 1px, transparent 1px)",
        backgroundSize: "24px 24px"
      }}>
        {/* Title Grouping Area */}
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center", width: "100%", flexShrink: 0 }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.1em", background: "var(--primary-light)", padding: "0.35rem 0.85rem", borderRadius: "999px" }}>
            The ThinkPlus Journey
          </span>
          <h2 style={{ fontSize: "2.5rem", fontWeight: 900, color: "#1F2A44", marginTop: "0.85rem", marginBottom: "0.5rem" }}>
            Your Adaptive Learning Path
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", maxWidth: 600, margin: "0 auto" }}>
            Follow the stepping stones horizontally to see how our engine dynamically adjusts to build your knowledge.
          </p>
        </div>

        {/* Content canvas container filling the central window viewport space smoothly */}
        <div className="journey-wrapper">
          <div className="journey-container" onMouseLeave={() => setActiveStep(null)}>
            
            {/* SVG curve vector shifted horizontally along a central 240px line layout */}
            <svg className="journey-svg-path" viewBox="0 0 1200 480" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1 }}>
              {/* Segment 1 */}
              <path 
                d="M 80 240 C 170 110, 340 110, 425 240" 
                stroke="#9CA3AF" 
                strokeWidth="5" 
                strokeDasharray="12 12" 
                fill="none" 
                strokeLinecap="round" 
                style={{ pointerEvents: "none" }}
              />
              <path 
                d="M 80 240 C 170 110, 340 110, 425 240" 
                stroke="transparent" 
                strokeWidth="24" 
                fill="none" 
                style={{ cursor: "pointer", pointerEvents: "stroke" }}
                onMouseEnter={() => { setActiveStep(1); triggerArrowAnimation(1); }}
              />

              {/* Segment 2 */}
              <path 
                d="M 425 240 C 510 370, 690 370, 775 240" 
                stroke="#9CA3AF" 
                strokeWidth="5" 
                strokeDasharray="12 12" 
                fill="none" 
                strokeLinecap="round" 
                style={{ pointerEvents: "none" }}
              />
              <path 
                d="M 425 240 C 510 370, 690 370, 775 240" 
                stroke="transparent" 
                strokeWidth="24" 
                fill="none" 
                style={{ cursor: "pointer", pointerEvents: "stroke" }}
                onMouseEnter={() => { setActiveStep(2); triggerArrowAnimation(2); }}
              />

              {/* Segment 3 */}
              <path 
                d="M 775 240 C 860 110, 1030 110, 1120 240" 
                stroke="#9CA3AF" 
                strokeWidth="5" 
                strokeDasharray="12 12" 
                fill="none" 
                strokeLinecap="round" 
                style={{ pointerEvents: "none" }}
              />
              <path 
                d="M 775 240 C 860 110, 1030 110, 1120 240" 
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

            {/* Information Info Popups */}
            <div className={`stone-card card-1 ${activeStep === 1 ? "card-visible" : ""}`} style={{ width: "230px", height: "100px", left: "20px", top: "310px" }}>
              <div className="stone-card-content">Take our Adaptive Test.</div>
            </div>
            
            <div className={`stone-card card-2 ${activeStep === 2 ? "card-visible" : ""}`} style={{ width: "230px", height: "100px", left: "305px", top: "50px" }}>
              <div className="stone-card-content">Identify your Skill.</div>
            </div>

            <div className={`stone-card card-3 ${activeStep === 3 ? "card-visible" : ""}`} style={{ width: "230px", height: "100px", left: "650px", top: "310px" }}>
              <div className="stone-card-content">Know your conceptual gaps.</div>
            </div>

            <div className={`stone-card card-4 ${activeStep === 4 ? "card-visible" : ""}`} style={{ width: "230px", height: "100px", left: "1000px", top: "50px" }}>
              <div className="stone-card-content">Get a detailed report</div>
            </div>

            {/* Step 1 Node Assets */}
            <div className="journey-stone stone-1" style={{ left: "80px", top: "240px" }} onMouseEnter={() => { setActiveStep(1); triggerArrowAnimation(1); }}>
              <div className="stone-hover-wrapper">
                <svg viewBox="0 0 100 85" style={{ width: 85, height: "auto", filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.12))" }}>
                  <ellipse cx="50" cy="74" rx="34" ry="7" fill="rgba(0,0,0,0.15)" />
                  <polygon points="12,48 35,62 65,62 88,48 88,58 65,72 35,72 12,58" fill="#4B5563" stroke="#1F2937" strokeWidth="4.5" strokeLinejoin="round" />
                  <polygon points="35,12 65,12 88,32 88,48 65,62 35,62 12,48 12,32" fill="#9CA3AF" stroke="#1F2937" strokeWidth="4.5" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img4.png" alt="Standing raccoon" className="journey-image image-1" style={{ width: "280px", left: "80px", top: "100px" }} />

            {/* Step 2 Node Assets */}
            <div className="journey-stone stone-2" style={{ left: "425px", top: "240px" }} onMouseEnter={() => { setActiveStep(2); triggerArrowAnimation(2); }}>
              <div className="stone-hover-wrapper">
                <svg viewBox="0 0 100 85" style={{ width: 85, height: "auto", filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.12))" }}>
                  <ellipse cx="50" cy="74" rx="34" ry="7" fill="rgba(0,0,0,0.15)" />
                  <polygon points="12,48 35,62 65,62 88,48 88,58 65,72 35,72 12,58" fill="#4B5563" stroke="#1F2937" strokeWidth="4.5" strokeLinejoin="round" />
                  <polygon points="35,12 65,12 88,32 88,48 65,62 35,62 12,48 12,32" fill="#9CA3AF" stroke="#1F2937" strokeWidth="4.5" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img2.png" alt="Thinking raccoon" className="journey-image image-2" style={{ width: "280px", left: "425px", top: "380px" }} />

            {/* Step 3 Node Assets */}
            <div className="journey-stone stone-3" style={{ left: "775px", top: "240px" }} onMouseEnter={() => { setActiveStep(3); triggerArrowAnimation(3); }}>
              <div className="stone-hover-wrapper">
                <svg viewBox="0 0 100 85" style={{ width: 85, height: "auto", filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.12))" }}>
                  <ellipse cx="50" cy="74" rx="34" ry="7" fill="rgba(0,0,0,0.15)" />
                  <polygon points="12,48 35,62 65,62 88,48 88,58 65,72 35,72 12,58" fill="#4B5563" stroke="#1F2937" strokeWidth="4.5" strokeLinejoin="round" />
                  <polygon points="35,12 65,12 88,32 88,48 65,62 35,62 12,48 12,32" fill="#9CA3AF" stroke="#1F2937" strokeWidth="4.5" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img3.png" alt="Raccoon with clipboard" className="journey-image image-3" style={{ width: "280px", left: "775px", top: "100px" }} />

            {/* Step 4 Node Assets */}
            <div className="journey-stone stone-4" style={{ left: "1120px", top: "240px" }} onMouseEnter={() => { setActiveStep(4); triggerArrowAnimation(3); }}>
              <div className="stone-hover-wrapper">
                <svg viewBox="0 0 100 85" style={{ width: 85, height: "auto", filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.12))" }}>
                  <ellipse cx="50" cy="74" rx="34" ry="7" fill="rgba(0,0,0,0.15)" />
                  <polygon points="12,48 35,62 65,62 88,48 88,58 65,72 35,72 12,58" fill="#4B5563" stroke="#1F2937" strokeWidth="4.5" strokeLinejoin="round" />
                  <polygon points="35,12 65,12 88,32 88,48 65,62 35,62 12,48 12,32" fill="#9CA3AF" stroke="#1F2937" strokeWidth="4.5" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img1.png" alt="Raccoon with lightbulb" className="journey-image image-4" style={{ width: "280px", left: "1120px", top: "380px" }} />

          </div>
        </div>

        {/* Empty space block element balancing window layout proportions perfectly */}
        <div style={{ height: 1 }} />
      </section>
    </main>
  );
}