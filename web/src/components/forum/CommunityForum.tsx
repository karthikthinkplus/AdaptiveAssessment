"use client";

import { ChangeEvent, useRef, useState } from "react";
import { CornerDownRight, ImagePlus, MessageCircle, MessageSquare, Send, ShieldAlert, Sparkles, Trash2, X } from "lucide-react";

interface CommunityForumProps {
  role: "student" | "admin";
  activeSectionId?: string;
  onOpenFarmhouses?: () => void;
}

type ForumSection = {
  id: string;
  label: string;
  description: string;
  group: "IPMAT";
  members: number;
  icon: string;
};

type ForumReply = {
  id: number;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  photo?: string;
};

type ForumMessage = {
  id: number;
  sectionId: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  photo?: string;
  reactions: Record<string, number>;
  replies: ForumReply[];
};

export const FORUM_SECTIONS: ForumSection[] = [
  {
    id: "quantitative-aptitude",
    label: "Quantitative Aptitude",
    description: "Arithmetic, algebra, and core aptitude doubts",
    group: "IPMAT",
    members: 1157,
    icon: "QA"
  },
  {
    id: "verbal-ability",
    label: "Verbal Ability",
    description: "Reading, grammar, vocabulary, and verbal reasoning",
    group: "IPMAT",
    members: 1501,
    icon: "VA"
  },
  {
    id: "dilr",
    label: "Data Interpretation & Logical Reasoning",
    description: "DILR sets, charts, puzzles, and reasoning discussions",
    group: "IPMAT",
    members: 1247,
    icon: "DI"
  }
];

const REACTION_LABELS = ["Like", "Helpful", "Idea", "Question"];

const getForumUser = (role: CommunityForumProps["role"]) => {
  if (typeof window === "undefined") {
    return {
      name: role === "admin" ? "Admin Moderator" : "Student",
      avatar: role === "admin" ? "AD" : "S"
    };
  }

  const tpUser = sessionStorage.getItem("tp_user");
  const user = tpUser ? JSON.parse(tpUser) : null;

  return {
    name: user?.name || (role === "admin" ? "Admin Moderator" : "Student"),
    avatar: role === "admin" ? "AD" : user?.avatar || "S"
  };
};

