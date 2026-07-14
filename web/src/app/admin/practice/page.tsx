"use client";
import RouteGuard from "@/components/auth/RouteGuard";

import AppShell from "@/components/layout/AppShell";
import { useEffect, useState } from "react";
import { BookOpen, Users, BarChart2, ChevronRight, Layers, TrendingUp, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { deferEffect, readSessionUser } from "@/lib/browserState";

interface Topic {
  id: string;
  name: string;
  difficulty_level: string;
}

interface Subtopic {
  id: string;
  topic_id: string;
  name: string;
  description: string;
}

export default function AdminPracticePage() {
  const [user] = useState(() => readSessionUser({ name: "Admin", avatar: "AD", role: "admin" }));
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subtopicsMap, setSubtopicsMap] = useState<Record<string, Subtopic[]>>({});
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [loadingSubtopics, setLoadingSubtopics] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<"overview" | "curriculum">("overview");

  useEffect(() => {
    return deferEffect(() => {
      api.get<any[]>("/api/v1/topics")
        .then((res) => {
          setTopics(res || []);
          setLoadingTopics(false);
        })
        .catch(() => setLoadingTopics(false));
    });
  }, []);

  const toggleTopicExpand = async (topicId: string) => {
    const isExpanded = !!expandedTopics[topicId];
    setExpandedTopics({ ...expandedTopics, [topicId]: !isExpanded });

    if (!isExpanded && !subtopicsMap[topicId]) {
      setLoadingSubtopics(prev => ({ ...prev, [topicId]: true }));
      try {
        const subList = await api.get<Subtopic[]>(`/api/v1/topics/${topicId}/subtopics`);
        setSubtopicsMap(prev => ({ ...prev, [topicId]: subList || [] }));
      } catch (err) {
        console.error("Failed to load subtopics", err);
      } finally {
        setLoadingSubtopics(prev => ({ ...prev, [topicId]: false }));
      }
    }
  };

  const totalSubtopics = Object.values(subtopicsMap).reduce((sum, subs) => sum + subs.length, 0);

  const statCards = [
    { icon: <BookOpen size={22} color="#F25AA7" />, label: "Total Topics", value: topics.length, bg: "rgba(242,90,167,0.08)", border: "rgba(242,90,167,0.2)" },
    { icon: <Layers size={22} color="#00A396" />, label: "Subtopics Loaded", value: totalSubtopics, bg: "rgba(0,163,150,0.08)", border: "rgba(0,163,150,0.2)" },
    { icon: <Users size={22} color="#4D7CFF" />, label: "Active Students", value: "—", bg: "rgba(77,124,255,0.08)", border: "rgba(77,124,255,0.2)" },
    { icon: <TrendingUp size={22} color="#FFB300" />, label: "Avg. Accuracy", value: "—", bg: "rgba(255,179,0,0.08)", border: "rgba(255,179,0,0.2)" },
  ];

  return (
    <RouteGuard allowedRoles={["admin"]}>
    <AppShell role="admin" userName={user.name} userAvatar="AD" title="Practice Management">
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

        {/* Page Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1F2A44", margin: 0 }}>Practice Management</h1>
            <p style={{ fontSize: "0.85rem", color: "#6B7280", marginTop: "0.25rem" }}>
              Oversee curriculum structure, topic coverage, and practice session analytics.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {(["overview", "curriculum"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "0.5rem 1.1rem",
                  borderRadius: "10px",
                  border: activeTab === tab ? "2px solid #F25AA7" : "1.5px solid #E5E7EB",
                  background: activeTab === tab ? "rgba(242,90,167,0.08)" : "#fff",
                  color: activeTab === tab ? "#F25AA7" : "#374151",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  textTransform: "capitalize",
                  transition: "all 0.15s"
                }}
              >
                {tab === "overview" ? "📊 Overview" : "📚 Curriculum"}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
              {statCards.map((stat) => (
                <div key={stat.label} className="tp-card" style={{ display: "flex", alignItems: "center", gap: "1rem", background: "#ffffff", border: `1.5px solid ${stat.border}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "12px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                    {stat.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#1F2A44", lineHeight: 1 }}>{stat.value}</div>
                    <div style={{ fontSize: "0.72rem", color: "#6B7280", fontWeight: 600, marginTop: "0.15rem" }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>


            {/* Quick Topic Overview */}
            <div className="tp-card">
              <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#1F2A44", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <BarChart2 size={18} color="#00A396" /> Topic Overview
              </h2>
              {loadingTopics ? (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "2rem", color: "#9CA3AF" }}>
                  <Loader2 className="animate-spin" size={18} /> Loading topics...
                </div>
              ) : topics.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "#9CA3AF", fontSize: "0.85rem" }}>No topics found in the curriculum.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {topics.map((topic) => (
                    <div key={topic.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.65rem 0.85rem", borderRadius: "10px", border: "1px solid #F1F5F9", background: "#FAFBFD" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <BookOpen size={15} color="#00A396" />
                        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1F2A44" }}>{topic.name}</span>
                      </div>
                      <span style={{ fontSize: "0.65rem", padding: "0.2rem 0.55rem", borderRadius: "20px", background: "#EEF2FF", color: "#4F46E5", fontWeight: 700, textTransform: "capitalize" }}>
                        {topic.difficulty_level}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Curriculum Tab */}
        {activeTab === "curriculum" && (
          <div className="tp-card">
            <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#1F2A44", marginBottom: "0.5rem" }}>Curriculum Structure</h2>
            <p style={{ fontSize: "0.8rem", color: "#6B7280", marginBottom: "1.5rem" }}>Browse all topics and their subtopics. Click a topic to expand its subtopics.</p>

            {loadingTopics ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "3rem", justifyContent: "center", color: "#9CA3AF" }}>
                <Loader2 className="animate-spin" size={18} /> Loading curriculum...
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {topics.map((topic) => {
                  const isExpanded = !!expandedTopics[topic.id];
                  const subs = subtopicsMap[topic.id] || [];
                  return (
                    <div key={topic.id} style={{ border: "1.5px solid #E5E7EB", borderRadius: "12px", overflow: "hidden" }}>
                      <button
                        onClick={() => toggleTopicExpand(topic.id)}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.85rem 1rem", background: "rgba(0,163,150,0.03)", border: "none", cursor: "pointer", textAlign: "left" }}
                      >
                        {isExpanded ? <ChevronRight size={16} style={{ transform: "rotate(90deg)", transition: "transform 0.2s", color: "#00A396" }} /> : <ChevronRight size={16} style={{ color: "#9CA3AF" }} />}
                        <BookOpen size={16} color="#00A396" />
                        <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "#1F2A44", flex: 1 }}>{topic.name}</span>
                        <span style={{ fontSize: "0.65rem", padding: "0.2rem 0.5rem", borderRadius: "20px", background: "#F3F4F6", color: "#6B7280", fontWeight: 600, textTransform: "capitalize" }}>
                          {topic.difficulty_level}
                        </span>
                        {subs.length > 0 && (
                          <span style={{ fontSize: "0.65rem", padding: "0.2rem 0.5rem", borderRadius: "20px", background: "rgba(0,163,150,0.1)", color: "#00574F", fontWeight: 700 }}>
                            {subs.length} subtopics
                          </span>
                        )}
                      </button>

                      {isExpanded && (
                        <div style={{ paddingLeft: "2.5rem", paddingRight: "1rem", paddingBottom: "0.75rem", borderTop: "1px solid #F1F5F9" }}>
                          {loadingSubtopics[topic.id] ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", color: "#9CA3AF", padding: "0.75rem 0" }}>
                              <Loader2 className="animate-spin" size={12} /> Loading subtopics...
                            </div>
                          ) : subs.length === 0 ? (
                            <div style={{ fontSize: "0.75rem", color: "#9CA3AF", padding: "0.75rem 0" }}>No subtopics found.</div>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", paddingTop: "0.5rem" }}>
                              {subs.map((sub) => (
                                <div key={sub.id} style={{ display: "flex", flexDirection: "column", padding: "0.45rem 0.6rem", borderRadius: "8px", background: "#FAFBFD" }}>
                                  <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}>{sub.name}</span>
                                  {sub.description && <span style={{ fontSize: "0.7rem", color: "#9CA3AF", marginTop: "0.1rem" }}>{sub.description}</span>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}


      </div>
    </AppShell>
    </RouteGuard>
  );
}
