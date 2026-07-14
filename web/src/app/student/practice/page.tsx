"use client";
import RouteGuard from "@/components/auth/RouteGuard";

import AppShell from "@/components/layout/AppShell";
import PracticeSelector from "@/components/practice/PracticeSelector";
import { useState } from "react";
import { readSessionUser } from "@/lib/browserState";

export default function StudentPracticePage() {
  const [user] = useState(() => readSessionUser({ name: "Student", avatar: "S", role: "student" }));

  return (
    <RouteGuard allowedRoles={["student"]}>
    <AppShell role="student" userName={user.name} userAvatar={user.avatar} title="Topic Tests">
      <PracticeSelector role="student" />
    </AppShell>
    </RouteGuard>
  );
}
