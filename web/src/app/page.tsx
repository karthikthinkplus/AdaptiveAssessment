"use client";

import Link from "next/link";
import PublicHeader from "@/components/layout/PublicHeader";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <main style={{ minHeight: "100vh", fontFamily: "'Inter', 'Segoe UI', sans-serif", background: "transparent" }}>

      {/* ═══════════════════════════════════════════════════════
          HERO — Bright sky, cartoon clouds, adaptive theme
      ═══════════════════════════════════════════════════════ */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap');

        /* -- Cloud float animation -- */
        @keyframes cloud-drift-l { 0%,100%{transform:translateX(0)} 50%{transform:translateX(-18px)} }
        @keyframes cloud-drift-r { 0%,100%{transform:translateX(0)} 50%{transform:translateX(18px)} }
        @keyframes icon-bob      { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-14px) rotate(4deg)} }
        @keyframes icon-bob-r    { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-10px) rotate(-3deg)} }
        @keyframes hero-badge-in { from{opacity:0;transform:scale(0.85) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }

        .hero-sky {
          position: relative;
          overflow: hidden;
          background: linear-gradient(180deg, #56CCF2 0%, #2F80ED 28%, #56CCF2 60%, #a8e8f8 85%, #d4f0ee 100%);
          padding-bottom: 0;
          min-height: 88vh;
          display: flex;
          flex-direction: column;
        }

        /* -- Clouds -- */
        .cloud-wrap { position: absolute; inset: 0; pointer-events: none; z-index: 1; }

        .cloud {
          position: absolute;
          background: rgba(255,255,255,0.92);
          border-radius: 999px;
          filter: blur(2px);
        }
        .cloud::before, .cloud::after {
          content: '';
          position: absolute;
          background: rgba(255,255,255,0.92);
          border-radius: 999px;
        }
        /* Left big cloud */
        .cloud-1 {
          width: 260px; height: 70px;
          left: -40px; top: 38%;
          animation: cloud-drift-l 9s ease-in-out infinite;
          filter: blur(1px);
        }
        .cloud-1::before { width: 140px; height: 90px; top: -45px; left: 40px; }
        .cloud-1::after  { width: 100px; height: 70px; top: -30px; left: 120px; }

        /* Right big cloud */
        .cloud-2 {
          width: 280px; height: 75px;
          right: -60px; top: 32%;
          animation: cloud-drift-r 11s ease-in-out infinite;
          filter: blur(1px);
        }
        .cloud-2::before { width: 150px; height: 95px; top: -50px; left: 50px; }
        .cloud-2::after  { width: 110px; height: 70px; top: -32px; left: 140px; }

        /* Small cloud top-left */
        .cloud-3 {
          width: 160px; height: 45px;
          left: 10%; top: 12%;
          animation: cloud-drift-l 13s ease-in-out infinite 2s;
          opacity: 0.85;
        }
        .cloud-3::before { width: 90px; height: 60px; top: -30px; left: 25px; }
        .cloud-3::after  { width: 70px; height: 45px; top: -20px; left: 80px; }

        /* Small cloud top-right */
        .cloud-4 {
          width: 180px; height: 50px;
          right: 12%; top: 8%;
          animation: cloud-drift-r 10s ease-in-out infinite 1s;
          opacity: 0.8;
        }
        .cloud-4::before { width: 100px; height: 65px; top: -32px; left: 28px; }
        .cloud-4::after  { width: 75px; height: 50px; top: -22px; left: 88px; }

        /* Bottom-center cloud blending into teal */
        .cloud-5 {
          width: 500px; height: 100px;
          left: 50%; bottom: 0px;
          transform: translateX(-50%);
          background: rgba(255,255,255,0.6);
          filter: blur(18px);
        }

        /* -- Hero text area -- */
        .hero-center {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 7.5rem 1.5rem 2rem;
          flex: 1;
        }

        .hero-main-title {
          font-family: 'Nunito', sans-serif;
          font-size: clamp(2.8rem, 6vw, 4.8rem);
          font-weight: 900;
          color: #ffffff;
          line-height: 1.08;
          margin: 0 0 1rem;
          text-shadow: 0 2px 16px rgba(0,80,160,0.25), 0 1px 3px rgba(0,0,0,0.12);
          letter-spacing: -0.02em;
        }
        .hero-main-title span {
          color: #FFE06A;
          display: block;
          text-shadow: 0 2px 20px rgba(255,160,0,0.35), 0 1px 3px rgba(0,0,0,0.12);
        }

        .hero-subtitle-pill {
          display: inline-block;
          background: rgba(255,255,255,0.22);
          backdrop-filter: blur(8px);
          border: 1.5px solid rgba(255,255,255,0.45);
          border-radius: 999px;
          color: #ffffff;
          font-size: 1.05rem;
          font-weight: 600;
          padding: 0.55rem 1.5rem;
          margin-bottom: 2.5rem;
          animation: hero-badge-in 0.7s ease both 0.3s;
          letter-spacing: 0.01em;
        }

        .hero-cta-group {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 3rem;
        }
        .hero-btn-main {
          background: #F25AA7;
          color: #fff;
          border: none;
          border-radius: 999px;
          padding: 0.85rem 2.2rem;
          font-size: 1rem;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          box-shadow: 0 6px 24px rgba(242,90,167,0.4), 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .hero-btn-main:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(242,90,167,0.5); }
        .hero-btn-ghost {
          background: rgba(255,255,255,0.18);
          backdrop-filter: blur(6px);
          color: #fff;
          border: 2px solid rgba(255,255,255,0.6);
          border-radius: 999px;
          padding: 0.85rem 2.2rem;
          font-size: 1rem;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          transition: background 0.15s, transform 0.15s;
        }
        .hero-btn-ghost:hover { background: rgba(255,255,255,0.28); transform: translateY(-2px); }

        /* -- Floating decorative elements (adaptive theme) -- */
        .hero-floaters {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }
        .floater {
          position: absolute;
          font-size: 3rem;
          filter: drop-shadow(0 4px 12px rgba(0,0,0,0.15));
        }
        .floater-1 { left: 5%;  top: 20%; animation: icon-bob   7s ease-in-out infinite; }
        .floater-2 { left: 10%; top: 62%; animation: icon-bob-r 8s ease-in-out infinite 1s; font-size: 2.4rem; }
        .floater-3 { right: 6%; top: 18%; animation: icon-bob   9s ease-in-out infinite 0.5s; }
        .floater-4 { right: 9%; top: 58%; animation: icon-bob-r 7s ease-in-out infinite 2s; font-size: 2.4rem; }
        .floater-5 { left: 22%; top: 72%; animation: icon-bob   6s ease-in-out infinite 1.5s; font-size: 2.2rem; }
        .floater-6 { right: 22%; top: 70%; animation: icon-bob-r 8s ease-in-out infinite 3s; font-size: 2.2rem; }

        /* -- Green ground strip at the bottom -- */
        .hero-ground {
          position: relative;
          z-index: 2;
          height: 90px;
          margin-top: auto;
          background: linear-gradient(180deg, transparent 0%, #d4f0ee 100%);
        }

        /* ═══ FEATURES SECTION ═══ */
        .features-wrapper {
          background: #d4f0ee;
          position: relative;
          margin-top: -2px;
          z-index: 10;
        }

        .feature-section {
          max-width: 1100px;
          margin: 0 auto;
          padding: 5rem 2rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4.5rem;
          align-items: center;
        }
        .feature-section.reverse { direction: rtl; }
        .feature-section.reverse > * { direction: ltr; }

        .feature-divider { max-width: 1100px; margin: 0 auto; padding: 0 2rem; }
        .feature-divider hr { border: none; border-top: 1.5px solid rgba(0,130,120,0.15); }

        .feat-tag {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          padding: 0.28rem 0.85rem;
          border-radius: 999px;
          margin-bottom: 0.8rem;
        }
        .feat-title {
          font-size: clamp(2rem, 3.5vw, 2.8rem);
          font-weight: 900;
          line-height: 1.08;
          color: #1F2A44;
          margin: 0 0 1rem;
          letter-spacing: -0.025em;
        }
        .feat-desc {
          font-size: 1rem;
          line-height: 1.78;
          color: #4B5563;
          margin: 0 0 1.75rem;
          max-width: 440px;
        }
        .feat-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.875rem;
          font-weight: 700;
          color: #00897B;
          text-decoration: none;
          border-bottom: 2px solid rgba(0,137,123,0.25);
          padding-bottom: 2px;
          transition: color 0.2s, border-color 0.2s;
        }
        .feat-link:hover { color: #00695C; border-color: #00695C; }

        .feat-mockup {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,137,123,0.12), 0 4px 16px rgba(0,0,0,0.06);
          border: 1.5px solid #000;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
        }
        .feat-mockup::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: var(--mt, linear-gradient(90deg,#00A396,#F25AA7));
        }
        .mockup-bar {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-bottom: 1.15rem;
          padding-bottom: 0.7rem;
          border-bottom: 1px solid #F1F5F9;
        }
        .mockup-dot { width: 9px; height: 9px; border-radius: 50%; }
        .mockup-label { font-size: 0.72rem; font-weight: 700; color: #9CA3AF; margin-left: 4px; }

        /* -- Why section -- */
        .why-section {
          text-align: center;
          padding: 5rem 2rem 6rem;
          max-width: 1100px;
          margin: 0 auto;
        }
        .why-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
          margin-top: 2.75rem;
        }
        .why-card {
          background: #fff;
          border-radius: 18px;
          padding: 1.75rem 1.4rem;
          box-shadow: 0 6px 22px rgba(0,130,120,0.09);
          border: 1.5px solid #000;
          text-align: left;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .why-card:hover { transform: translateY(-4px); box-shadow: 0 14px 38px rgba(0,130,120,0.14); }
        .why-icon { font-size: 1.9rem; margin-bottom: 0.85rem; display: block; }
        .why-card h3 { font-size: 1.05rem; font-weight: 800; color: #1F2A44; margin: 0 0 0.45rem; }
        .why-card p  { font-size: 0.85rem; color: #6B7280; line-height: 1.65; margin: 0; }
      `}} />

      {/* PUBLIC HEADER */}
      <PublicHeader />

      {/* -- SKY HERO -- */}
      <section className="hero-sky">

        {/* Clouds */}
        <div className="cloud-wrap">
          <div className="cloud cloud-1" />
          <div className="cloud cloud-2" />
          <div className="cloud cloud-3" />
          <div className="cloud cloud-4" />
          <div className="cloud cloud-5" />
        </div>

        {/* Floating adaptive-theme icons */}
        <div className="hero-floaters">
          <span className="floater floater-1">📚</span>
          <span className="floater floater-2">✏️</span>
          <span className="floater floater-3">🧠</span>
          <span className="floater floater-4">📊</span>
          <span className="floater floater-5">💡</span>
          <span className="floater floater-6">🎯</span>
        </div>

        {/* Centered Title + CTA */}
        <div className="hero-center">
          <h1 className="hero-main-title">
            The smarter way to
            <span>learn & assess.</span>
          </h1>
          <div className="hero-subtitle-pill">
            Adaptive questions · Live feedback · Real growth
          </div>
          <div className="hero-cta-group">
            <Link href="/register" className="hero-btn-main">
              Register <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="hero-btn-ghost">
              Log In
            </Link>
          </div>
        </div>

        {/* Fade ground into teal below */}
        <div className="hero-ground" />
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURE SECTIONS — pale teal bg, reference image layout
      ═══════════════════════════════════════════════════════ */}
      <div className="features-wrapper">

        {/* SECTION 1: Adaptive Assessment */}
        <div className="feature-section">
          <div>
            <span className="feat-tag" style={{ background: "rgba(242,90,167,0.11)", color: "#AD1457" }}>Assess</span>
            <h2 className="feat-title">Know exactly where you stand</h2>
            <p className="feat-desc">
              Our engine listens to every answer you give and reshapes the next question around it — homing in on your exact knowledge gaps. No wasted time, no fixed difficulty. Just a test that truly adapts to you.
            </p>
            <Link href="/register" className="feat-link">Take your first test →</Link>
          </div>
          <div className="feat-mockup" style={{ ["--mt" as string]: "linear-gradient(90deg,#F25AA7,#FF8C42)" }}>
            <div className="mockup-bar">
              <div className="mockup-dot" style={{ background: "#F25AA7" }} />
              <div className="mockup-dot" style={{ background: "#FFD54F" }} />
              <div className="mockup-dot" style={{ background: "#4FCB8D" }} />
              <span className="mockup-label">Adaptive Assessment</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
              <div style={{ background: "#FFF0F6", borderRadius: 10, padding: "0.8rem 1rem" }}>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#AD1457", marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Question 4 of 14 · Adjusting difficulty</div>
                <div style={{ fontSize: "0.83rem", fontWeight: 700, color: "#1F2A44" }}>The average of 5 consecutive even numbers is 24. What is the largest?</div>
              </div>
              {["A.  20", "B.  26", "C.  28 ✓", "D.  30"].map((opt, i) => (
                <div key={i} style={{ padding: "0.55rem 0.9rem", borderRadius: 8, border: i === 2 ? "2px solid #F25AA7" : "1.5px solid #E5E7EB", background: i === 2 ? "rgba(242,90,167,0.05)" : "#FAFAFA", fontSize: "0.78rem", fontWeight: i === 2 ? 700 : 500, color: i === 2 ? "#AD1457" : "#374151" }}>
                  {opt}
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.15rem" }}>
                <span style={{ fontSize: "0.67rem", color: "#9CA3AF" }}>Next question will be harder…</span>
                <div style={{ background: "#F25AA7", color: "#fff", borderRadius: 8, padding: "0.35rem 0.9rem", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}>Next →</div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Topic Practice */}
        <div className="feature-section reverse">
          <div>
            <span className="feat-tag" style={{ background: "rgba(0,163,150,0.11)", color: "#00574F" }}>Practice</span>
            <h2 className="feat-title">Practice the topics you actually need</h2>
            <p className="feat-desc">
              Select any section, topic or subtopic from the curriculum tree and instantly get a fresh practice session. Questions are drawn live from the database — pick one subtopic or sweep an entire section at once.
            </p>
            <Link href="/student/practice" className="feat-link">Start practising →</Link>
          </div>
          <div className="feat-mockup" style={{ ["--mt" as string]: "linear-gradient(90deg,#00A396,#4FCB8D)" }}>
            <div className="mockup-bar">
              <div className="mockup-dot" style={{ background: "#00A396" }} />
              <div className="mockup-dot" style={{ background: "#FFD54F" }} />
              <div className="mockup-dot" style={{ background: "#F25AA7" }} />
              <span className="mockup-label">Custom Practice Selector</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
              {[
                { label: "☑ Quantitative Aptitude", indent: 0, color: "#1F2A44", bold: true  },
                { label: "☑ Averages",               indent: 1, color: "#00A396", bold: true  },
                { label: "☑ Weighted Average",        indent: 2, color: "#6B7280", bold: false },
                { label: "☑ Average Speed Problems",  indent: 2, color: "#6B7280", bold: false },
                { label: "☑ Ages & Mixtures",         indent: 2, color: "#6B7280", bold: false },
                { label: "☐ 10's Complement",         indent: 1, color: "#9CA3AF", bold: false },
              ].map((row, i) => (
                <div key={i} style={{ paddingLeft: `${row.indent * 1.1}rem`, fontSize: "0.78rem", fontWeight: row.bold ? 700 : 500, color: row.color }}>{row.label}</div>
              ))}
              <div style={{ marginTop: "0.5rem", background: "#00A396", color: "#fff", borderRadius: 8, padding: "0.5rem", textAlign: "center", fontSize: "0.78rem", fontWeight: 700 }}>
                Start Practice Session →
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Reports */}
        <div className="feature-section">
          <div>
            <span className="feat-tag" style={{ background: "rgba(79,203,141,0.14)", color: "#1B5E20" }}>Reports</span>
            <h2 className="feat-title">See your progress, not just your score</h2>
            <p className="feat-desc">
              After every session get a full accuracy breakdown per topic. Track how you improve week over week — and let data pinpoint exactly what to study next, instead of guessing.
            </p>
            <Link href="/report/session-001" className="feat-link">View sample report →</Link>
          </div>
          <div className="feat-mockup" style={{ ["--mt" as string]: "linear-gradient(90deg,#4FCB8D,#00A396)" }}>
            <div className="mockup-bar">
              <div className="mockup-dot" style={{ background: "#4FCB8D" }} />
              <div className="mockup-dot" style={{ background: "#4FCB8D" }} />
              <div className="mockup-dot" style={{ background: "#4FCB8D" }} />
              <span className="mockup-label">Your Progress Report</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
              {[
                { topic: "Averages",          pct: 76, color: "#F25AA7" },
                { topic: "10's Complement",   pct: 85, color: "#4FCB8D" },
                { topic: "Average Speed",     pct: 58, color: "#FFB300" },
              ].map(row => (
                <div key={row.topic}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.76rem", fontWeight: 700, color: "#374151", marginBottom: "0.2rem" }}>
                    <span>{row.topic}</span><span style={{ color: row.color }}>{row.pct}%</span>
                  </div>
                  <div style={{ height: 7, background: "#F1F5F9", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${row.pct}%`, height: "100%", background: row.color, borderRadius: 4 }} />
                  </div>
                </div>
              ))}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.45rem", marginTop: "0.1rem" }}>
                <div style={{ background: "rgba(79,203,141,0.09)", borderRadius: 10, padding: "0.55rem", textAlign: "center" }}>
                  <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#4FCB8D" }}>120</div>
                  <div style={{ fontSize: "0.62rem", color: "#9CA3AF", fontWeight: 600 }}>Questions answered</div>
                </div>
                <div style={{ background: "rgba(242,90,167,0.08)", borderRadius: 10, padding: "0.55rem", textAlign: "center" }}>
                  <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#F25AA7" }}>73%</div>
                  <div style={{ fontSize: "0.62rem", color: "#9CA3AF", fontWeight: 600 }}>Overall accuracy</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Forum */}
        <div className="feature-section reverse">
          <div>
            <span className="feat-tag" style={{ background: "rgba(77,124,255,0.11)", color: "#283593" }}>Discuss</span>
            <h2 className="feat-title">Learn together, grow together</h2>
            <p className="feat-desc">
              Stuck on a problem? Post it. Our peer forum lets every student share doubts, react to explanations, and build understanding through real conversation — not just solo studying.
            </p>
            <Link href="/student/forum" className="feat-link">Join the discussion →</Link>
          </div>
          <div className="feat-mockup" style={{ ["--mt" as string]: "linear-gradient(90deg,#4D7CFF,#7C5BDB)" }}>
            <div className="mockup-bar">
              <div className="mockup-dot" style={{ background: "#4D7CFF" }} />
              <div className="mockup-dot" style={{ background: "#7C5BDB" }} />
              <div className="mockup-dot" style={{ background: "#F25AA7" }} />
              <span className="mockup-label">Community Forum</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
              {[
                { user: "Priya S.", bg: "#F25AA7", msg: "How do I approach weighted average when the group sizes differ?", reactions: ["❤️ 4", "💡 2"] },
                { user: "Rahul M.", bg: "#4D7CFF", msg: "Is the average speed formula always 2ab/(a+b) for equal distances?",  reactions: ["👍 3", "🔥 1"] },
              ].map(post => (
                <div key={post.user} style={{ background: "#F8FAFC", borderRadius: 10, padding: "0.7rem" }}>
                  <div style={{ display: "flex", gap: "0.45rem", alignItems: "center", marginBottom: "0.3rem" }}>
                    <div style={{ width: 21, height: 21, borderRadius: "50%", background: post.bg, color: "#fff", fontSize: "0.58rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{post.user[0]}</div>
                    <span style={{ fontSize: "0.73rem", fontWeight: 700, color: "#374151" }}>{post.user}</span>
                  </div>
                  <p style={{ fontSize: "0.73rem", color: "#4B5563", margin: "0 0 0.35rem", lineHeight: 1.5 }}>{post.msg}</p>
                  <div style={{ display: "flex", gap: "0.35rem" }}>
                    {post.reactions.map(r => (
                      <span key={r} style={{ fontSize: "0.62rem", background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 20, padding: "0.08rem 0.38rem" }}>{r}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* -- WHY THINKPLUS -- */}
        <div className="why-section">
          <span className="feat-tag" style={{ background: "rgba(255,152,0,0.12)", color: "#E65100", fontSize: "0.73rem" }}>Why ThinkPlus?</span>
          <h2 className="feat-title" style={{ marginTop: "0.7rem" }}>Designed for students, not spreadsheets</h2>
          <p style={{ fontSize: "1rem", color: "#4B5563", maxWidth: 540, margin: "0.7rem auto 0", lineHeight: 1.72 }}>
            Every feature exists to make your learning feel effortless and effective.
          </p>
          <div className="why-grid">
            {[
              { icon: "🎯", title: "Truly Adaptive",   desc: "Questions adjust to your level in real time — no fixed difficulty, no wasted questions." },
              { icon: "📊", title: "Clear Insights",   desc: "Track your accuracy per topic and see exactly how you improve week over week." },
              { icon: "💬", title: "Peer Support",     desc: "Post doubts, reply to classmates, and grow your understanding through discussion." },
              { icon: "⚡", title: "Fast Feedback",    desc: "Instant results after every answer — know why you were wrong, not just that you were." },
              { icon: "🗂️", title: "Your Curriculum",  desc: "Drill one subtopic or sweep a full section — you choose exactly what to practise." },
              { icon: "🔒", title: "Safe to Fail",     desc: "Mistakes are learning moments here. Practise without pressure, grow with confidence." },
            ].map(card => (
              <div key={card.title} className="why-card">
                <span className="why-icon">{card.icon}</span>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