export default function CommunityForum({ role, activeSectionId: propsActiveSectionId, onOpenFarmhouses }: CommunityForumProps) {
  const [currentUser] = useState(() => getForumUser(role));
  const userName = currentUser.name;
  const userAvatar = currentUser.avatar;
  const activeSectionId = propsActiveSectionId;
  const [newMsgContent, setNewMsgContent] = useState("");
  const [newMsgPhoto, setNewMsgPhoto] = useState<string | undefined>();
  const [expandedMessageId, setExpandedMessageId] = useState<number | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<number, string>>({});
  const [replyPhotos, setReplyPhotos] = useState<Record<number, string | undefined>>({});
  const postPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const replyPhotoInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const replyInputRefs = useRef<Record<number, HTMLTextAreaElement | null>>({});

  const [chatMessages, setChatMessages] = useState<ForumMessage[]>([
    {
      id: 1,
      sectionId: "quantitative-aptitude",
      author: "Aravind K.",
      avatar: "AK",
      content: "What is the cleanest way to approach time and work questions when two workers have different rates?",
      timestamp: "2 hours ago",
      reactions: { Like: 4, Helpful: 2, Idea: 3, Question: 0 },
      replies: [
        { id: 101, author: "Sneha S.", avatar: "SS", content: "Convert both into work-per-day rates first. The rest usually becomes a simple addition problem.", timestamp: "1 hour ago" }
      ]
    },
    {
      id: 2,
      sectionId: "verbal-ability",
      author: "Neha Sharma",
      avatar: "NS",
      content: "How are you all reducing errors in RC inference questions?",
      timestamp: "5 hours ago",
      reactions: { Like: 2, Helpful: 0, Idea: 1, Question: 3 },
      replies: [
        { id: 201, author: "Vikram R.", avatar: "VR", content: "I eliminate anything that adds a new assumption not stated in the passage.", timestamp: "3 hours ago" }
      ]
    },
    {
      id: 3,
      sectionId: "dilr",
      author: "Ishita P.",
      avatar: "IP",
      content: "Can someone share a good ordering strategy for arrangement-based DILR sets?",
      timestamp: "Yesterday",
      reactions: { Like: 5, Helpful: 1, Idea: 0, Question: 1 },
      replies: []
    }
  ]);

  const activeSection = FORUM_SECTIONS.find((section) => section.id === activeSectionId) || FORUM_SECTIONS[0];
  const visibleMessages = activeSectionId
    ? chatMessages.filter((msg) => msg.sectionId === activeSectionId)
    : chatMessages;

  const readPhotoFile = (file: File, onPhotoReady: (photo: string) => void) => {
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onPhotoReady(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePostPhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    readPhotoFile(file, setNewMsgPhoto);
    event.target.value = "";
  };

  const handleReplyPhotoChange = (msgId: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    readPhotoFile(file, (photo) => {
      setReplyPhotos((photos) => ({ ...photos, [msgId]: photo }));
    });
    event.target.value = "";
  };

  const handleSendMessage = () => {
    if (!newMsgContent.trim() && !newMsgPhoto) return;

    const newMsg: ForumMessage = {
      id: Date.now(),
      sectionId: activeSectionId || FORUM_SECTIONS[0].id,
      author: userName,
      avatar: userAvatar,
      content: newMsgContent.trim(),
      timestamp: "Just now",
      photo: newMsgPhoto,
      reactions: { Like: 0, Helpful: 0, Idea: 0, Question: 0 },
      replies: []
    };

    setChatMessages([newMsg, ...chatMessages]);
    setNewMsgContent("");
    setNewMsgPhoto(undefined);
  };

  const handleToggleReaction = (msgId: number, reaction: string) => {
    setChatMessages(chatMessages.map((msg) => {
      if (msg.id !== msgId) return msg;
      return {
        ...msg,
        reactions: {
          ...msg.reactions,
          [reaction]: (msg.reactions[reaction] || 0) + 1
        }
      };
    }));
  };

  const handleSendReply = (msgId: number) => {
    const replyText = replyTexts[msgId] || "";
    const replyPhoto = replyPhotos[msgId];
    if (!replyText.trim() && !replyPhoto) return;

    setChatMessages(chatMessages.map((msg) => {
      if (msg.id !== msgId) return msg;
      return {
        ...msg,
        replies: [
          ...msg.replies,
          {
            id: Date.now(),
            author: userName,
            avatar: userAvatar,
            content: replyText.trim(),
            timestamp: "Just now",
            photo: replyPhoto
          }
        ]
      };
    }));

    setReplyTexts({ ...replyTexts, [msgId]: "" });
    setReplyPhotos({ ...replyPhotos, [msgId]: undefined });
  };

  const handleOpenRespond = (msgId: number) => {
    setExpandedMessageId(msgId);
    setTimeout(() => {
      replyInputRefs.current[msgId]?.focus();
    }, 80);
  };

  const handleDeleteMessage = (msgId: number) => {
    setChatMessages(chatMessages.filter((msg) => msg.id !== msgId));
  };

  const handleDeleteReply = (msgId: number, replyId: number) => {
    setChatMessages(chatMessages.map((msg) => {
      if (msg.id !== msgId) return msg;
      return {
        ...msg,
        replies: msg.replies.filter((reply) => reply.id !== replyId)
      };
    }));
  };

  return (
    <div className="tp-card" style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: 0, color: "#1F2A44", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <MessageSquare size={24} color="var(--primary)" /> Community Discussion Board
          </h1>
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
            {role === "admin" ? (
              <span style={{ color: "#EF4444", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                <ShieldAlert size={14} /> Admin Mode (Moderation Enabled)
              </span>
            ) : (
              "Ask doubts, upload photos, and discuss topics with other students"
            )}
          </div>
        </div>
        {role === "student" && (
          <button type="button" className="tp-btn-primary" onClick={onOpenFarmhouses}>
            Farmhouses
          </button>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", color: "#1F2A44", fontWeight: 800 }}>
        <Sparkles size={17} color="var(--primary)" />
        {activeSection.label}
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", background: "#F8FAFC", padding: "1.25rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: role === "admin" ? "#22324A" : "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", color: role === "admin" ? "#FFF" : "var(--primary)", fontWeight: 800, fontSize: "0.9rem", flexShrink: 0 }}>
          {userAvatar}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder={role === "admin" ? `Post an announcement in ${activeSection.label}...` : `Ask in ${activeSection.label}...`}
              value={newMsgContent}
              onChange={(e) => setNewMsgContent(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(); }}
              style={{
                flex: "1 1 260px",
                border: "1.5px solid var(--border)",
                borderRadius: "8px",
                padding: "0.6rem 1rem",
                fontSize: "0.875rem",
                outline: "none",
                background: "#FFF"
              }}
            />
            {role === "student" && (
              <>
                <input ref={postPhotoInputRef} type="file" accept="image/*" onChange={handlePostPhotoChange} style={{ display: "none" }} />
                <button
                  onClick={() => postPhotoInputRef.current?.click()}
                  title="Upload photo"
                  style={{
                    background: "#FFF",
                    color: "var(--primary)",
                    border: "1.5px solid rgba(242, 90, 167, 0.35)",
                    borderRadius: "8px",
                    width: 42,
                    height: 42,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer"
                  }}
                >
                  <ImagePlus size={18} />
                </button>
              </>
            )}
            <button
              onClick={handleSendMessage}
              style={{
                background: role === "admin" ? "#22324A" : "linear-gradient(135deg, #F25AA7 0%, #FF7BC0 100%)",
                color: "#FFF",
                border: "none",
                borderRadius: "8px",
                padding: "0.6rem 1.4rem",
                fontWeight: 700,
                fontSize: "0.875rem",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(34, 50, 74, 0.15)"
              }}
            >
              Post <Send size={14} />
            </button>
          </div>

          {newMsgPhoto && (
            <div style={{ position: "relative", width: "min(220px, 100%)" }}>
              <img src={newMsgPhoto} alt="Selected upload preview" style={{ width: "100%", maxHeight: 150, objectFit: "cover", borderRadius: "8px", border: "1px solid var(--border)" }} />
              <button onClick={() => setNewMsgPhoto(undefined)} title="Remove photo" style={{ position: "absolute", top: 6, right: 6, border: "none", borderRadius: "50%", width: 26, height: 26, background: "rgba(15, 23, 42, 0.8)", color: "#FFF", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {visibleMessages.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem", border: "1px dashed var(--border)", borderRadius: "8px" }}>
            No discussions in {activeSection.label} yet. Be the first to start one.
          </div>
        ) : (
          visibleMessages.map((msg) => (
            <div
              key={msg.id}
              style={{
                borderBottom: "1px solid #F1F5F9",
                paddingBottom: "1.5rem",
                borderRadius: expandedMessageId === msg.id ? "12px" : "0",
                transition: "all 0.2s ease"
              }}
            >
              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: msg.avatar === "AD" ? "#22324A" : "linear-gradient(135deg, #F25AA7 0%, #FF7BC0 100%)", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", fontWeight: 800, flexShrink: 0 }}>
                  {msg.avatar}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem", gap: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#1F2A44" }}>{msg.author}</span>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{msg.timestamp}</span>
                    </div>
                    {role === "admin" && (
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", padding: "0.2rem", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px", transition: "background 0.2s" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#FEE2E2"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                        title="Delete Post"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {msg.content && (
                    <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "0.85rem" }}>
                      {msg.content}
                    </div>
                  )}

                  {msg.photo && (
                    <img src={msg.photo} alt="Forum post upload" style={{ width: "min(360px, 100%)", maxHeight: 260, objectFit: "cover", borderRadius: "8px", border: "1px solid var(--border)", marginBottom: "0.85rem" }} />
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.6rem" }}>
                    <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
                      {REACTION_LABELS.map((reaction) => {
                        const count = msg.reactions[reaction] || 0;
                        return (
                          <button
                            key={reaction}
                            onClick={() => handleToggleReaction(msg.id, reaction)}
                            style={{
                              background: count > 0 ? "rgba(242, 90, 167, 0.08)" : "#FFF",
                              border: count > 0 ? "1px solid rgba(242, 90, 167, 0.3)" : "1px solid var(--border)",
                              borderRadius: "20px",
                              padding: "0.25rem 0.6rem",
                              fontSize: "0.75rem",
                              color: count > 0 ? "var(--primary)" : "var(--text-secondary)",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              cursor: "pointer",
                              transition: "all 0.2s"
                            }}
                          >
                            <span>{reaction}</span>
                            <span style={{ fontWeight: 750 }}>{count}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <button
                        onClick={() => setExpandedMessageId(expandedMessageId === msg.id ? null : msg.id)}
                        style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0" }}
                      >
                        <MessageCircle size={14} /> {msg.replies.length} {msg.replies.length === 1 ? "response" : "responses"}
                      </button>

                      <button
                        onClick={() => handleOpenRespond(msg.id)}
                        style={{
                          background: expandedMessageId === msg.id ? "linear-gradient(135deg, #F25AA7 0%, #FF7BC0 100%)" : "#F8FAFC",
                          border: expandedMessageId === msg.id ? "1.5px solid #F25AA7" : "1.5px solid var(--border)",
                          borderRadius: "999px",
                          padding: "0.35rem 1rem",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          color: expandedMessageId === msg.id ? "#fff" : "var(--text-primary)",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          transition: "all 0.2s ease",
                          boxShadow: expandedMessageId === msg.id ? "0 4px 12px rgba(242,90,167,0.3)" : "none"
                        }}
                      >
                        <CornerDownRight size={13} />
                        Respond
                      </button>
                    </div>
                  </div>

                  {expandedMessageId === msg.id && (
                    <div style={{ marginTop: "1rem", background: "#F8FAFC", borderRadius: "12px", padding: "1.25rem 1rem", display: "flex", flexDirection: "column", gap: "1rem", borderLeft: "3.5px solid var(--primary)" }}>
                      {msg.replies.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                          {msg.replies.map((reply) => (
                            <div key={reply.id} style={{ display: "flex", gap: "0.75rem" }}>
                              <div style={{ width: 28, height: 28, borderRadius: "50%", background: reply.avatar === "AD" ? "#22324A" : "rgba(148, 163, 184, 0.2)", color: reply.avatar === "AD" ? "#FFF" : "var(--text-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800, flexShrink: 0 }}>
                                {reply.avatar}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.15rem", gap: "1rem" }}>
                                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem", flexWrap: "wrap" }}>
                                    <span style={{ fontWeight: 800, fontSize: "0.85rem", color: "#1F2A44" }}>{reply.author}</span>
                                    <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{reply.timestamp}</span>
                                  </div>
                                  {role === "admin" && (
                                    <button
                                      onClick={() => handleDeleteReply(msg.id, reply.id)}
                                      style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", padding: "0.15rem", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px", transition: "background 0.2s" }}
                                      onMouseEnter={(e) => e.currentTarget.style.background = "#FEE2E2"}
                                      onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                                      title="Delete Reply"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  )}
                                </div>
                                {reply.content && (
                                  <div style={{ fontSize: "0.825rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                                    {reply.content}
                                  </div>
                                )}
                                {reply.photo && (
                                  <img src={reply.photo} alt="Forum reply upload" style={{ width: "min(260px, 100%)", maxHeight: 190, objectFit: "cover", borderRadius: "8px", border: "1px solid var(--border)", marginTop: "0.5rem" }} />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ marginTop: msg.replies.length > 0 ? "0.5rem" : 0, borderTop: msg.replies.length > 0 ? "1px solid #E5E7EB" : "none", paddingTop: msg.replies.length > 0 ? "0.75rem" : 0 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
                          <div style={{ width: 30, height: 30, borderRadius: "50%", background: role === "admin" ? "#22324A" : "var(--primary-light)", color: role === "admin" ? "#fff" : "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.75rem", flexShrink: 0, marginTop: "0.25rem" }}>
                            {userAvatar}
                          </div>
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem", minWidth: 0 }}>
                            <textarea
                              ref={(el) => { replyInputRefs.current[msg.id] = el; }}
                              placeholder="Write your response here..."
                              value={replyTexts[msg.id] || ""}
                              onChange={(e) => setReplyTexts({ ...replyTexts, [msg.id]: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendReply(msg.id);
                                }
                              }}
                              rows={2}
                              style={{ width: "100%", border: "1.5px solid var(--border)", borderRadius: "8px", padding: "0.6rem 0.85rem", fontSize: "0.85rem", outline: "none", background: "#FFF", resize: "none", fontFamily: "inherit", lineHeight: 1.5, boxSizing: "border-box", transition: "border-color 0.2s" }}
                              onFocus={(e) => e.currentTarget.style.borderColor = "var(--primary)"}
                              onBlur={(e) => e.currentTarget.style.borderColor = "var(--border)"}
                            />
                            {replyPhotos[msg.id] && (
                              <div style={{ position: "relative", width: "min(200px, 100%)" }}>
                                <img src={replyPhotos[msg.id]} alt="Selected reply upload preview" style={{ width: "100%", maxHeight: 135, objectFit: "cover", borderRadius: "8px", border: "1px solid var(--border)" }} />
                                <button onClick={() => setReplyPhotos({ ...replyPhotos, [msg.id]: undefined })} title="Remove photo" style={{ position: "absolute", top: 6, right: 6, border: "none", borderRadius: "50%", width: 24, height: 24, background: "rgba(15, 23, 42, 0.8)", color: "#FFF", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                  <X size={13} />
                                </button>
                              </div>
                            )}
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", flexWrap: "wrap" }}>
                              {role === "student" && (
                                <>
                                  <input ref={(el) => { replyPhotoInputRefs.current[msg.id] = el; }} type="file" accept="image/*" onChange={(event) => handleReplyPhotoChange(msg.id, event)} style={{ display: "none" }} />
                                  <button onClick={() => replyPhotoInputRefs.current[msg.id]?.click()} title="Upload photo" style={{ background: "#FFF", border: "1.5px solid var(--border)", borderRadius: "999px", padding: "0.4rem 0.8rem", fontSize: "0.8rem", fontWeight: 700, color: "var(--primary)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                                    <ImagePlus size={13} /> Photo
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => setExpandedMessageId(null)}
                                style={{ background: "#F1F5F9", border: "1.5px solid var(--border)", borderRadius: "999px", padding: "0.4rem 1rem", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", cursor: "pointer" }}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSendReply(msg.id)}
                                style={{ background: role === "admin" ? "#22324A" : "linear-gradient(135deg, #F25AA7 0%, #FF7BC0 100%)", color: "#FFF", border: "none", borderRadius: "999px", padding: "0.4rem 1.25rem", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.35rem", boxShadow: "0 4px 12px rgba(242, 90, 167, 0.25)" }}
                              >
                                <Send size={13} /> Send Response
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
