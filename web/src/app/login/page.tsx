"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import PublicHeader from "@/components/layout/PublicHeader";
import { Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams ? searchParams.get("next") : null;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post<{
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
      }>("/api/v1/auth/login", { email, password });

      const role = response.roles[0]?.toLowerCase() || "student";
      const userSession = {
        id: response.user.id,
        name: response.user.full_name,
        email: response.user.email,
        role,
        avatar: response.user.avatar_id || "AK",
        institution: response.user.institution_name,
      };

      sessionStorage.setItem("tp_token", response.access_token);
      sessionStorage.setItem("tp_user", JSON.stringify(userSession));
      sessionStorage.setItem("tp_logged_in", role);

      if (role === "student") {
        router.push(nextParam === "assessment" ? "/assessment/start" : "/student/dashboard");
      } else if (role === "teacher") {
        router.push("/teacher/dashboard");
      } else if (role === "qbm" || role === "content_manager") {
        router.push("/qbm/dashboard");
      } else if (role === "admin") {
        router.push("/admin/dashboard");
      } else {
        setError("Unrecognized user role. Contact system administrator.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
      setLoading(false);
    }
  };

  return (
    <>
    <PublicHeader />
    <main style={{ minHeight: "calc(100vh - 76px)", display: "grid", placeItems: "center", padding: "2rem", fontFamily: "\"Aeonik\", \"Inter\", \"Segoe UI\", sans-serif", position: "relative", overflow: "hidden" }}>

      <div style={{
        width: "100%",
        maxWidth: 480,
        margin: "0 auto",
        position: "relative",
        zIndex: 1
      }}>
        <section className="tp-card animate-fade-in-up" style={{ padding: "2.5rem", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 500 }}>
          <div style={{ marginBottom: "1.8rem" }}>
            <h2 style={{ fontSize: "1.7rem", fontWeight: 900, color: "var(--text-primary)", marginBottom: "0.4rem" }}>
              Account Sign In
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Enter your school account details to continue.
            </p>
          </div>

          {error && (
            <div style={{ background: "var(--danger-light)", color: "#D94B4B", border: "1px solid rgba(255,143,143,0.35)", padding: "0.75rem 1rem", borderRadius: 14, fontSize: "0.8125rem", fontWeight: 600, marginBottom: "1.25rem", lineHeight: 1.4 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <label style={{ display: "grid", gap: "0.35rem" }}>
              <span style={{ fontSize: "0.8125rem", fontWeight: 800, color: "var(--text-secondary)" }}>Email</span>
              <input
                id="email"
                className="tp-input"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </label>

            <label style={{ display: "grid", gap: "0.35rem" }}>
              <span style={{ fontSize: "0.8125rem", fontWeight: 800, color: "var(--text-secondary)" }}>Password</span>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  className="tp-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: "2.8rem" }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--primary)",
                  display: "grid",
                  placeItems: "center",
                }}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
              <input
                type="checkbox"
                id="remember-me"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                style={{ accentColor: "var(--primary)", width: 15, height: 15, cursor: "pointer" }}
              />
              Remember Me
            </label>

            <a href="#" style={{ fontSize: "0.78rem", color: "var(--text-muted)", textDecoration: "none", textAlign: "center", display: "block" }}>
              Forgot your password/username
            </a>

            <button id="login-submit" type="submit" className="tp-btn-primary" style={{ justifyContent: "center", padding: "0.85rem", fontSize: "0.95rem", opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>

            <Link href="/register" className="tp-btn-secondary" style={{ justifyContent: "center", textDecoration: "none", padding: "0.85rem", fontSize: "0.95rem" }}>
              Create an account
            </Link>
          </form>
        </section>
      </div>
    </main>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "'Aeonik', 'Inter', sans-serif" }}>
        <div style={{ color: "var(--primary)", fontWeight: 700 }}>Loading Account Portal...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
