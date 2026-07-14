"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Bell, ChevronDown, Info, Mail, Menu, PanelLeftClose, Phone, X, Megaphone, UserCheck, BookOpen, ShieldAlert, FileText } from "lucide-react";
import { deferEffect } from "@/lib/browserState";

interface TopNavProps {
  userName?: string;
  userAvatar?: string;
  title?: string;
  role?: "student" | "teacher" | "qbm" | "admin";
  sidebarClosed?: boolean;
  onToggleSidebar?: () => void;
}

export default function TopNav({ userName = "Arjun Kumar", userAvatar = "AK", title, role = "student", sidebarClosed = false, onToggleSidebar }: TopNavProps) {
  const profileHref = `/${role}/profile`;
  const [showHelp, setShowHelp] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);

  useEffect(() => {
    return deferEffect(() => {
      const activeRole = role;
      const targetRoleKey = activeRole === "admin" ? "admin" : `${activeRole}s`;

      const saved = localStorage.getItem("admin_notifications");
      let customNotifications: any[] = [];
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          customNotifications = (Array.isArray(parsed) ? parsed : []).filter((n: any) => {
            return n && n.id && n.id !== "1" && n.id !== "2" && n.id !== "3" && !String(n.id).startsWith("n");
          });
        } catch (err) {
          console.error("Failed to parse admin notifications", err);
        }
      }

      const filteredCustom = customNotifications.filter((n: any) => n.targets?.includes(targetRoleKey));

      const formattedCustom = filteredCustom.map((n: any) => ({
        id: `custom-${n.id}`,
        title: n.title,
        message: n.desc,
        time: n.time,
        type: n.type,
        read: false,
        important: n.important
      }));

      setNotificationsList(formattedCustom);
    });
  }, [role, showNotifications]);

  const getNotifIcon = (type: string, important: boolean) => {
    const color = important ? "var(--danger)" : "var(--primary)";
    const bg = important ? "var(--danger-light)" : "var(--primary-light)";
    
    let icon = <Megaphone size={14} color={color} />;
    if (type === "system") icon = <UserCheck size={14} color={color} />;
    else if (type === "assignment") icon = <BookOpen size={14} color={color} />;
    else if (type === "alert" || type === "approval") icon = <ShieldAlert size={14} color={color} />;
    else if (type === "report") icon = <FileText size={14} color={color} />;
    
    return (
      <div style={{
        width: 28, height: 28, borderRadius: 8, background: bg,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
      }}>
        {icon}
      </div>
    );
  };

  const showStreak = role === "student" && title?.toLowerCase().includes("dashboard");
  const [streakCount, setStreakCount] = useState(() => {
    if (typeof window === "undefined") return 0;
    const saved = sessionStorage.getItem("tp_streak");
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    const updateStreak = () => {
      const saved = sessionStorage.getItem("tp_streak");
      setStreakCount(saved ? parseInt(saved, 10) : 0);
    };
    window.addEventListener("storage", updateStreak);
    return () => window.removeEventListener("storage", updateStreak);
  }, []);

  const unreadCount = notificationsList.filter(n => !n.read).length;

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
              gap: "0.35rem",
              minHeight: 36,
              padding: "0.15rem 0.25rem",
              color: "var(--primary)",
              fontWeight: 800,
              fontSize: "0.875rem",
              whiteSpace: "nowrap",
            }}
          >
            <img src="/streak-icon.png" alt="" aria-hidden="true" className="topnav-streak-icon" />
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

        {/* Notification Bell with Popup Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            aria-label="Notifications"
            title="Notifications"
            onClick={() => setShowNotifications(prev => !prev)}
            style={{
              background: showNotifications ? "var(--surface-hover)" : "none",
              border: "none",
              cursor: "pointer",
              width: 38,
              height: 38,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-secondary)",
              transition: "background 0.15s ease",
              position: "relative"
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-hover)")}
            onMouseLeave={e => (e.currentTarget.style.background = showNotifications ? "var(--surface-hover)" : "none")}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{
                position: "absolute",
                top: 6,
                right: 6,
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--primary)",
                border: "2px solid #fff",
              }} />
            )}
          </button>

          {showNotifications && (
            <div
              className="tp-card animate-scale-in"
              style={{
                position: "absolute",
                top: "calc(100% + 0.75rem)",
                right: 0,
                width: 360,
                maxHeight: 480,
                padding: 0,
                zIndex: 85,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                boxShadow: "var(--shadow-lg)"
              }}
            >
              {/* Header */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem 1.2rem",
                borderBottom: "1px solid var(--border)",
                background: "var(--surface)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Bell size={16} color="var(--primary)" />
                  <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text-primary)" }}>
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span style={{
                      fontSize: "0.7rem",
                      fontWeight: 750,
                      background: "var(--primary)",
                      color: "#fff",
                      padding: "0.15rem 0.4rem",
                      borderRadius: 999
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    display: "grid",
                    placeItems: "center",
                    width: 24,
                    height: 24,
                    borderRadius: "50%"
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-hover)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                >
                  <X size={14} />
                </button>
              </div>

              {/* List */}
              <div style={{
                overflowY: "auto",
                flex: 1,
                maxHeight: 360,
                background: "var(--bg)"
              }}>
                {notificationsList.length === 0 ? (
                  <div style={{ padding: "3rem 1.5rem", textAlign: "center", color: "var(--text-secondary)" }}>
                    <Bell size={32} style={{ color: "var(--border)", marginBottom: "0.75rem" }} />
                    <p style={{ fontWeight: 600, fontSize: "0.85rem" }}>No notifications found</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                      You&apos;re all caught up!
                    </p>
                  </div>
                ) : (
                  notificationsList.map((n, i) => (
                    <div
                      key={n.id}
                      style={{
                        display: "flex",
                        gap: "0.75rem",
                        padding: "0.95rem 1.2rem",
                        borderBottom: i === notificationsList.length - 1 ? "none" : "1px solid var(--border)",
                        background: n.important ? "rgba(239, 68, 68, 0.02)" : "transparent",
                        borderLeft: n.important ? "3px solid var(--danger)" : "none",
                        alignItems: "flex-start",
                        transition: "background 0.2s"
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-hover)")}
                      onMouseLeave={e => (e.currentTarget.style.background = n.important ? "rgba(239, 68, 68, 0.02)" : "transparent")}
                    >
                      {getNotifIcon(n.type, n.important)}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.25rem" }}>
                          <h4 style={{
                            fontSize: "0.85rem",
                            fontWeight: 750,
                            color: "var(--text-primary)",
                            margin: 0,
                            lineHeight: 1.25,
                            wordBreak: "break-word"
                          }}>
                            {n.title}
                          </h4>
                        </div>
                        <p style={{
                          fontSize: "0.78rem",
                          color: "var(--text-secondary)",
                          marginTop: "0.2rem",
                          marginBottom: 0,
                          lineHeight: 1.35,
                          wordBreak: "break-word"
                        }}>
                          {n.message}
                        </p>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block", marginTop: "0.35rem" }}>
                          {n.time}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Admin Footer Link */}
              {role === "admin" && (
                <div style={{
                  padding: "0.75rem 1rem",
                  borderTop: "1px solid var(--border)",
                  textAlign: "center",
                  background: "var(--surface)"
                }}>
                  <Link
                    href="/admin/notifications"
                    onClick={() => setShowNotifications(false)}
                    style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--primary)", textDecoration: "none" }}
                  >
                    Manage Notifications →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

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
