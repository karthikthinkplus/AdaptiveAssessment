"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

type Role = "student" | "teacher" | "qbm" | "admin";

interface AppShellProps {
  children: React.ReactNode;
  role?: Role;
  userName?: string;
  userAvatar?: string;
  title?: string;
}

const normalizeRole = (role: string): Role => {
  const r = role?.toLowerCase();
  if (r === "content_manager" || r === "qbm") return "qbm";
  if (r === "teacher") return "teacher";
  if (r === "admin") return "admin";
  return "student";
};

export default function AppShell({ children, role: propRole = "student", userName: propName, userAvatar: propAvatar, title }: AppShellProps) {
  const [sessionUser, setSessionUser] = useState<{ name: string; avatar: string; role: Role } | null>(null);

  useEffect(() => {
    const updateSessionUser = () => {
      if (typeof window !== "undefined") {
        const session = sessionStorage.getItem("tp_user");
        if (session) {
          try {
            const parsed = JSON.parse(session);
            setSessionUser({
              name: parsed.name,
              avatar: parsed.avatar,
              role: normalizeRole(parsed.role)
            });
            return;
          } catch (err) {
            console.error("Failed to parse tp_user", err);
          }
        }

        const storedRole = localStorage.getItem("current_role");
        if (storedRole) {
          setSessionUser({
            name: propName || "User",
            avatar: propAvatar || "U",
            role: normalizeRole(storedRole)
          });
        }
      }
    };

    updateSessionUser();
    window.addEventListener("storage", updateSessionUser);
    return () => window.removeEventListener("storage", updateSessionUser);
  }, [propName, propAvatar]);
  const [sidebarClosed, setSidebarClosed] = useState(false);
  const pathname = usePathname();

  // Determine role based on URL path context first
  let pathRole: Role | undefined = undefined;
  if (pathname) {
    if (pathname.startsWith("/admin")) pathRole = "admin";
    else if (pathname.startsWith("/teacher")) pathRole = "teacher";
    else if (pathname.startsWith("/qbm")) pathRole = "qbm";
    else if (pathname.startsWith("/student")) pathRole = "student";
  }

  const activeRole = pathRole || (sessionUser ? sessionUser.role : propRole);
  const activeName = sessionUser ? sessionUser.name : (propName || "User");
  const activeAvatar = sessionUser ? sessionUser.avatar : (propAvatar || "U");

  return (
    <div className={`tp-app-shell ${sidebarClosed ? "sidebar-closed" : ""}`}>
      <Sidebar role={activeRole} />
      <main className="tp-main-content">
        <TopNav
          role={activeRole}
          userName={activeName}
          userAvatar={activeAvatar}
          title={title}
          sidebarClosed={sidebarClosed}
          onToggleSidebar={() => setSidebarClosed((value) => !value)}
        />
        <div className="tp-page-content">
          {children}
        </div>
      </main>
    </div>
  );
}
