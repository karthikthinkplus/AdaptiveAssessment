"use client";
import AppShell from "@/components/layout/AppShell";
import { Upload, FileDown, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function QBMUploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);

  const handleDownloadTemplate = () => {
    const csvContent = 
      "Question Text,Option A,Option B,Option C,Option D,Correct Answer,Topic,Difficulty\n" +
      "\"Evaluate the polynomial P(x) = x^3 - 2x^2 + 5x - 7 at x = 2.\",\"1\",\"2\",\"3\",\"4\",\"C\",\"Algebra\",\"easy\"\n" +
      "\"A train moves with a speed of 72 km/h. How many meters does it cover in 15 seconds?\",\"300\",\"400\",\"500\",\"600\",\"A\",\"Arithmetic\",\"very_hard\"\n";
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "thinkplus_questions_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setSuccess(true);
    setTimeout(() => {
      setFile(null);
      setSuccess(false);
    }, 2500);
  };

  return (
    <AppShell title="Bulk Upload Questions">
      {/* ── Actions Row ────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
        <button 
          onClick={handleDownloadTemplate}
          className="tp-btn-secondary" 
          style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <FileDown size={16} /> Download Template
        </button>
      </div>

      {success && (
        <div className="animate-scale-in" style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "var(--success-light)", color: "var(--success)", padding: "0.75rem 1rem", borderRadius: "8px", fontSize: "0.875rem", fontWeight: 600, marginBottom: "1.5rem" }}>
          <CheckCircle2 size={18} />
          <span>Questions file parsed and uploaded successfully! Pending review count updated.</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: "1.5rem" }}>
        {/* Upload Box Card */}
        <div className="tp-card animate-fade-in-up stagger-1" style={{ display: "flex", flexDirection: "column" }}>
          <form onSubmit={handleUploadSubmit} onDragEnter={handleDrag} style={{ display: "flex", flexDirection: "column", flex: 1, gap: "1.25rem" }}>
            <div
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              style={{
                border: "2px dashed var(--border)",
                borderRadius: "10px",
                padding: "3rem 1.5rem",
                textAlign: "center",
                background: dragActive ? "var(--primary-light)" : "var(--surface)",
                borderColor: dragActive ? "var(--primary)" : "var(--border)",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <input type="file" id="file-upload" accept=".csv,.xlsx,.xls" style={{ display: "none" }} onChange={handleFileChange} />
              <label htmlFor="file-upload" style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
                  <Upload size={22} />
                </div>
                <div>
                  <span style={{ fontWeight: 700, color: "var(--primary)", fontSize: "0.9375rem" }}>Click to upload</span> or drag and drop
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Supports CSV, XLSX up to 10MB
                </div>
              </label>
            </div>

            {file && (
              <div style={{ padding: "0.75rem 1rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{file.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{(file.size / 1024).toFixed(1)} KB</div>
                </div>
                <button type="button" onClick={() => setFile(null)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600 }}>Remove</button>
              </div>
            )}

            <button type="submit" disabled={!file} className="tp-btn-primary" style={{ width: "100%", justifyContent: "center", padding: "0.625rem", fontSize: "0.875rem", opacity: file ? 1 : 0.6 }}>
              Start Upload and Processing
            </button>
          </form>
        </div>

        {/* Requirements Card */}
        <div className="tp-card animate-fade-in-up stagger-2" style={{ height: "fit-content" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 700, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <AlertCircle size={16} color="var(--primary)" /> Guidelines
          </h3>
          <ul style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "0.5rem", paddingLeft: "1.25rem", margin: 0, lineHeight: 1.5 }}>
            <li>Template has 7 headers: <code>Question Text</code>, <code>Option A</code>, <code>Option B</code>, <code>Option C</code>, <code>Option D</code>, <code>Correct Answer</code>, <code>Topic</code>.</li>
            <li>Do not modify, reorder or add columns to headers.</li>
            <li>Allowed difficulties: <code>very_easy</code>, <code>easy</code>, <code>medium</code>, <code>hard</code>, <code>very_hard</code>.</li>
            <li>Ensure correct answer option matches the key (A, B, C, or D).</li>
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
