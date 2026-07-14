"use client";
import RouteGuard from "@/components/auth/RouteGuard";

import AppShell from "@/components/layout/AppShell";
import CommunityForum, { FORUM_SECTIONS } from "@/components/forum/CommunityForum";
import { useState } from "react";
import { readSessionUser } from "@/lib/browserState";

export default function AdminForumPage() {
  const [user] = useState(() => readSessionUser({ name: "Admin", avatar: "AD", role: "admin" }));
  const [activeSectionId, setActiveSectionId] = useState(FORUM_SECTIONS[0].id);

  return (
    <RouteGuard allowedRoles={["admin"]}>
    <AppShell role="admin" userName={user.name} userAvatar="AD" title="Community Forum">
      <div className="admin-forum-page">
        <section className="admin-forum-sections">
          <div>
            <h1>Forum Sections</h1>
            <p>Moderate the farmhouses created for students.</p>
          </div>
          <div>
            {FORUM_SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                className={activeSectionId === section.id ? "active" : ""}
                onClick={() => setActiveSectionId(section.id)}
              >
                <span>{section.icon}</span>
                {section.label}
              </button>
            ))}
          </div>
        </section>
        <CommunityForum role="admin" activeSectionId={activeSectionId} />
      </div>
    </AppShell>
    </RouteGuard>
  );
}
