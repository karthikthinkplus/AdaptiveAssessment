"use client";
import AppShell from "@/components/layout/AppShell";
import { Bell, ShieldAlert, BookOpen, UserCheck, Plus, Megaphone, Send, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: "system" | "announcement" | "assignment" | "alert";
  important: boolean;
  targets: string[];
}

type NotificationType = NotificationItem["type"];

const TARGET_LABELS: Record<string, string> = {
  students: "Students",
  teachers: "Teachers",
  qbms: "QBMs",
  admin: "Admins"
};

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [];

const getInitialNotifications = () => {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATIONS;
  const saved = localStorage.getItem("admin_notifications");
  if (!saved) return DEFAULT_NOTIFICATIONS;

  try {
    const parsed = JSON.parse(saved) as NotificationItem[];
    return (Array.isArray(parsed) ? parsed : []).filter(n => {
      return n && n.id && n.id !== "1" && n.id !== "2" && n.id !== "3" && !String(n.id).startsWith("n");
    });
  } catch (err) {
    console.error("Failed to parse admin notifications", err);
    return DEFAULT_NOTIFICATIONS;
  }
};

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(getInitialNotifications);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [type, setType] = useState<"system" | "announcement" | "assignment" | "alert">("announcement");
  const [important, setImportant] = useState(false);
  const [selectedTargets, setSelectedTargets] = useState<string[]>(["students", "teachers", "qbms", "admin"]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredTarget, setHoveredTarget] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_notifications", JSON.stringify(notifications));
    }
  }, [notifications]);

  const getNotificationIcon = (itemType: string) => {
    switch (itemType) {
      case "system":
        return <UserCheck size={16} />;
      case "assignment":
        return <BookOpen size={16} />;
      case "alert":
        return <ShieldAlert size={16} />;
      default:
        return <Megaphone size={16} />;
    }
  };

  const handleTargetToggle = (targetId: string) => {
    if (selectedTargets.includes(targetId)) {
      setSelectedTargets(prev => prev.filter(t => t !== targetId));
    } else {
      setSelectedTargets(prev => [...prev, targetId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedTargets.length === 4) {
      setSelectedTargets([]);
    } else {
      setSelectedTargets(["students", "teachers", "qbms", "admin"]);
    }
  };

  const handleRelease = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTargets.length === 0) {
      alert("Please select at least one target group.");
      return;
    }
    const newNotification: NotificationItem = {
      id: `${Date.now()}`,
      title,
      desc,
      time: "Just now",
      type,
      important,
      targets: selectedTargets
    };
    const updated = [newNotification, ...notifications];
    setNotifications(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_notifications", JSON.stringify(updated));
    }
    setIsModalOpen(false);
    // Clear inputs
    setTitle("");
    setDesc("");
    setType("announcement");
    setImportant(false);
    setSelectedTargets(["students", "teachers", "qbms", "admin"]);
    setDropdownOpen(false);
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_notifications", JSON.stringify(updated));
    }
  };

  return (
    <AppShell role="admin" userName="Ravi Kumar" userAvatar="RK" title="Platform Alerts & Notifications">
      <div className="animate-fade-in-up" style={{ maxWidth: "700px", margin: "0 auto" }}>
        {/* ── Actions Row ────────────────────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="tp-btn-primary" 
            style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
          >
            <Plus size={16} /> Release Notification
          </button>
        </div>

        {/* ── Notifications List ───────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {notifications.map(n => (
            <div 
              key={n.id} 
              className="tp-card animate-fade-in-up" 
              style={{ 
                display: "flex", 
                gap: "1rem", 
                alignItems: "flex-start",
                borderLeft: n.important ? "4px solid var(--danger)" : "1px solid var(--border)"
              }}
            >
              <div 
                style={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: 8, 
                  background: n.important ? "var(--danger-light)" : "var(--primary-light)", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  color: n.important ? "var(--danger)" : "var(--primary)" 
                }}
              >
                {getNotificationIcon(n.type)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>{n.title}</div>
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.72rem", marginTop: "0.2rem", textTransform: "capitalize" }}>
                  {n.type}
                </div>
                <div style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", marginTop: "0.25rem", lineHeight: 1.4 }}>{n.desc}</div>
                
                <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginTop: "0.5rem", alignItems: "center" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 500 }}>Recipients:</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {n.targets && n.targets.length > 0 ? n.targets.map(t => TARGET_LABELS[t] || t).join(", ") : "None"}
                  </span>
                </div>

                <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "0.5rem" }}>{n.time}</div>
              </div>
              <button
                onClick={() => deleteNotification(n.id)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "0.25rem", color: "var(--text-muted)", alignSelf: "center" }}
                title="Delete"
              >
                <Trash2 size={16} style={{ color: "var(--danger)" }} />
              </button>
            </div>
          ))}
          {notifications.length === 0 && (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
              No active notifications released on the platform.
            </div>
          )}
        </div>
      </div>

      {/* ── Release Notification Modal ─────────────────────────────── */}
      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div className="animate-scale-in" style={{ width: "100%", maxWidth: "450px", background: "#fff", borderRadius: "12px", border: "1px solid var(--border)", padding: "1.5rem", boxShadow: "var(--shadow-lg)" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Bell size={18} color="var(--primary)" /> Release New Broadcast
            </h2>
            <form onSubmit={handleRelease} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.8125rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Title / Subject</label>
                <input 
                  type="text" 
                  className="tp-input" 
                  placeholder="e.g. Scheduled Platform Upgrade" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  required 
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8125rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Broadcast Message</label>
                <textarea 
                  className="tp-input" 
                  style={{ minHeight: "80px", resize: "vertical" }} 
                  placeholder="Provide details of the announcement or system trigger..." 
                  value={desc} 
                  onChange={e => setDesc(e.target.value)} 
                  required 
                />
              </div>

              {/* Target Audience Dropdown */}
              <div>
                <label style={{ fontSize: "0.8125rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>
                  Target Audience
                </label>
                <div style={{ position: "relative" }}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="tp-input"
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      textAlign: "left",
                      background: "#fff",
                      cursor: "pointer",
                      padding: "0.75rem 0.85rem",
                      fontSize: "0.875rem",
                      gap: "0.5rem",
                    }}
                  >
                    <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", flex: 1, paddingRight: "0.5rem" }}>
                      {selectedTargets.length === 0
                        ? "Select Target Audience"
                        : selectedTargets.length === 4
                          ? "All Users"
                          : selectedTargets.map(t => TARGET_LABELS[t] || t).join(", ")}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      {dropdownOpen ? "▲" : "▼"}
                    </span>
                  </button>

                  {dropdownOpen && (
                    <>
                      <div 
                        onClick={() => setDropdownOpen(false)} 
                        style={{ position: "fixed", inset: 0, zIndex: 999 }}
                      />
                      <div
                        className="tp-dropdown-panel"
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          zIndex: 1000,
                          marginTop: "4px",
                          padding: "0.25rem 0",
                        }}
                      >
                        <div
                          onClick={toggleSelectAll}
                          onMouseEnter={() => setHoveredTarget("select-all")}
                          onMouseLeave={() => setHoveredTarget(null)}
                          className="tp-dropdown-item"
                          style={{
                            fontWeight: 600,
                            color: "var(--primary)",
                            background: hoveredTarget === "select-all" ? "var(--surface-hover)" : "transparent",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedTargets.length === 4}
                            readOnly
                            style={{ accentColor: "var(--primary)", pointerEvents: "none" }}
                          />
                          {selectedTargets.length === 4 ? "Deselect All" : "Select All"}
                        </div>
                        
                        <div style={{ borderTop: "1px solid var(--border)", margin: "0.25rem 0" }} />
                        
                        {[
                          { id: "students", label: "Students" },
                          { id: "teachers", label: "Teachers" },
                          { id: "qbms", label: "QBMs" },
                          { id: "admin", label: "Admins" }
                        ].map(grp => {
                          const isHovered = hoveredTarget === grp.id;
                          return (
                            <label
                              key={grp.id}
                              onMouseEnter={() => setHoveredTarget(grp.id)}
                              onMouseLeave={() => setHoveredTarget(null)}
                              className="tp-dropdown-item"
                              style={{
                                background: isHovered ? "var(--surface-hover)" : "transparent",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={selectedTargets.includes(grp.id)}
                                onChange={() => handleTargetToggle(grp.id)}
                                style={{ accentColor: "var(--primary)" }}
                              />
                              {grp.label}
                            </label>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: "0.8125rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Broadcast Category</label>
                  <select 
                    className="tp-select" 
                    value={type} 
                    onChange={e => setType(e.target.value as NotificationType)}
                  >
                    <option value="announcement">Announcement (General)</option>
                    <option value="system">System Notification</option>
                    <option value="assignment">Assignment Alert</option>
                    <option value="alert">Security / Action Alert</option>
                  </select>
                </div>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                <input 
                  type="checkbox" 
                  checked={important} 
                  onChange={e => setImportant(e.target.checked)} 
                  style={{ accentColor: "var(--primary)", width: 15, height: 15 }} 
                />
                Mark as High Priority / Urgent
              </label>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="tp-btn-secondary" 
                  style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="tp-btn-primary" 
                  style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
                >
                  <Send size={14} /> Release
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
