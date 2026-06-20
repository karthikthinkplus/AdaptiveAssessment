"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { NOTIFICATIONS as initialNotifications, type Notification } from "@/lib/mockData";
import { Bell } from "lucide-react";

interface RoleConfig {
  role: "student" | "teacher" | "qbm";
  userName: string;
  userAvatar: string;
}

type AdminNotification = {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: UserNotification["type"];
  important: boolean;
  targets?: string[];
};

type UserNotification = Omit<Notification, "type"> & {
  type: Notification["type"] | "announcement" | "alert";
};

type TargetedNotification = UserNotification & {
  targets?: string[];
};

const ROLE_CONFIGS: Record<string, RoleConfig> = {
  student: { role: "student", userName: "Arjun Kumar", userAvatar: "AK" },
  teacher: { role: "teacher", userName: "Amit Verma", userAvatar: "AV" },
  qbm: { role: "qbm", userName: "Ravi Kumar", userAvatar: "RK" }
};

const getInitialNotificationState = () => {
  const activeRole = typeof window === "undefined"
    ? "student"
    : localStorage.getItem("current_role") || "student";
  const roleConfig = ROLE_CONFIGS[activeRole] || ROLE_CONFIGS.student;

  const saved = typeof window === "undefined" ? null : localStorage.getItem("admin_notifications");
  let customNotifications: AdminNotification[] = [];
  if (saved) {
    try {
      customNotifications = JSON.parse(saved) as AdminNotification[];
    } catch (err) {
      console.error("Failed to parse admin notifications", err);
    }
  }

  const targetRoleKey = activeRole === "admin" ? "admin" : `${activeRole}s`;
  const filteredCustom = customNotifications.filter(n => n.targets?.includes(targetRoleKey));
  const mockWithTargets: TargetedNotification[] = initialNotifications.map(n => {
    let targets: string[] = ["students", "teachers", "qbms", "admin"];
    if (n.id === "n1" || n.id === "n2") targets = ["students"];
    if (n.id === "n3") targets = ["teachers", "qbms"];
    if (n.id === "n5") targets = ["teachers"];
    return { ...n, targets };
  });

  const filteredMock = mockWithTargets.filter(n => n.targets?.includes(targetRoleKey));
  const formattedCustom: UserNotification[] = filteredCustom.map(n => ({
    id: `custom-${n.id}`,
    title: n.title,
    message: n.desc,
    time: n.time,
    type: n.type,
    read: false,
    important: n.important
  }));

  return {
    roleConfig,
    notifications: [...formattedCustom, ...filteredMock]
  };
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [roleConfig, setRoleConfig] = useState<RoleConfig>(ROLE_CONFIGS.student);

  useEffect(() => {
    const state = getInitialNotificationState();
    setNotifications(state.notifications);
    setRoleConfig(state.roleConfig);
  }, []);

  return (
    <AppShell 
      role={roleConfig.role} 
      userName={roleConfig.userName} 
      userAvatar={roleConfig.userAvatar} 
      title="Notifications"
    >
      <div className="animate-fade-in-up" style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* List */}
        <div className="tp-card" style={{ padding: 0 }}>
          {notifications.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
              <Bell size={40} style={{ color: "var(--border)", marginBottom: "1rem" }} />
              <p style={{ fontWeight: 600 }}>No notifications found</p>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                You&apos;re all caught up!
              </p>
            </div>
          ) : (
            notifications.map((n, i) => (
              <div
                key={n.id}
                style={{
                  display: "flex",
                  padding: "1.25rem",
                  borderBottom: i === notifications.length - 1 ? "none" : "1px solid var(--border)",
                  background: "transparent",
                  alignItems: "flex-start",
                  transition: "background 0.2s"
                }}
              >
                {/* Details */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      {n.title}
                    </h4>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem", lineHeight: 1.4 }}>
                    {n.message}
                  </p>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginTop: "0.5rem" }}>
                    {n.time}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
