"use client";

import RouteGuard from "@/components/auth/RouteGuard";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { readSessionUser } from "@/lib/browserState";
import { ImagePlus, Inbox, Send, X } from "lucide-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";

type Doubt = {
  id: string;
  question_text: string;
  image_data?: string | null;
  status: "unresolved" | "resolved";
  duplicate_count: number;
  explanation_text?: string | null;
  explanation_link?: string | null;
  explanation_image_data?: string | null;
  created_at: string;
};

const readImage = (file: File, onReady: (value: string) => void) => {
  if (!file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === "string") onReady(reader.result);
  };
  reader.readAsDataURL(file);
};

export default function StudentDoubtsPage() {
  const [user] = useState(() => readSessionUser({ name: "Student", avatar: "S", role: "student" }));
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [questionText, setQuestionText] = useState("");
  const [imageData, setImageData] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const loadDoubts = () => {
    api.get<Doubt[]>("/api/v1/doubts/mine")
      .then(setDoubts)
      .catch((err) => setMessage(err.message || "Could not load doubts."));
  };

  useEffect(() => {
    loadDoubts();
  }, []);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) readImage(file, setImageData);
    event.target.value = "";
  };

  const submitDoubt = async () => {
    if (!questionText.trim()) return;
    setLoading(true);
    setMessage("");
    try {
      const created = await api.post<Doubt>("/api/v1/doubts", {
        question_text: questionText.trim(),
        image_data: imageData
      });
      setQuestionText("");
      setImageData(undefined);
      setMessage(created.status === "resolved" ? "This doubt was already solved. Explanation fetched from the bucket." : "Doubt added to the bucket.");
      loadDoubts();
    } catch (err: any) {
      setMessage(err.message || "Could not add doubt.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RouteGuard allowedRoles={["student"]}>
      <AppShell role="student" userName={user.name} userAvatar={user.avatar} title="Doubts Bucket">
        <div className="doubts-page">
          <section className="doubts-compose">
            <div>
              <h1>Doubts Bucket</h1>
              <p>Add a doubt once. If it has already been solved, the explanation appears automatically.</p>
            </div>
            <textarea
              value={questionText}
              onChange={(event) => setQuestionText(event.target.value)}
              placeholder="Type your doubt here..."
              rows={5}
            />
            {imageData && (
              <div className="doubt-image-preview">
                <img src={imageData} alt="Doubt attachment preview" />
                <button type="button" onClick={() => setImageData(undefined)}><X size={14} /></button>
              </div>
            )}
            <div className="doubts-actions">
              <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
              <button type="button" className="tp-btn-ghost" onClick={() => imageInputRef.current?.click()}>
                <ImagePlus size={16} /> Add Image
              </button>
              <button type="button" className="tp-btn-primary" disabled={loading || !questionText.trim()} onClick={submitDoubt}>
                <Send size={16} /> {loading ? "Adding..." : "Add to Bucket"}
              </button>
            </div>
            {message && <p className="doubts-message">{message}</p>}
          </section>

          <section className="doubts-list">
            <h2>My Doubts</h2>
            {doubts.length === 0 ? (
              <div className="doubts-empty"><Inbox size={30} /> No doubts added yet.</div>
            ) : (
              doubts.map((doubt) => (
                <article key={doubt.id} className="doubt-card">
                  <div className="doubt-card-head">
                    <span className={`doubt-status ${doubt.status}`}>{doubt.status}</span>
                    <small>{doubt.duplicate_count > 1 ? `${doubt.duplicate_count} students asked this` : "Added to bucket"}</small>
                  </div>
                  <p>{doubt.question_text}</p>
                  {doubt.image_data && <img src={doubt.image_data} alt="Doubt attachment" />}
                  {doubt.status === "resolved" && (
                    <div className="doubt-answer">
                      <strong>Explanation</strong>
                      <p>{doubt.explanation_text}</p>
                      {doubt.explanation_link && <a href={doubt.explanation_link} target="_blank" rel="noreferrer">{doubt.explanation_link}</a>}
                      {doubt.explanation_image_data && <img src={doubt.explanation_image_data} alt="Teacher explanation attachment" />}
                    </div>
                  )}
                </article>
              ))
            )}
          </section>
        </div>
      </AppShell>
    </RouteGuard>
  );
}
