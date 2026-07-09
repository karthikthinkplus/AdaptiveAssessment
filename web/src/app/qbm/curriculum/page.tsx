"use client";
import RouteGuard from "@/components/auth/RouteGuard";

import AppShell from "@/components/layout/AppShell";
import {
  BookOpen,
  GitBranch,
  Layers,
  Link2,
  Plus,
  Rocket,
  Save,
  Trash2,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { api } from "@/lib/api";

type CurriculumStatus = "Draft" | "Saved" | "Published";

type Subtopic = {
  id: string;
  name: string;
  status: CurriculumStatus;
};

type Topic = {
  id: string;
  name: string;
  subject: string;
  grade: string;
  status: CurriculumStatus;
  subtopics: Subtopic[];
};

type TopicDependency = {
  id: string;
  beforeTopicId: string;
  afterTopicId: string;
  reason: string;
  status: CurriculumStatus;
};



const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const statusBadgeClass = (status: CurriculumStatus) =>
  status === "Published"
    ? "tp-badge-success"
    : status === "Saved"
      ? "tp-badge-primary"
      : "tp-badge-neutral";

export default function QBMCurriculumPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [dependencies, setDependencies] = useState<TopicDependency[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [topicName, setTopicName] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [grade, setGrade] = useState("Grade 10");
  const [subtopicName, setSubtopicName] = useState("");
  const [beforeTopicId, setBeforeTopicId] = useState("");
  const [afterTopicId, setAfterTopicId] = useState("");
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState("Draft curriculum changes are not published until you save and publish them.");
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("QBM Developer");
  const [userAvatar, setUserAvatar] = useState("RK");

  const loadData = async () => {
    try {
      setLoading(true);
      const list = await api.get<any[]>("/api/v1/topics");
      const cleanList = Array.isArray(list) ? list : [];
      const mapped = await Promise.all(cleanList.map(async (t: any) => {
        const subList = await api.get<any[]>(`/api/v1/topics/${t.id}/subtopics`);
        const cleanSub = Array.isArray(subList) ? subList : [];
        return {
          id: t.id,
          name: t.name,
          subject: "Mathematics",
          grade: t.difficulty_level === "easy" ? "Grade 8" : t.difficulty_level === "medium" ? "Grade 9" : "Grade 10",
          status: (t.is_active ? "Published" : "Draft") as CurriculumStatus,
          subtopics: cleanSub.map((s: any) => ({
            id: s.id,
            name: s.name,
            status: (s.is_active ? "Published" : "Draft") as CurriculumStatus
          }))
        };
      }));
      setTopics(mapped);
      if (mapped.length > 0) {
        setSelectedTopicId(mapped[0].id);
        setBeforeTopicId(mapped[0].id);
        if (mapped.length > 1) {
          setAfterTopicId(mapped[1].id);
        } else {
          setAfterTopicId(mapped[0].id);
        }
      }
      
      const savedDeps = localStorage.getItem("tp_topic_dependencies");
      if (savedDeps) {
        try {
          const parsed = JSON.parse(savedDeps) as TopicDependency[];
          const topicIds = new Set(mapped.map((t: any) => t.id));
          const validDeps = parsed.filter(d => topicIds.has(d.beforeTopicId) && topicIds.has(d.afterTopicId));
          setDependencies(validDeps);
          localStorage.setItem("tp_topic_dependencies", JSON.stringify(validDeps));
        } catch (err) {
          console.error("Failed to parse topic dependencies", err);
        }
      }
    } catch (err) {
      console.error("Failed to load curriculum data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const tpUser = sessionStorage.getItem("tp_user");
      const user = tpUser ? JSON.parse(tpUser) : null;
      if (user) {
        setUserName(user.name || "QBM Developer");
        setUserAvatar(user.avatar || "RK");
      }
    }
    loadData();
  }, []);

  const selectedTopic = topics.find((topic) => topic.id === selectedTopicId) ?? topics[0] ?? {
    id: "",
    name: "No Topic Selected",
    subject: "Mathematics",
    grade: "Grade 10",
    status: "Draft" as CurriculumStatus,
    subtopics: []
  };

  const topicLookup = useMemo(
    () => new Map(topics.map((topic) => [topic.id, topic])),
    [topics]
  );
  const publishableDependencies = dependencies.filter((dependency) => dependency.status === "Saved");
  const linkedSavedTopicIds = useMemo(() => {
    const topicIds = new Set<string>();

    publishableDependencies.forEach((dependency) => {
      topicIds.add(dependency.beforeTopicId);
      topicIds.add(dependency.afterTopicId);
    });

    return topicIds;
  }, [publishableDependencies]);

  const handleSaveTopic = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = topicName.trim();
    if (!trimmedName) return;

    try {
      const payload = {
        name: trimmedName,
        difficulty_level: grade === "Grade 8" ? "easy" : grade === "Grade 9" ? "medium" : "hard",
        display_order: topics.length + 1,
        is_active: true
      };
      const created = await api.post<any>("/api/v1/topics", payload);
      setNotice(`${trimmedName} saved as a topic in database.`);
      setTopicName("");
      await loadData();
      setSelectedTopicId(created.id);
    } catch (err: any) {
      alert("Failed to save topic: " + err.message);
    }
  };

  const handleSaveSubtopic = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = subtopicName.trim();
    if (!trimmedName || !selectedTopicId) return;

    try {
      const payload = {
        name: trimmedName,
        description: "",
        difficulty_level: "medium",
        display_order: selectedTopic.subtopics.length + 1,
        mastery_threshold: 0.85,
        is_active: true
      };
      await api.post(`/api/v1/topics/${selectedTopicId}/subtopics`, payload);
      setNotice(`${trimmedName} saved under ${selectedTopic.name} in database.`);
      setSubtopicName("");
      await loadData();
    } catch (err: any) {
      alert("Failed to save subtopic: " + err.message);
    }
  };

  const handleDeleteSubtopic = (subtopicId: string) => {
    if (!selectedTopic) return;
    setNotice("Deleting subtopic is not supported by backend. Status updated to draft locally.");
    setTopics((current) =>
      current.map((topic) =>
        topic.id === selectedTopic.id
          ? {
              ...topic,
              subtopics: topic.subtopics.map(s => s.id === subtopicId ? { ...s, status: "Draft" } : s)
            }
          : topic
      )
    );
  };

  const handleDeleteTopic = async (topicId: string) => {
    try {
      await api.patch(`/api/v1/topics/${topicId}`, { is_active: false });
      setNotice(`Topic deactivated in database.`);
      await loadData();
    } catch (err: any) {
      alert("Failed to delete topic: " + err.message);
    }
  };

  const handleSaveDependency = (event: React.FormEvent) => {
    event.preventDefault();
    if (!beforeTopicId || !afterTopicId || beforeTopicId === afterTopicId) {
      setNotice("Choose two different topics before saving a learning link.");
      return;
    }

    const exists = dependencies.some(
      (dependency) =>
        dependency.beforeTopicId === beforeTopicId &&
        dependency.afterTopicId === afterTopicId
    );
    if (exists) {
      setNotice("That learning link is already saved.");
      return;
    }

    const updated = [
      ...dependencies,
      {
        id: `dep-${Date.now()}`,
        beforeTopicId,
        afterTopicId,
        reason: reason.trim() || "Prerequisite relationship added by QBM.",
        status: "Saved" as CurriculumStatus,
      },
    ];
    setDependencies(updated);
    localStorage.setItem("tp_topic_dependencies", JSON.stringify(updated));
    setReason("");
    setNotice("Learning link saved to local draft map.");
  };

  const handleSaveMap = () => {
    setNotice("All draft learning links are saved locally.");
  };

  const handlePublishLinkedMap = () => {
    if (publishableDependencies.length === 0) {
      setNotice("Save at least one learning link before publishing.");
      return;
    }
    setDependencies(current =>
      current.map(d => d.status === "Saved" ? { ...d, status: "Published" } : d)
    );
    setNotice("Published saved learning links locally.");
  };

  const stats = [
    { label: "Topics", value: topics.length, icon: <BookOpen size={18} color="var(--primary)" /> },
    {
      label: "Subtopics",
      value: topics.reduce((total, topic) => total + topic.subtopics.length, 0),
      icon: <Layers size={18} color="var(--success)" />,
    },
    {
      label: "Learning Links",
      value: dependencies.length,
      icon: <GitBranch size={18} color="var(--warning)" />,
    },
    {
      label: "Ready to Publish",
      value: publishableDependencies.length,
      icon: <Rocket size={18} color="var(--primary)" />,
    },
  ];

  return (
    <RouteGuard allowedRoles={["qbm","content_manager"]}>
    <AppShell role="qbm" userName={userName} userAvatar={userAvatar} title="Curriculum Map">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "1.375rem", fontWeight: 700 }}>
            Topic and Subtopic Mapping
          </h1>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button type="button" onClick={handleSaveMap} className="tp-btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
            <Save size={16} /> Save Map
          </button>
          <button type="button" onClick={handlePublishLinkedMap} className="tp-btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
            <Rocket size={16} /> Publish Linked Map
          </button>
        </div>
      </div>

      <div className="animate-scale-in" style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "var(--primary-light)", color: "var(--primary)", padding: "0.75rem 1rem", borderRadius: 8, fontSize: "0.875rem", fontWeight: 600, marginBottom: "1.5rem" }}>
        <Save size={16} />
        <span>{notice}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {stats.map((stat) => (
          <div key={stat.label} className="tp-stat-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="tp-stat-label">{stat.label}</span>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {stat.icon}
              </div>
            </div>
            <div className="tp-stat-value">{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <form onSubmit={handleSaveTopic} className="tp-card animate-fade-in-up" style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <h2 style={{ fontSize: "0.9375rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Plus size={16} color="var(--primary)" /> Topic
            </h2>
            <input className="tp-input" value={topicName} onChange={(event) => setTopicName(event.target.value)} placeholder="Topic name" required />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <select className="tp-select" value={subject} onChange={(event) => setSubject(event.target.value)}>
                <option>Mathematics</option>
                <option>Physics</option>
                <option>Chemistry</option>
                <option>English</option>
              </select>
              <select className="tp-select" value={grade} onChange={(event) => setGrade(event.target.value)}>
                <option>Grade 8</option>
                <option>Grade 9</option>
                <option>Grade 10</option>
                <option>Grade 11</option>
                <option>Grade 12</option>
              </select>
            </div>
            <button type="submit" className="tp-btn-primary" style={{ justifyContent: "center", padding: "0.625rem", fontSize: "0.875rem" }}>
              <Save size={16} /> Save Topic
            </button>
          </form>

          <div className="tp-card animate-fade-in-up stagger-1">
            <h2 style={{ fontSize: "0.9375rem", fontWeight: 700, marginBottom: "1rem" }}>Topics</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: "0.5rem",
                    border: "1px solid",
                    borderColor: selectedTopicId === topic.id ? "var(--primary)" : "var(--border)",
                    background: selectedTopicId === topic.id ? "var(--primary-light)" : "var(--bg)",
                    borderRadius: 8,
                    padding: "0.75rem",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedTopicId(topic.id)}
                    style={{ textAlign: "left", background: "transparent", border: "none", padding: 0, cursor: "pointer" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>{topic.name}</span>
                      <span className={`tp-badge ${statusBadgeClass(topic.status)}`}>
                        {topic.status}
                      </span>
                    </div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.75rem", marginTop: "0.35rem" }}>
                      {topic.grade} - {topic.subtopics.length} subtopics
                    </div>
                  </button>
                  <button
                    type="button"
                    className="tp-btn-ghost"
                    onClick={() => handleDeleteTopic(topic.id)}
                    style={{ padding: "0.45rem", alignSelf: "start", color: "var(--danger)" }}
                    title={`Delete ${topic.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="tp-card animate-fade-in-up stagger-2">
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.25rem" }}>{selectedTopic.name}</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem" }}>
                  {selectedTopic.subject} - {selectedTopic.grade}
                </p>
              </div>
              <span className={`tp-badge ${statusBadgeClass(selectedTopic.status)}`}>
                {selectedTopic.status}
              </span>
            </div>

            <form onSubmit={handleSaveSubtopic} style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
              <input className="tp-input" value={subtopicName} onChange={(event) => setSubtopicName(event.target.value)} placeholder="New subtopic for selected topic" required />
              <button type="submit" className="tp-btn-primary" style={{ padding: "0.625rem 0.875rem" }} title="Save subtopic">
                <Save size={16} />
              </button>
            </form>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
              {selectedTopic.subtopics.map((subtopic, index) => (
                <div key={`${selectedTopic.id}-${subtopic.id}`} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "0.75rem", background: "var(--surface)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", alignItems: "center", marginBottom: "0.25rem" }}>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700 }}>
                      Subtopic {index + 1}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <span className={`tp-badge ${statusBadgeClass(subtopic.status)}`}>
                        {subtopic.status}
                      </span>
                      <button
                        type="button"
                        className="tp-btn-ghost"
                        onClick={() => handleDeleteSubtopic(subtopic.id)}
                        style={{ padding: "0.3rem", color: "var(--danger)" }}
                        title={`Delete ${subtopic.name}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{subtopic.name}</div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSaveDependency} className="tp-card animate-fade-in-up stagger-3" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h2 style={{ fontSize: "0.9375rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Link2 size={16} color="var(--primary)" /> Topic Learning Order
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "0.25rem" }}>
                  Learn first
                </label>
                <select className="tp-select" value={beforeTopicId} onChange={(event) => setBeforeTopicId(event.target.value)}>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>{topic.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, display: "block", marginBottom: "0.25rem" }}>
                  Then learn
                </label>
                <select className="tp-select" value={afterTopicId} onChange={(event) => setAfterTopicId(event.target.value)}>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>{topic.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <textarea className="tp-input" style={{ minHeight: 76, resize: "vertical" }} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason or dependency note" />
            <button type="submit" className="tp-btn-primary" style={{ justifyContent: "center", padding: "0.625rem", fontSize: "0.875rem" }}>
              <Save size={16} /> Save Learning Link
            </button>
          </form>

          <div className="tp-card animate-fade-in-up stagger-4">
            <h2 style={{ fontSize: "0.9375rem", fontWeight: 700, marginBottom: "1rem" }}>Learning Path Rules</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {dependencies.map((dependency) => {
                const before = topicLookup.get(dependency.beforeTopicId);
                const after = topicLookup.get(dependency.afterTopicId);
                return (
                  <div key={dependency.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.75rem", border: "1px solid var(--border)", borderRadius: 8, padding: "0.875rem", background: "var(--surface)" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", fontWeight: 700, fontSize: "0.875rem" }}>
                        <span>{before?.name}</span>
                        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>before</span>
                        <span>{after?.name}</span>
                        <span className={`tp-badge ${statusBadgeClass(dependency.status)}`}>
                          {dependency.status}
                        </span>
                      </div>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", marginTop: "0.35rem", lineHeight: 1.45 }}>
                        {dependency.reason}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="tp-btn-ghost"
                      onClick={() => setDependencies((current) => current.filter((item) => item.id !== dependency.id))}
                      style={{ padding: "0.5rem", alignSelf: "start", color: "var(--danger)" }}
                      title="Remove learning link"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
    </RouteGuard>
  );
}
