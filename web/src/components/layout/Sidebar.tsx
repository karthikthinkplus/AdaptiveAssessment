"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ClipboardList, BarChart2, User,
  Bell, LogOut, FileText, Users,
  BookOpen, Upload, Settings, Building2, ChevronRight, Network,
  MessageSquare
} from "lucide-react";

type Role = "student" | "teacher" | "qbm" | "admin";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: Record<Role, NavItem[]> = {
  student: [
    { label: "Dashboard",    href: "/student/dashboard",          icon: <LayoutDashboard size={18} /> },
    { label: "Practice",     href: "/student/practice",           icon: <BookOpen size={18} /> },
    { label: "Reports",      href: "/report",                     icon: <FileText size={18} /> },
    { label: "Forum",        href: "/student/forum",              icon: <MessageSquare size={18} /> },
    { label: "Profile",      href: "/profile",                    icon: <User size={18} /> },
  ],
  teacher: [
    { label: "Dashboard",  href: "/teacher/dashboard",  icon: <LayoutDashboard size={18} /> },
    { label: "Assessments",href: "/teacher/assessments",icon: <ClipboardList size={18} /> },
    { label: "Students",   href: "/teacher/students",   icon: <Users size={18} /> },
    { label: "Analytics",  href: "/teacher/analytics",  icon: <BarChart2 size={18} /> },
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

interface SidebarProps { role?: Role; }

const profileHrefForRole = (role: Role) => `/${role}/profile`;

export default function Sidebar({ role = "student" }: SidebarProps) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role].map(item =>
    item.href === "/profile" ? { ...item, href: profileHrefForRole(role) } : item
  );

  return (
    <aside className="tp-sidebar">
      {/* Logo */}
      <Link href="/" className="tp-sidebar-logo">
        <img src="/logo.png" alt="thinkplus" style={{ height: "38px", width: "auto" }} />
      </Link>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "0.75rem 0", overflowY: "auto" }}>
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} className={`tp-nav-item ${isActive ? "active" : ""}`}>
              {item.icon}
              <span style={{ flex: 1 }}>{item.label}</span>
              {isActive && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: "1px solid var(--border)", padding: "0.75rem 0" }}>
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
