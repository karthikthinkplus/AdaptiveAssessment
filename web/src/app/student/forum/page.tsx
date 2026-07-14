"use client";
import RouteGuard from "@/components/auth/RouteGuard";

import AppShell from "@/components/layout/AppShell";
import CommunityForum, { FORUM_SECTIONS } from "@/components/forum/CommunityForum";
import { useMemo, useState } from "react";
import { Check, Plus, Sprout } from "lucide-react";

const validForumIds = new Set(FORUM_SECTIONS.map((section) => section.id));
const forumGroups = Array.from(new Set(FORUM_SECTIONS.map((section) => section.group)));

const getStudentForumUser = () => {
  if (typeof window === "undefined") {
    return { name: "Student", avatar: "S" };
  }

  const tpUser = sessionStorage.getItem("tp_user");
  const user = tpUser ? JSON.parse(tpUser) : null;

  return {
    name: user?.name || "Student",
    avatar: user?.avatar || "S"
  };
};

export default function StudentForumPage() {
  const [forumUser] = useState(getStudentForumUser);
  const [joinedSectionIds, setJoinedSectionIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("tp_joined_forum_sections");
      const parsed = saved ? JSON.parse(saved) : [];
      if (Array.isArray(parsed) && parsed.length > 0) {
        const validIds = parsed.filter((id) => typeof id === "string" && validForumIds.has(id));
        localStorage.setItem("tp_joined_forum_sections", JSON.stringify(validIds));
        return validIds;
      }
      return [];
    } catch {
      return [];
    }
  });
  const [showFarmhouses, setShowFarmhouses] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const saved = localStorage.getItem("tp_joined_forum_sections");
      const parsed = saved ? JSON.parse(saved) : [];
      const validIds = Array.isArray(parsed)
        ? parsed.filter((id) => typeof id === "string" && validForumIds.has(id))
        : [];
      return validIds.length === 0;
    } catch {
      return true;
    }
  });

  const joinedSections = useMemo(
    () => FORUM_SECTIONS.filter((section) => joinedSectionIds.includes(section.id)),
    [joinedSectionIds]
  );
  const [activeSectionId, setActiveSectionId] = useState(FORUM_SECTIONS[0].id);
  const activeVisibleSectionId = joinedSections.some((section) => section.id === activeSectionId)
    ? activeSectionId
    : joinedSections[0]?.id || FORUM_SECTIONS[0].id;

  const toggleSection = (sectionId: string) => {
    setJoinedSectionIds((current) => {
      const next = current.includes(sectionId)
        ? current.filter((id) => id !== sectionId)
        : [...current, sectionId];
      localStorage.setItem("tp_joined_forum_sections", JSON.stringify(next));
      return next;
    });
  };

  const finishSelection = () => {
    const validJoinedIds = joinedSectionIds.filter((id) => validForumIds.has(id));
    if (validJoinedIds.length === 0) return;
    localStorage.setItem("tp_joined_forum_sections", JSON.stringify(validJoinedIds));
    setShowFarmhouses(false);
    setActiveSectionId(validJoinedIds[0]);
  };

  return (
    <RouteGuard allowedRoles={["student"]}>
    <AppShell
      role="student"
      userName={forumUser.name}
      userAvatar={forumUser.avatar}
      title="Community Forum"
      forumSections={joinedSections}
      activeForumSectionId={activeVisibleSectionId}
      onForumSectionChange={setActiveSectionId}
    >
      {showFarmhouses ? (
        <div className="farmhouse-page">
          <div className="farmhouse-title">
            <Sprout size={18} />
            <div>
              <h1>Explore Farmhouses</h1>
              <p>Click the plus button to subscribe to a farmhouse. Your featured posts will show accordingly.</p>
            </div>
          </div>

          {forumGroups.map((group) => (
            <section key={group} className="farmhouse-section">
              <h2>{group}</h2>
              <div className="farmhouse-grid">
                {FORUM_SECTIONS.filter((section) => section.group === group).map((section, index) => {
                  const selected = joinedSectionIds.includes(section.id);
                  return (
                    <button
                      key={section.id}
                      type="button"
                      className={`farmhouse-card tone-${index % 8} ${selected ? "selected" : ""}`}
                      onClick={() => toggleSection(section.id)}
                    >
                      <span className="farmhouse-band" />
                      <span className="farmhouse-icon">{section.icon}</span>
                      <strong>{section.label}</strong>
                      <small>{section.members} members</small>
                      <span className="farmhouse-plus">{selected ? <Check size={14} /> : <Plus size={14} />}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}

          <div className="farmhouse-actions">
            <button
              type="button"
              className="tp-btn-primary"
              disabled={joinedSectionIds.length === 0}
              onClick={finishSelection}
            >
              Join Selected Farmhouses
            </button>
          </div>
        </div>
      ) : (
        <CommunityForum
          role="student"
          activeSectionId={activeVisibleSectionId}
          onOpenFarmhouses={() => setShowFarmhouses(true)}
        />
      )}
    </AppShell>
    </RouteGuard>
  );
}
