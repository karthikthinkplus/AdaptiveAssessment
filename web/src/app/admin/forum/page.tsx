"use client";
import RouteGuard from "@/components/auth/RouteGuard";

import AppShell from "@/components/layout/AppShell";
import CommunityForum from "@/components/forum/CommunityForum";
import { useEffect, useState } from "react";

export default function AdminForumPage() {
  const [userName, setUserName] = useState("Admin");
  const [userAvatar, setUserAvatar] = useState("AD");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const tpUser = sessionStorage.getItem("tp_user");
      const user = tpUser ? JSON.parse(tpUser) : null;
      if (user) {
        setUserName(user.name || "Admin");
        setUserAvatar("AD");
      }
    }
  }, []);

  return (
    <RouteGuard allowedRoles={["admin"]}>
    <AppShell role="admin" userName={userName} userAvatar={userAvatar} title="Community Forum">
      <CommunityForum role="admin" />
    </AppShell>
    </RouteGuard>
  );
}
