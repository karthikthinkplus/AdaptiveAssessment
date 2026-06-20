"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    const session = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("tp_user") : null;
    const role = session
      ? JSON.parse(session).role
      : typeof localStorage !== "undefined"
        ? localStorage.getItem("current_role")
        : null;

    if (role === "teacher") router.replace("/teacher/dashboard");
    else if (role === "qbm") router.replace("/qbm/dashboard");
    else if (role === "admin") router.replace("/admin/dashboard");
    else router.replace("/student/dashboard");
  }, [router]);

  return null;
}
