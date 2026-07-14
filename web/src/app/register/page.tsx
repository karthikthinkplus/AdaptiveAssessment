"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [institution, setInstitution] = useState("");
  const [grade, setGrade] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const lowerEmail = email.toLowerCase().trim();

    try {
      // 1. Signup student on backend
      await api.post("/api/v1/auth/signup/student", {
        full_name: name,
        email: lowerEmail,
        password: password,
        phone_number: mobile,
        grade: `Grade ${grade}`,
        institution_name: institution.trim() || null,
      });

      // 2. Perform auto-login
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

      const role = loginResponse.roles[0]?.toLowerCase() || "student";
      const userSession = {
        id: loginResponse.user.id,
        name: loginResponse.user.full_name,
        email: loginResponse.user.email,
        role,
        avatar: loginResponse.user.avatar_id || "AK",
        institution: loginResponse.user.institution_name,
      };

      sessionStorage.setItem("tp_token", loginResponse.access_token);
      sessionStorage.setItem("tp_user", JSON.stringify(userSession));
      sessionStorage.setItem("tp_logged_in", role);

      router.push("/avatar-setup");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please check details and try again.");
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "none",
    borderBottom: "1.5px solid var(--border)",
    padding: "0.5rem 0",
    fontSize: "0.9375rem",
    color: "var(--text-primary)",
    backgroundColor: "transparent",
    outline: "none",
    transition: "border-bottom-color 0.2s"
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.8125rem",
    fontWeight: 700,
    color: "var(--text-secondary)",
    display: "block",
    marginBottom: "0.25rem"
  };

  return (
    <>
    <div style={{
      minHeight: "100vh",
      background: "transparent",
      fontFamily: "'Aeonik', 'Inter', 'Segoe UI', sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      padding: "2rem"
    }}>
      {/* Decorative orbs */}
      <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(160,137,230,0.15) 0%, transparent 70%)", pointerEvents: "none", zIndex: 1 }} />
      <div style={{ position: "absolute", bottom: -60, left: -60, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(39,26,88,0.8) 0%, transparent 70%)", pointerEvents: "none", zIndex: 1 }} />

      {/* -- Central Register Card -- */}
      <div className="animate-fade-in-up" style={{
        width: "100%",
        maxWidth: "500px",
        backgroundColor: "rgba(255, 255, 255, 0.94)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid var(--border)",
        borderRadius: "24px",
        boxShadow: "var(--shadow-lg)",
        padding: "2rem 2.5rem",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--primary)", letterSpacing: "-0.02em", marginBottom: "0.5rem", textAlign: "center", lineHeight: 1.25 }}>
          Adaptive Learning and Assessment Tool
        </h2>
        <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "2rem", textAlign: "center" }}>
          Student Sign Up
        </h3>

        <div style={{ width: "100%" }}>
          {error && (
            <div style={{ background: "rgba(248,113,113,0.12)", color: "#F87171", border: "1px solid rgba(248,113,113,0.25)", padding: "0.75rem 1rem", borderRadius: "12px", fontSize: "0.8125rem", fontWeight: 500, marginBottom: "1.25rem", lineHeight: 1.4 }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            {/* Full Name */}
            <div style={{ width: "100%", marginBottom: "1.25rem" }}>
              <label style={labelStyle}>
                Full Name
              </label>
              <input
                id="register-name"
                type="text"
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderBottomColor = "var(--primary)")}
                onBlur={e => (e.currentTarget.style.borderBottomColor = "var(--border)")}
                placeholder="Enter your full name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div style={{ width: "100%", marginBottom: "1.25rem" }}>
              <label style={labelStyle}>
                Email
              </label>
              <input
                id="register-email"
                type="email"
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderBottomColor = "var(--primary)")}
                onBlur={e => (e.currentTarget.style.borderBottomColor = "var(--border)")}
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Mobile Number */}
            <div style={{ width: "100%", marginBottom: "1.25rem" }}>
              <label style={labelStyle}>
                Mobile Number
              </label>
              <input
                id="register-mobile"
                type="tel"
                pattern="[0-9]{10}"
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderBottomColor = "var(--primary)")}
                onBlur={e => (e.currentTarget.style.borderBottomColor = "var(--border)")}
                placeholder="Enter your 10-digit mobile number"
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                required
              />
            </div>

            {/* Institution Name */}
            <div style={{ width: "100%", marginBottom: "1.25rem" }}>
              <label style={labelStyle}>
                Institution Name
              </label>
              <input
                id="register-institution"
                type="text"
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderBottomColor = "var(--primary)")}
                onBlur={e => (e.currentTarget.style.borderBottomColor = "var(--border)")}
                placeholder="Enter your school/institution name"
                value={institution}
                onChange={e => setInstitution(e.target.value)}
                required
              />
            </div>

            {/* Grade */}
            <div style={{ width: "100%", marginBottom: "1.25rem" }}>
              <label style={labelStyle}>
                Grade
              </label>
              <select
                id="register-grade"
                className="tp-select"
                value={grade}
                onChange={e => setGrade(e.target.value)}
                required
              >
                <option value="" disabled>Select your grade</option>
                <option value="6">Grade 6</option>
                <option value="7">Grade 7</option>
                <option value="8">Grade 8</option>
                <option value="9">Grade 9</option>
                <option value="10">Grade 10</option>
              </select>
            </div>

            {/* Password */}
            <div style={{ width: "100%", marginBottom: "2rem" }}>
              <label style={{ ...labelStyle, color: "var(--primary)" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  style={{ ...inputStyle, paddingRight: "2.25rem" }}
                  onFocus={e => (e.currentTarget.style.borderBottomColor = "var(--primary)")}
                  onBlur={e => (e.currentTarget.style.borderBottomColor = "var(--border)")}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "var(--primary)",
                }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Sign Up Button */}
            <button
              id="register-submit"
              type="submit"
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #F25AA7 0%, #FF7BC0 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: "12px",
                padding: "0.8rem",
                fontSize: "0.9375rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.2s, transform 0.12s",
                marginBottom: "1rem",
                opacity: loading ? 0.7 : 1
              }}
              disabled={loading}
              onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg, #E63F95 0%, #F25AA7 100%)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg, #F25AA7 0%, #FF7BC0 100%)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>

            {/* Sign In Button */}
            <Link
              href="/login"
              style={{
                width: "100%",
                backgroundColor: "#FFF6CB",
                color: "var(--text-primary)",
                borderRadius: "12px",
                padding: "0.8rem",
                fontSize: "0.9375rem",
                fontWeight: 600,
                textAlign: "center",
                textDecoration: "none",
                display: "block",
                transition: "background-color 0.2s, transform 0.12s"
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#FFE06A"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#FFF6CB"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
            >
              Sign In
            </Link>
          </form>
        </div>
      </div>
    </div>
    </>
  );
}
