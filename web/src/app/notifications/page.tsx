"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const activeRole = localStorage.getItem("current_role") || "student";
      if (activeRole === "teacher") {
        router.replace("/teacher/dashboard");
      } else if (activeRole === "qbm") {
        router.replace("/qbm/dashboard");
      } else if (activeRole === "admin") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/student/dashboard");
      }
    }
  }, [router]);

  return null;
}
