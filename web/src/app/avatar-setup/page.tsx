"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { MOCK_AVATARS, AvatarItem } from "@/lib/avatarsData";

export default function AvatarSetupPage() {
  const router = useRouter();
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarItem | null>(null);
  const [saving, setSaving] = useState(false);

  const handleContinue = async () => {
    if (!selectedAvatar) return;
    setSaving(true);

    try {
      const session = sessionStorage.getItem("tp_user");
      if (session) {
        const parsed = JSON.parse(session);
        parsed.avatar = selectedAvatar.imageSrc;
        sessionStorage.setItem("tp_user", JSON.stringify(parsed));
      }
    } catch (err) {
      console.error("Failed to save avatar", err);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    router.push("/student/dashboard");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #F8FAFF 0%, #FFF0F9 50%, #F0F4FF 100%)",
      fontFamily: "'Inter', sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1rem",
      position: "relative",
      overflow: "hidden"
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .av-setup-fade { animation: fade-in-up 0.5s ease both; }
        .av-item { transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s; }
        .av-item:hover { transform: translateY(-3px) scale(1.04); box-shadow: 0 8px 20px rgba(121,40,202,0.13); }
      `}} />

      <div style={{
        position: "absolute",
        top: "-100px",
        left: "-100px",
        width: 340,
        height: 340,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(121,40,202,0.07) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute",
        bottom: "-80px",
        right: "-80px",
        width: 280,
        height: 280,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(238,13,126,0.06) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />

      <Link href="/" style={{ display: "inline-flex", justifyContent: "center", marginBottom: "1.5rem", zIndex: 10 }}>
        <img src="/logo.png" alt="ThinkPlus" style={{ height: "38px", width: "auto" }} />
      </Link>

      <div className="av-setup-fade" style={{
        width: "100%",
        maxWidth: "480px",
        backgroundColor: "#ffffff",
        borderRadius: "18px",
        boxShadow: "0 18px 44px -18px rgba(0,0,0,0.14), 0 0 0 1px rgba(121,40,202,0.08)",
        overflow: "hidden",
        zIndex: 10,
        padding: "1.25rem"
      }}>
        <div style={{ marginBottom: "0.9rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#1E293B", marginBottom: "0.1rem" }}>
            Choose your character
          </h2>
          <p style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
            {MOCK_AVATARS.length} avatars to choose from
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(84px, 1fr))",
          gap: "0.55rem",
          paddingBottom: "0.25rem"
        }}>
          {MOCK_AVATARS.map(av => {
            const isChosen = selectedAvatar?.id === av.id;

            return (
              <button
                type="button"
                key={av.id}
                className="av-item"
                onClick={() => setSelectedAvatar(av)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: "pointer",
                  padding: "0.55rem 0.35rem 0.45rem",
                  borderRadius: "12px",
                  border: isChosen ? "2px solid #A089E6" : "2px solid rgba(160,137,230,0.1)",
                  backgroundColor: isChosen ? "#F5F0FF" : "#FAFAFA",
                  gap: "0.35rem"
                }}
              >
                <div style={{
                  width: 54,
                  height: 54,
                  borderRadius: "50%",
                  background: av.bgGradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
                  border: "3px solid #fff",
                  overflow: "hidden",
                  flexShrink: 0
                }}>
                  <img src={av.imageSrc} alt={av.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <span style={{
                  fontSize: "0.625rem",
                  fontWeight: isChosen ? 700 : 500,
                  color: isChosen ? "#A089E6" : "#64748B",
                  textAlign: "center",
                  lineHeight: 1.3,
                  width: "100%"
                }}>
                  {av.name}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedAvatar || saving}
          style={{
            width: "100%",
            background: selectedAvatar ? "linear-gradient(135deg, #F25AA7 0%, #FF7BC0 100%)" : "#E2E8F0",
            color: selectedAvatar ? "#fff" : "#94A3B8",
            border: "none",
            borderRadius: "12px",
            padding: "0.85rem",
            marginTop: "0.9rem",
            fontWeight: 800,
            fontSize: "0.875rem",
            cursor: selectedAvatar ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            boxShadow: selectedAvatar ? "0 10px 24px rgba(242, 90, 167, 0.22)" : "none"
          }}
        >
          {saving ? "Saving..." : selectedAvatar
            ? <><CheckCircle2 size={16} /> Save Avatar <ArrowRight size={16} /></>
            : "Select an Avatar First"}
        </button>
      </div>
    </div>
  );
}
