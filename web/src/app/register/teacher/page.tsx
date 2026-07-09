"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PublicHeader from "@/components/layout/PublicHeader";
import { Mail, Lock, User, ArrowRight, School, Eye, EyeOff, Phone } from "lucide-react";
import { api } from "@/lib/api";

export default function TeacherRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [institution, setInstitution] = useState("");
  const [specialization, setSpecialization] = useState("Mathematics");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const lowerEmail = email.toLowerCase().trim();

    try {
      // 1. Sign up on backend
      await api.post("/api/v1/auth/signup/teacher", {
        full_name: name,
        email: lowerEmail,
        password: password,
        phone_number: mobile,
        institution_name: institution.trim() || null,
        department: specialization,
        designation: "Educator",
      });

      // 2. Auto-login
      const loginResponse = await api.post<{
        access_token: string;
        token_type: string;
        user: {
          id: string;
          email: string;
          full_name: string;
          institution_name: string;
          avatar_id?: string;
        };
        roles: string[];
      }>("/api/v1/auth/login", { email: lowerEmail, password });

      const role = loginResponse.roles[0]?.toLowerCase() || "teacher";
      const userSession = {
        id: loginResponse.user.id,
        name: loginResponse.user.full_name,
        email: loginResponse.user.email,
        role,
        avatar: loginResponse.user.avatar_id || name.split(" ").map((n: string) => n[0]).join("").toUpperCase() || "TH",
        institution: loginResponse.user.institution_name,
      };

      sessionStorage.setItem("tp_token", loginResponse.access_token);
      sessionStorage.setItem("tp_user", JSON.stringify(userSession));
      sessionStorage.setItem("tp_logged_in", role);

      router.push("/teacher/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please check details and try again.");
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setGoogleLoading(false);
    
    // Set a mock teacher session from Google
    const userSession = {
      name: "Amit Verma",
      email: "amit@example.com",
      role: "teacher",
      avatar: "AV",
      institution: "Delhi Public School"
    };
    sessionStorage.setItem("tp_user", JSON.stringify(userSession));
    sessionStorage.setItem("tp_logged_in", "teacher");
    
    router.push("/teacher/dashboard");
  };

  const inputStyle = { paddingLeft: "2.75rem", borderRadius: "10px" };

  return (
    <>
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--surface)",
      fontFamily: "Inter, sans-serif",
      padding: "2rem 1.5rem",
    }}>
      {/* Card */}
      <div style={{
        maxWidth: 480,
        width: "100%",
        background: "#ffffff",
        borderRadius: 20,
        border: "1px solid var(--border)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        padding: "2.5rem 2.5rem 2rem",
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none", marginBottom: "2rem" }}>
          <img src="/logo.png" alt="thinkplus" style={{ height: "42px", width: "auto" }} />
        </Link>

        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.375rem", color: "#111827" }}>
          Register as Teacher
        </h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.875rem", lineHeight: 1.6 }}>
          Create your educator profile to manage assessments and track student gaps.
        </p>

        {/* Error */}
        {error && (
          <div style={{ background: "var(--danger-light)", color: "var(--danger)", padding: "0.75rem 1rem", borderRadius: "10px", fontSize: "0.8125rem", fontWeight: 500, marginBottom: "1.25rem", lineHeight: 1.4 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Full Name */}
          <div>
            <label style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#374151", display: "block", marginBottom: "0.375rem" }}>Full Name</label>
            <div style={{ position: "relative" }}>
              <User size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input id="teacher-name" type="text" className="tp-input" style={inputStyle}
                placeholder="Enter your full name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
          </div>

          {/* Email + Mobile — two columns */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <label style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#374151", display: "block", marginBottom: "0.375rem" }}>Educator Email</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input id="teacher-email" type="email" className="tp-input" style={inputStyle}
                  placeholder="you@school.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
            <div>
              <label style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#374151", display: "block", marginBottom: "0.375rem" }}>Mobile Number</label>
              <div style={{ position: "relative" }}>
                <Phone size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input id="teacher-mobile" type="tel" className="tp-input" style={inputStyle}
                  placeholder="+91 98765 43210" value={mobile} onChange={e => setMobile(e.target.value)} required />
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#374151", display: "block", marginBottom: "0.375rem" }}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input id="teacher-password" type={showPassword ? "text" : "password"} className="tp-input"
                style={{ ...inputStyle, paddingRight: "2.75rem" }}
                placeholder="Create a strong password" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0,
              }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* School + Subject — two columns */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <label style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#374151", display: "block", marginBottom: "0.375rem" }}>Institution Name</label>
              <div style={{ position: "relative" }}>
                <School size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input id="teacher-institution" type="text" className="tp-input" style={inputStyle}
                  placeholder="Delhi Public School" value={institution} onChange={e => setInstitution(e.target.value)} required />
              </div>
            </div>
            <div>
              <label style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#374151", display: "block", marginBottom: "0.375rem" }}>Subject Focus</label>
              <select id="teacher-specialization" className="tp-select" value={specialization}
                onChange={e => setSpecialization(e.target.value)} style={{ borderRadius: "10px" }}>
                <option value="Mathematics">Mathematics (6–10)</option>
                <option value="Aptitude">General Aptitude</option>
                <option value="Science">Physical Sciences</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <button id="teacher-register-submit" type="submit" className="tp-btn-primary"
            style={{ justifyContent: "center", padding: "0.85rem", fontSize: "1rem", borderRadius: "12px", fontWeight: 700, background: "#A089E6", border: "none", width: "100%", cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.25rem" }}
            disabled={loading}>
            {loading ? "Creating account..." : (<>Register Educator <ArrowRight size={17} /></>)}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", margin: "1.25rem 0", color: "var(--text-secondary)", fontSize: "0.8125rem" }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span style={{ padding: "0 0.75rem", fontWeight: 600 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        {/* Google */}
        <button 
          onClick={handleGoogleAuth}
          disabled={googleLoading}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0.8rem", background: "#ffffff", border: "1px solid var(--border)",
            borderRadius: "10px", cursor: googleLoading ? "not-allowed" : "pointer", fontWeight: 600, fontSize: "0.9375rem", color: "#1F2937",
            transition: "background 0.2s",
            opacity: googleLoading ? 0.7 : 1
          }}
          onMouseEnter={e => { if (!googleLoading) e.currentTarget.style.background = "#F9FAFB"; }}
          onMouseLeave={e => { if (!googleLoading) e.currentTarget.style.background = "#ffffff"; }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginRight: "0.5rem" }}>
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.707A5.386 5.386 0 0 1 3.68 9c0-.59.1-1.161.284-1.707V4.961H.957A8.997 8.997 0 0 0 0 9c0 1.41.325 2.748.895 3.939l3.069-2.232z" fill="#FBBC05"/>
            <path d="M9 3.58c1.32 0 2.507.454 3.44 1.354l2.58-2.58C13.46 1.077 11.424 0 9 0 5.48 0 2.44 2.024.957 4.961l3.007 2.332C4.672 5.164 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          {googleLoading ? "Signing in..." : "Continue with Google"}
        </button>

        {/* Footer links */}
        <p style={{ marginTop: "1.25rem", fontSize: "0.8125rem", color: "var(--text-secondary)", textAlign: "center" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#A089E6", fontWeight: 700, textDecoration: "none" }}>Sign in</Link>
        </p>
        <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)", textAlign: "center" }}>
          <Link href="/register" style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", textDecoration: "none", fontWeight: 500 }}>
            ← Back to student registration
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}
