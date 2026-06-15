import type { Metadata } from "next";
import Link from "next/link";
import { Activity, BookOpenCheck, GraduationCap, Shield, Users } from "lucide-react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Adaptive Assessment",
  description: "Adaptive learning and assessment platform",
};

const navItems = [
  { href: "/", label: "Overview", icon: Activity },
  { href: "/assessments", label: "Assessments", icon: BookOpenCheck },
  { href: "/teacher", label: "Teacher", icon: Users },
  { href: "/admin", label: "Admin", icon: Shield },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="border-b bg-card">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <GraduationCap className="h-5 w-5 text-primary" />
                Adaptive Assessment
              </Link>
              <nav className="flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
