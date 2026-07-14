"use client";

import RouteGuard from "@/components/auth/RouteGuard";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { readSessionUser } from "@/lib/browserState";
import { CheckCircle2, ImagePlus, Link as LinkIcon, MessageCircleQuestion, Send, X } from "lucide-react";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";

type Doubt = {
  id: string;
  question_text: string;
  image_data?: string | null;
  status: "unresolved" | "resolved";
  duplicate_count: number;
  explanation_text?: string | null;
  explanation_link?: string | null;
  explanation_image_data?: string | null;
};

const readImage = (file: File, onReady: (value: string) => void) => {
  if (!file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === "string") onReady(reader.result);
  };
  reader.readAsDataURL(file);
};

export default function TeacherDoubtsPage() {
  const [user] = useState(() => readSessionUser({ name: "Teacher", avatar: "T", role: "teacher" }));
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [explanationText, setExplanationText] = useState("");
  const [explanationLink, setExplanationLink] = useState("");
  const [explanationImage, setExplanationImage] = useState<string | undefined>();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const primeResolutionForm = useCallback((doubt: Doubt) => {
    setActiveId(doubt.id);
    setExplanationText(doubt.explanation_text || "");
    setExplanationLink(doubt.explanation_link || "");
    setExplanationImage(doubt.explanation_image_data || undefined);
  }, []);

  const loadDoubts = useCallback(() => {
    api.get<Doubt[]>("/api/v1/doubts/teacher")
      .then((items) => {
        setDoubts(items);
        if (!activeId && items.length > 0) {
          primeResolutionForm(items[0]);
        }
      })
      .catch((err) => setMessage(err.message || "Could not load doubts."));
  }, [activeId, primeResolutionForm]);

  useEffect(() => {
    loadDoubts();
  }, [loadDoubts]);

  const activeDoubt = doubts.find((doubt) => doubt.id === activeId) || doubts[0];

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) readImage(file, setExplanationImage);
    event.target.value = "";
  };

  const resolveDoubt = async () => {
    if (!activeDoubt || !explanationText.trim()) return;
    setLoading(true);
    setMessage("");
    try {
      await api.post(`/api/v1/doubts/${activeDoubt.id}/resolve`, {
        explanation_text: explanationText.trim(),
        explanation_link: explanationLink.trim() || null,
        explanation_image_data: explanationImage
      });
      setMessage("Doubt resolved. Future matching doubts will fetch this explanation automatically.");
      loadDoubts();
    } catch (err: any) {
      setMessage(err.message || "Could not resolve doubt.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RouteGuard allowedRoles={["teacher"]}>
      <AppShell role="teacher" userName={user.name} userAvatar={user.avatar} title="Doubts">
        <div className="teacher-doubts-page">
          <aside className="teacher-doubts-list">
            <h1>Doubts Bucket</h1>
            <p>Students stay anonymous. Repeated doubts are grouped for one response.</p>
            {doubts.length === 0 ? (
              <div className="doubts-empty"><MessageCircleQuestion size={30} /> No doubts in the bucket.</div>
            ) : (
              doubts.map((doubt) => (
                <button
                  key={doubt.id}
                  type="button"
                  className={`teacher-doubt-item ${activeDoubt?.id === doubt.id ? "active" : ""}`}
                  onClick={() => primeResolutionForm(doubt)}
                >
                  <span className={`doubt-status ${doubt.status}`}>{doubt.status}</span>
                  <strong>{doubt.question_text}</strong>
                  <small>{doubt.duplicate_count} student{doubt.duplicate_count === 1 ? "" : "s"} raised this</small>
                </button>
              ))
            )}
          </aside>

          <main className="teacher-doubt-workspace">
            {activeDoubt ? (
              <>
                <div className="teacher-doubt-question">
                  <div>
                    <span className={`doubt-status ${activeDoubt.status}`}>{activeDoubt.status}</span>
                    <h2>Anonymous doubt</h2>
                    <p>{activeDoubt.question_text}</p>
                  </div>
                  <strong>{activeDoubt.duplicate_count} asks</strong>
                </div>
                {activeDoubt.image_data && <img className="teacher-doubt-image" src={activeDoubt.image_data} alt="Student doubt attachment" />}

                <section className="teacher-resolution-card">
                  <h3>Resolution</h3>
                  <textarea
                    value={explanationText}
                    onChange={(event) => setExplanationText(event.target.value)}
                    rows={7}
                    placeholder="Type the explanation students should receive..."
                  />
                  <label className="teacher-link-field">
                    <LinkIcon size={15} />
                    <input value={explanationLink} onChange={(event) => setExplanationLink(event.target.value)} placeholder="Optional reference link" />
                  </label>
                  {explanationImage && (
                    <div className="doubt-image-preview">
                      <img src={explanationImage} alt="Teacher explanation preview" />
                      <button type="button" onClick={() => setExplanationImage(undefined)}><X size={14} /></button>
                    </div>
                  )}
                  <div className="doubts-actions">
                    <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                    <button type="button" className="tp-btn-ghost" onClick={() => imageInputRef.current?.click()}>
                      <ImagePlus size={16} /> Add Image
                    </button>
                    <button type="button" className="tp-btn-primary" disabled={loading || !explanationText.trim()} onClick={resolveDoubt}>
                      {activeDoubt.status === "resolved" ? <CheckCircle2 size={16} /> : <Send size={16} />}
                      {loading ? "Saving..." : activeDoubt.status === "resolved" ? "Update Explanation" : "Resolve Doubt"}
                    </button>
                  </div>
                  {message && <p className="doubts-message">{message}</p>}
                </section>
              </>
            ) : (
              <div className="doubts-empty"><MessageCircleQuestion size={30} /> Select a doubt to resolve.</div>
            )}
          </main>
        </div>
      </AppShell>
    </RouteGuard>
  );
}
