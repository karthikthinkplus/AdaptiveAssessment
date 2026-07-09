"use client";
import RouteGuard from "@/components/auth/RouteGuard";

import AppShell from "@/components/layout/AppShell";
import CommunityForum from "@/components/forum/CommunityForum";
import { useEffect, useState } from "react";

export default function StudentForumPage() {
  const [userName, setUserName] = useState("Student");
  const [userAvatar, setUserAvatar] = useState("S");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const tpUser = sessionStorage.getItem("tp_user");
      const user = tpUser ? JSON.parse(tpUser) : null;
      if (user) {
        setUserName(user.name || "Student");
        setUserAvatar(user.avatar || "S");
      }
    }
  }, []);

  return (
    <RouteGuard allowedRoles={["student"]}>
    <AppShell role="student" userName={userName} userAvatar={userAvatar} title="Community Forum">
      <CommunityForum role="student" />
    </AppShell>
    </RouteGuard>
  );
}
