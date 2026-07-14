"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ClipboardList, BarChart2, User,
  Bell, LogOut, FileText, Users,
  BookOpen, Upload, Settings, Building2, ChevronRight, Network,
  MessageSquare, Search, HelpCircle, MessageCircle, Target, Inbox
} from "lucide-react";

type Role = "student" | "teacher" | "qbm" | "admin";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface ForumSectionNavItem {
  id: string;
  label: string;
  description?: string;
}

const NAV_ITEMS: Record<Role, NavItem[]> = {
  student: [
    { label: "Dashboard",    href: "/student/dashboard",          icon: <LayoutDashboard size={18} /> },
    { label: "Practice",     href: "/student/practice",           icon: <BookOpen size={18} /> },
    { label: "Adaptive Assessment", href: "/assessment/start",     icon: <Target size={18} /> },
    { label: "Analyse",      href: "/student/analyse",            icon: <BarChart2 size={18} /> },
    { label: "Reports",      href: "/report",                     icon: <FileText size={18} /> },
    { label: "Forum",        href: "/student/forum",              icon: <MessageSquare size={18} /> },
    { label: "Doubts Bucket", href: "/student/doubts",             icon: <Inbox size={18} /> },
    { label: "Profile",      href: "/profile",                    icon: <User size={18} /> },
  ],
  teacher: [
    { label: "Dashboard",  href: "/teacher/dashboard",  icon: <LayoutDashboard size={18} /> },
    { label: "Assessments",href: "/teacher/assessments",icon: <ClipboardList size={18} /> },
    { label: "Practice Sessions", href: "/teacher/practice", icon: <BookOpen size={18} /> },
    { label: "Students",   href: "/teacher/students",   icon: <Users size={18} /> },
    { label: "Analytics",  href: "/teacher/analytics",  icon: <BarChart2 size={18} /> },
    { label: "Doubts",     href: "/teacher/doubts",     icon: <Inbox size={18} /> },
    { label: "Reports",    href: "/teacher/reports",    icon: <FileText size={18} /> },
    { label: "Profile",    href: "/profile",            icon: <User size={18} /> },
  ],
  qbm: [
    { label: "Dashboard",     href: "/qbm/dashboard",  icon: <LayoutDashboard size={18} /> },
    { label: "Question Bank", href: "/qbm/questions",  icon: <BookOpen size={18} /> },
    { label: "Curriculum Map", href: "/qbm/curriculum", icon: <Network size={18} /> },
    { label: "Bulk Upload",   href: "/qbm/upload",     icon: <Upload size={18} /> },
    { label: "Profile",       href: "/profile",        icon: <User size={18} /> },
  ],
  admin: [
    { label: "Dashboard",    href: "/admin/dashboard",     icon: <LayoutDashboard size={18} /> },
    { label: "Assessments",  href: "/admin/assessments",   icon: <ClipboardList size={18} /> },
    { label: "Institutions", href: "/admin/institutions",  icon: <Building2 size={18} /> },
    { label: "Users",        href: "/admin/users",         icon: <Users size={18} /> },
    { label: "Reports",      href: "/admin/reports",       icon: <FileText size={18} /> },
    { label: "Forum",        href: "/admin/forum",         icon: <MessageSquare size={18} /> },
    { label: "Practice",     href: "/admin/practice",      icon: <BookOpen size={18} /> },
    { label: "Notifications",href: "/admin/notifications", icon: <Bell size={18} /> },
    { label: "System Config", href: "/admin/settings",     icon: <Settings size={18} /> },
    { label: "Audit Logs",   href: "/admin/audit",         icon: <ClipboardList size={18} /> },
    { label: "Profile",      href: "/profile",             icon: <User size={18} /> },
  ],
};

interface SidebarProps {
  role?: Role;
  forumSections?: ForumSectionNavItem[];
  activeForumSectionId?: string;
  onForumSectionChange?: (sectionId: string) => void;
}

const profileHrefForRole = (role: Role) => `/${role}/profile`;

export default function Sidebar({ role = "student", forumSections = [], activeForumSectionId, onForumSectionChange }: SidebarProps) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role].map(item =>
    item.href === "/profile" ? { ...item, href: profileHrefForRole(role) } : item
  );
  const showForumSections = role === "student" && pathname?.startsWith("/student/forum") && forumSections.length > 0;

  return (
    <aside className="tp-sidebar">
      <div className="tp-sidebar-program" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <img src="/logo.png" alt="ThinkPlus Logo" style={{ height: "28px", width: "auto", display: "block" }} />
      </div>

      <div className="tp-sidebar-search">
        <Search size={15} />
        <span>Find...</span>
        <kbd>⌘K</kbd>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "0.75rem 0", overflowY: "auto" }}>
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const isStudentForumItem = role === "student" && item.href === "/student/forum";
          return (
            <div key={item.href}>
              <Link href={item.href} className={`tp-nav-item ${isActive ? "active" : ""}`}>
                {item.icon}
                <span style={{ flex: 1 }}>{item.label}</span>
                {isActive && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
              </Link>

              {showForumSections && isStudentForumItem && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem", margin: "0.15rem 0 0.5rem" }}>
                  {forumSections.map((section) => {
                    const sectionActive = activeForumSectionId === section.id;
                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => onForumSectionChange?.(section.id)}
                        className={`tp-nav-item ${sectionActive ? "active" : ""}`}
                        title={section.description}
                        style={{
                          width: "calc(100% - 1.5rem)",
                          background: sectionActive ? undefined : "none",
                          paddingLeft: "2.55rem",
                          fontSize: "0.8rem",
                          textAlign: "left"
                        }}
                      >
                        <span style={{ flex: 1 }}>{section.label}</span>
                        {sectionActive && <ChevronRight size={12} style={{ opacity: 0.5 }} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: "1px solid var(--border)", padding: "0.75rem 0" }}>
        <Link href="/student/forum" className="tp-nav-item">
          <MessageCircle size={18} />
          <span>Feedback</span>
        </Link>
        <Link href="/student/forum" className="tp-nav-item">
          <HelpCircle size={18} />
          <span>Help</span>
        </Link>
        <button
          onClick={() => {
            if (typeof window !== "undefined") {
              sessionStorage.clear();
              localStorage.removeItem("current_role");
              window.location.href = "/login";
            }
          }}
          className="tp-nav-item"
          style={{
            width: "100%",
            background: "none",
            border: "none",
            textAlign: "left",
            cursor: "pointer",
            color: "#F87171",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <LogOut size={18} style={{ stroke: "#F87171" }} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
