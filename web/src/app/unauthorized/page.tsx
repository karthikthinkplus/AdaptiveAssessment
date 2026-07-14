"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldX, ArrowLeft, LogOut } from "lucide-react";
import { readSessionUser } from "@/lib/browserState";

const ROLE_DASHBOARD: Record<string, string> = {
  student: "/student/dashboard",
  teacher: "/teacher/dashboard",
  admin: "/admin/dashboard",
  qbm: "/qbm/dashboard",
  content_manager: "/qbm/dashboard",
};

const ROLE_LABEL: Record<string, string> = {
  student: "Student",
  teacher: "Teacher",
  admin: "Administrator",
  qbm: "Content Manager",
  content_manager: "Content Manager",
};

export default function UnauthorizedPage() {
  const [user] = useState(() => readSessionUser({ name: "", avatar: "", role: "" }));
  const role = user.role;
  const userName = user.name;

  const dashboardHref = ROLE_DASHBOARD[role] || "/login";
  const roleLabel = ROLE_LABEL[role] || "User";

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem("current_role");
    window.location.href = "/login";
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        padding: "2rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          textAlign: "center",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: "50%",
            background: "rgba(255,143,143,0.14)",
            border: "2px solid rgba(255,143,143,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.75rem",
          }}
        >
          <ShieldX size={40} color="#FF8F8F" />
        </div>

        {/* Heading */}
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 900,
            color: "#1F2A44",
            marginBottom: "0.5rem",
            letterSpacing: "-0.025em",
          }}
        >
          Access Denied
        </h1>

        {/* Subtext */}
        <p
          style={{
            fontSize: "0.9rem",
            color: "#6B7280",
            lineHeight: 1.65,
            marginBottom: "0.5rem",
          }}
        >
          You don&apos;t have permission to view this page.
        </p>

        {role && (
          <p
            style={{
              fontSize: "0.82rem",
              color: "#9CA3AF",
              marginBottom: "2rem",
            }}
          >
            You are signed in as{" "}
            <strong style={{ color: "#F25AA7" }}>
              {userName ? `${userName} (${roleLabel})` : roleLabel}
            </strong>
            .
          </p>
        )}

        {/* Action buttons */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          {role ? (
            <Link
              href={dashboardHref}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                background: "#F25AA7",
                color: "#fff",
                borderRadius: 999,
                padding: "0.85rem 2rem",
                fontWeight: 700,
                fontSize: "0.9rem",
                textDecoration: "none",
                boxShadow: "0 6px 20px rgba(242,90,167,0.32)",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
            >
              <ArrowLeft size={16} />
              Go to My Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                background: "#F25AA7",
                color: "#fff",
                borderRadius: 999,
                padding: "0.85rem 2rem",
                fontWeight: 700,
                fontSize: "0.9rem",
                textDecoration: "none",
                boxShadow: "0 6px 20px rgba(242,90,167,0.32)",
              }}
            >
              Sign In
            </Link>
          )}

          <button
            onClick={handleLogout}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              background: "rgba(255,143,143,0.1)",
              color: "#FF8F8F",
              border: "1.5px solid rgba(255,143,143,0.3)",
              borderRadius: 999,
              padding: "0.85rem 2rem",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
          >
            <LogOut size={16} />
            Sign Out &amp; Switch Account
          </button>
        </div>
      </div>
    </main>
  );
}
