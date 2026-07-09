"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Trash2, ShieldAlert, CornerDownRight } from "lucide-react";

interface CommunityForumProps {
  role: "student" | "admin";
}

export default function CommunityForum({ role }: CommunityForumProps) {
  const [userName, setUserName] = useState(role === "admin" ? "Admin Moderator" : "Student");
  const [userAvatar, setUserAvatar] = useState(role === "admin" ? "AD" : "S");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const tpUser = sessionStorage.getItem("tp_user");
      const user = tpUser ? JSON.parse(tpUser) : null;
      if (user) {
        if (role === "admin") {
          setUserName(user.name || "Admin Moderator");
          setUserAvatar("AD");
        } else {
          setUserName(user.name || "Student");
          setUserAvatar(user.avatar || "S");
        }
      }
    }
  }, [role]);

  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      id: 1,
      author: "Aravind K.",
      avatar: "AK",
      content: "Does anyone have a good trick to remember the quadratic formula? I keep getting the signs mixed up.",
      timestamp: "2 hours ago",
      reactions: { "👍": 4, "❤️": 2, "💡": 3, "❓": 0 },
      replies: [
        { id: 101, author: "Sneha S.", avatar: "SS", content: "Try singing it to the tune of 'Pop Goes the Weasel'! That's how I memorized it: x equals negative b, plus or minus square root...", timestamp: "1 hour ago" },
        { id: 102, author: "Rohan M.", avatar: "RM", content: "Also remember that the term under the square root is the discriminant (b² - 4ac). Keeps the signs organized!", timestamp: "45 mins ago" }
      ]
    },
    {
      id: 2,
      author: "Neha Sharma",
      avatar: "NS",
      content: "Can someone explain why relative speed is added when two objects move towards each other? Wouldn't they cover the distance slower?",
      timestamp: "5 hours ago",
      reactions: { "👍": 2, "❤️": 0, "💡": 1, "❓": 3 },
      replies: [
        { id: 201, author: "Vikram R.", avatar: "VR", content: "Think of it this way: if you are driving at 50 km/h and a car is coming towards you at 50 km/h, the gap between you is closing at 100 km/h! So you hit each other much faster, hence the speed adds up.", timestamp: "3 hours ago" }
      ]
    }
  ]);
  const [newMsgContent, setNewMsgContent] = useState("");
  const [expandedMessageId, setExpandedMessageId] = useState<number | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<number, string>>({});
  const replyInputRefs = useRef<Record<number, HTMLTextAreaElement | null>>({});

  const handleSendMessage = () => {
    if (!newMsgContent.trim()) return;
    const newMsg = {
      id: Date.now(),
      author: userName,
      avatar: userAvatar,
      content: newMsgContent.trim(),
      timestamp: "Just now",
      reactions: { "👍": 0, "❤️": 0, "💡": 0, "❓": 0 },
      replies: []
    };
    setChatMessages([newMsg, ...chatMessages]);
    setNewMsgContent("");
  };

  const handleToggleReaction = (msgId: number, emoji: string) => {
    setChatMessages(chatMessages.map(msg => {
      if (msg.id === msgId) {
        const currentCount = msg.reactions[emoji] || 0;
        return {
          ...msg,
          reactions: {
            ...msg.reactions,
            [emoji]: currentCount + 1
          }
        };
      }
      return msg;
    }));
  };

  const handleSendReply = (msgId: number) => {
    const replyText = replyTexts[msgId] || "";
    if (!replyText.trim()) return;

    setChatMessages(chatMessages.map(msg => {
      if (msg.id === msgId) {
        return {
          ...msg,
          replies: [
            ...msg.replies,
            {
              id: Date.now(),
              author: userName,
              avatar: userAvatar,
              content: replyText.trim(),
              timestamp: "Just now"
            }
          ]
        };
      }
      return msg;
    }));

    setReplyTexts({
      ...replyTexts,
      [msgId]: ""
    });
  };

  const handleOpenRespond = (msgId: number) => {
    setExpandedMessageId(msgId);
    // Focus the textarea after it mounts
    setTimeout(() => {
      replyInputRefs.current[msgId]?.focus();
    }, 80);
  };

  // Moderation: Admin deleting a post
  const handleDeleteMessage = (msgId: number) => {
    setChatMessages(chatMessages.filter(msg => msg.id !== msgId));
  };

  // Moderation: Admin deleting a reply
  const handleDeleteReply = (msgId: number, replyId: number) => {
    setChatMessages(chatMessages.map(msg => {
      if (msg.id === msgId) {
        return {
          ...msg,
          replies: msg.replies.filter((reply: any) => reply.id !== replyId)
        };
      }
      return msg;
    }));
  };

  return (
    <div className="tp-card" style={{ width: "100%" }}>
      {/* Header */}
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
              "Ask doubts, answer questions, and discuss topics with other students"
            )}
          </div>
        </div>
      </div>

      {/* Post Message Input Bar */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", background: "#F8FAFC", padding: "1.25rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: role === "admin" ? "#22324A" : "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", color: role === "admin" ? "#FFF" : "var(--primary)", fontWeight: 800, fontSize: "0.9rem", flexShrink: 0 }}>
          {userAvatar}
        </div>
        <div style={{ flex: 1, display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            placeholder={role === "admin" ? "Post an official announcement or moderate the chat..." : "What's your doubt or topic you want to discuss?"}
            value={newMsgContent}
            onChange={(e) => setNewMsgContent(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(); }}
            style={{
              flex: 1,
              border: "1.5px solid var(--border)",
              borderRadius: "8px",
              padding: "0.6rem 1rem",
              fontSize: "0.875rem",
              outline: "none",
              background: "#FFF"
            }}
          />
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
      </div>

      {/* Message Feed */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {chatMessages.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
            No discussions yet. Be the first to start a conversation!
          </div>
        ) : (
          chatMessages.map((msg) => (
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
                {/* Avatar */}
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: msg.avatar === "AD" ? "#22324A" : "linear-gradient(135deg, #00A396 0%, #00F2FE 100%)", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", fontWeight: 800, flexShrink: 0 }}>
                  {msg.avatar}
                </div>

                {/* Message Content & Actions */}
                <div style={{ flex: 1 }}>
                  {/* Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                      <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#1F2A44" }}>{msg.author}</span>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{msg.timestamp}</span>
                    </div>
                    {/* Admin Delete Post Button */}
                    {role === "admin" && (
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#EF4444",
                          cursor: "pointer",
                          padding: "0.2rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "4px",
                          transition: "background 0.2s"
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "#FEE2E2"}
                        onMouseLeave={e => e.currentTarget.style.background = "none"}
                        title="Delete Post"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {/* Body */}
                  <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "0.85rem" }}>
                    {msg.content}
                  </div>

                  {/* Action Bar (Reactions, Replies Count & Respond Button) */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.6rem" }}>
                    {/* Reaction pills */}
                    <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
                      {Object.entries(msg.reactions).map(([emoji, count]: any) => (
                        <button
                          key={emoji}
                          onClick={() => handleToggleReaction(msg.id, emoji)}
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
                          onMouseEnter={e => e.currentTarget.style.borderColor = "var(--primary)"}
                          onMouseLeave={e => { if (count === 0) e.currentTarget.style.borderColor = "var(--border)"; }}
                        >
                          <span>{emoji}</span>
                          <span style={{ fontWeight: 750 }}>{count}</span>
                        </button>
                      ))}
                    </div>

                    {/* Right side: replies count + Respond button */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <button
                        onClick={() => setExpandedMessageId(expandedMessageId === msg.id ? null : msg.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--text-muted)",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          padding: "0.25rem 0"
                        }}
                      >
                        💬 {msg.replies.length} {msg.replies.length === 1 ? "response" : "responses"}
                      </button>

                      {/* ── Respond Button ─────────────────────────────── */}
                      <button
                        onClick={() => handleOpenRespond(msg.id)}
                        style={{
                          background: expandedMessageId === msg.id
                            ? "linear-gradient(135deg, #F25AA7 0%, #FF7BC0 100%)"
                            : "#F8FAFC",
                          border: expandedMessageId === msg.id
                            ? "1.5px solid #F25AA7"
                            : "1.5px solid var(--border)",
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
                        onMouseEnter={e => {
                          if (expandedMessageId !== msg.id) {
                            e.currentTarget.style.borderColor = "var(--primary)";
                            e.currentTarget.style.color = "var(--primary)";
                          }
                        }}
                        onMouseLeave={e => {
                          if (expandedMessageId !== msg.id) {
                            e.currentTarget.style.borderColor = "var(--border)";
                            e.currentTarget.style.color = "var(--text-primary)";
                          }
                        }}
                      >
                        <CornerDownRight size={13} />
                        Respond
                      </button>
                    </div>
                  </div>

                  {/* Sub-threads (Replies) — expanded panel */}
                  {expandedMessageId === msg.id && (
                    <div style={{ marginTop: "1rem", background: "#F8FAFC", borderRadius: "12px", padding: "1.25rem 1rem", display: "flex", flexDirection: "column", gap: "1rem", borderLeft: "3.5px solid var(--primary)" }}>
                      {/* Existing Replies */}
                      {msg.replies.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                          {msg.replies.map((reply: any) => (
                            <div key={reply.id} style={{ display: "flex", gap: "0.75rem" }}>
                              <div style={{ width: 28, height: 28, borderRadius: "50%", background: reply.avatar === "AD" ? "#22324A" : "rgba(148, 163, 184, 0.2)", color: reply.avatar === "AD" ? "#FFF" : "var(--text-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800, flexShrink: 0 }}>
                                {reply.avatar}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.15rem" }}>
                                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem" }}>
                                    <span style={{ fontWeight: 800, fontSize: "0.85rem", color: "#1F2A44" }}>{reply.author}</span>
                                    <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{reply.timestamp}</span>
                                  </div>
                                  {/* Admin Delete Reply Button */}
                                  {role === "admin" && (
                                    <button
                                      onClick={() => handleDeleteReply(msg.id, reply.id)}
                                      style={{
                                        background: "none",
                                        border: "none",
                                        color: "#EF4444",
                                        cursor: "pointer",
                                        padding: "0.15rem",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius: "4px",
                                        transition: "background 0.2s"
                                      }}
                                      onMouseEnter={e => e.currentTarget.style.background = "#FEE2E2"}
                                      onMouseLeave={e => e.currentTarget.style.background = "none"}
                                      title="Delete Reply"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  )}
                                </div>
                                <div style={{ fontSize: "0.825rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                                  {reply.content}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ── Reply Composer ──────────────────────────────── */}
                      <div style={{ marginTop: msg.replies.length > 0 ? "0.5rem" : 0, borderTop: msg.replies.length > 0 ? "1px solid #E5E7EB" : "none", paddingTop: msg.replies.length > 0 ? "0.75rem" : 0 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: "50%",
                            background: role === "admin" ? "#22324A" : "var(--primary-light)",
                            color: role === "admin" ? "#fff" : "var(--primary)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: 800, fontSize: "0.75rem", flexShrink: 0, marginTop: "0.25rem"
                          }}>
                            {userAvatar}
                          </div>
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <textarea
                              ref={el => { replyInputRefs.current[msg.id] = el; }}
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
                              style={{
                                width: "100%",
                                border: "1.5px solid var(--border)",
                                borderRadius: "8px",
                                padding: "0.6rem 0.85rem",
                                fontSize: "0.85rem",
                                outline: "none",
                                background: "#FFF",
                                resize: "none",
                                fontFamily: "inherit",
                                lineHeight: 1.5,
                                boxSizing: "border-box",
                                transition: "border-color 0.2s"
                              }}
                              onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
                              onBlur={e => e.currentTarget.style.borderColor = "var(--border)"}
                            />
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                              <button
                                onClick={() => setExpandedMessageId(null)}
                                style={{
                                  background: "#F1F5F9",
                                  border: "1.5px solid var(--border)",
                                  borderRadius: "999px",
                                  padding: "0.4rem 1rem",
                                  fontSize: "0.8rem",
                                  fontWeight: 600,
                                  color: "var(--text-secondary)",
                                  cursor: "pointer"
                                }}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSendReply(msg.id)}
                                style={{
                                  background: role === "admin"
                                    ? "#22324A"
                                    : "linear-gradient(135deg, #F25AA7 0%, #FF7BC0 100%)",
                                  color: "#FFF",
                                  border: "none",
                                  borderRadius: "999px",
                                  padding: "0.4rem 1.25rem",
                                  fontSize: "0.8rem",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.35rem",
                                  boxShadow: "0 4px 12px rgba(242, 90, 167, 0.25)"
                                }}
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
