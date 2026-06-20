"use client";
import Link from "next/link";
import { useState } from "react";
import { Bell, ChevronDown, Flame, Info, Mail, Menu, PanelLeftClose, Phone, X } from "lucide-react";

interface TopNavProps {
  userName?: string;
  userAvatar?: string;
  title?: string;
  role?: "student" | "teacher" | "qbm" | "admin";
  sidebarClosed?: boolean;
  onToggleSidebar?: () => void;
}

export default function TopNav({ userName = "Arjun Kumar", userAvatar = "AK", title, role = "student", sidebarClosed = false, onToggleSidebar }: TopNavProps) {
  const notificationsHref = role === "admin" ? "/admin/notifications" : "/notifications";
  const profileHref = `/${role}/profile`;
  const [showHelp, setShowHelp] = useState(false);
  const showStreak = title?.toLowerCase().includes("dashboard");
  const streakCount = role === "student" ? 12 : role === "teacher" ? 8 : role === "qbm" ? 6 : 15;
  const isImageAvatar = userAvatar.startsWith("/avatars/");

  return (
    <header className="tp-topnav">
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
        <button
          type="button"
          aria-label={sidebarClosed ? "Open navigation" : "Close navigation"}
          title={sidebarClosed ? "Open navigation" : "Close navigation"}
          onClick={onToggleSidebar}
          className="tp-icon-button"
        >
          {sidebarClosed ? <Menu size={20} /> : <PanelLeftClose size={20} />}
        </button>

        {title ? (
          <h1 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</h1>
        ) : <div />}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {showStreak && (
          <div
            title={`${streakCount} day streak`}
            aria-label={`${streakCount} day streak`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              minHeight: 38,
              padding: "0.35rem 0.7rem 0.35rem 0.45rem",
              borderRadius: 999,
              background: "linear-gradient(135deg, #FFF3D6 0%, #FFE1B8 100%)",
              border: "1px solid rgba(245, 158, 11, 0.35)",
              boxShadow: "0 8px 18px rgba(245, 158, 11, 0.16)",
              color: "#9A3412",
              fontWeight: 800,
              fontSize: "0.875rem",
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(180deg, #FFB000 0%, #FF6B00 55%, #E8194B 100%)",
                boxShadow: "0 5px 12px rgba(255, 107, 0, 0.28)",
              }}
            >
              <Flame size={18} fill="#FFF7A8" stroke="#FFFFFF" strokeWidth={2.4} />
            </span>
            <span>{streakCount}</span>
          </div>
        )}

        <div style={{ position: "relative" }}>
          <button
            type="button"
            aria-label="Open help"
            title="Help"
            onClick={() => setShowHelp((value) => !value)}
            style={{
              background: showHelp ? "var(--surface-hover)" : "none",
              border: "none",
              cursor: "pointer",
              width: 38,
              height: 38,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-secondary)",
              transition: "background 0.15s ease, color 0.15s ease",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-hover)")}
            onMouseLeave={e => (e.currentTarget.style.background = showHelp ? "var(--surface-hover)" : "none")}
          >
            <Info size={20} />
          </button>

          {showHelp && (
            <div
              className="tp-card animate-scale-in"
              style={{
                position: "absolute",
                top: "calc(100% + 0.75rem)",
                right: 0,
                width: 340,
                padding: "1.2rem",
                zIndex: 80,
              }}
            >
              <button
                type="button"
                aria-label="Close help"
                onClick={() => setShowHelp(false)}
                style={{
                  position: "absolute",
                  top: 14,
                  right: 14,
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  border: "1px solid var(--border)",
                  background: "#fff",
                  color: "var(--text-secondary)",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                }}
              >
                <X size={15} />
              </button>

              <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "0.45rem", color: "var(--text-primary)" }}>Need Help?</h3>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.55, marginBottom: "1rem", paddingRight: "1.5rem" }}>
                Reach our support team through any of the channels below.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Mail size={16} color="var(--primary)" />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.125rem" }}>Email Support</div>
                    <a href="mailto:support@thinkplus.com" style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--primary)", textDecoration: "none" }}>
                      support@thinkplus.com
                    </a>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Phone size={16} color="var(--primary)" />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.125rem" }}>Toll-Free Helpline</div>
                    <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)" }}>1800-123-4567</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <Link href={notificationsHref} style={{
          position: "relative", background: "none", border: "none", cursor: "pointer",
          width: 38, height: 38, borderRadius: "50%", display: "flex",
          alignItems: "center", justifyContent: "center",
          color: "var(--text-secondary)", transition: "background 0.15s ease", textDecoration: "none",
        }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-hover)")}
          onMouseLeave={e => (e.currentTarget.style.background = "none")}
          title="Open notifications"
        >
          <Bell size={20} />
          <span style={{
            position: "absolute", top: 6, right: 6,
            width: 8, height: 8, borderRadius: "50%",
            background: "var(--primary)", border: "2px solid #fff",
          }} />
        </Link>

        {/* User Avatar */}
        <Link href={profileHref} style={{
          display: "flex", alignItems: "center", gap: "0.5rem",
          background: "none", border: "none", cursor: "pointer", padding: "0.25rem 0.5rem",
          borderRadius: 8, transition: "background 0.15s ease", textDecoration: "none",
        }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-hover)")}
          onMouseLeave={e => (e.currentTarget.style.background = "none")}
          title="Open profile"
        >
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "var(--primary-light)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.75rem", fontWeight: 800, color: "var(--primary)",
            border: "1px solid var(--border-purple)",
            overflow: "hidden",
          }}>
            {isImageAvatar ? (
              <img src={userAvatar} alt={`${userName} avatar`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              userAvatar
            )}
          </div>
          <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)" }}>
            {userName}
          </span>
          <ChevronDown size={14} color="var(--text-muted)" />
        </Link>
      </div>
    </header>
  );
}
