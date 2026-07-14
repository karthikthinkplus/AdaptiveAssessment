"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { deferEffect } from "@/lib/browserState";

type Role = "student" | "teacher" | "qbm" | "content_manager" | "admin";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

function getStoredUser(): { role: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem("tp_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("tp_token");
}

export default function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<"checking" | "allowed" | "denied">("checking");

  useEffect(() => {
    return deferEffect(() => {
      const token = getStoredToken();
      const user = getStoredUser();

      if (!token || !user) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }

      const userRole = (user.role || "").toLowerCase() as Role;
      const effectiveRole: Role = userRole === "content_manager" ? "qbm" : userRole;
      const isAllowed = allowedRoles.some((role) => role === effectiveRole || role === userRole);

      if (isAllowed) {
        setStatus("allowed");
      } else {
        router.replace("/unauthorized");
      }
    });
  }, [pathname, allowedRoles, router]);

  if (status === "checking") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
          background: "transparent",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "3px solid #F25AA7",
            borderTopColor: "transparent",
            animation: "spin 0.7s linear infinite",
          }}
        />
        <p style={{ color: "#9CA3AF", fontSize: "0.85rem", fontWeight: 600 }}>
          Verifying access...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (status === "denied") {
    return null;
  }

  return <>{children}</>;
}
