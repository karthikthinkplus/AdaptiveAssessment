"use client";
import RouteGuard from "@/components/auth/RouteGuard";
import AppShell from "@/components/layout/AppShell";
import { Upload, FileDown, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { readSessionUser } from "@/lib/browserState";

export default function QBMUploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);
  const [user] = useState(() => readSessionUser({ name: "QBM Developer", avatar: "RK", role: "qbm" }));

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch("/api/v1/uploads/question-bank/template", {
        headers: {
          "Authorization": `Bearer ${sessionStorage.getItem("tp_token")}`
        }
      });
      if (!response.ok) throw new Error("Failed to download template");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "question-bank-template.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert("Error downloading template: " + err.message);
    }
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
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith(".xlsx")) {
        setFile(droppedFile);
      } else {
        alert("Only .xlsx files are supported by the backend");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith(".xlsx")) {
        setFile(selectedFile);
      } else {
        alert("Only .xlsx files are supported by the backend");
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/v1/uploads/question-bank", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${sessionStorage.getItem("tp_token")}`
        },
        body: formData
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || "Failed to upload file");
      }

      setSuccess(true);
      setFile(null);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    }
  };

  return (
    <RouteGuard allowedRoles={["qbm","content_manager"]}>
    <AppShell role="qbm" userName={user.name} userAvatar={user.avatar} title="Bulk Upload Questions">
      {/* -- Actions Row ---------------------------------------------- */}
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
              <input type="file" id="file-upload" accept=".xlsx" style={{ display: "none" }} onChange={handleFileChange} />
              <label htmlFor="file-upload" style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
                  <Upload size={22} />
                </div>
                <div>
                  <span style={{ fontWeight: 700, color: "var(--primary)", fontSize: "0.9375rem" }}>Click to upload</span> or drag and drop
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Supports XLSX up to 10MB
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
            <li>Please use the downloaded active template file (.xlsx format only).</li>
            <li>Allowed difficulties: <code>very_easy</code>, <code>easy</code>, <code>medium</code>, <code>hard</code>, <code>very_hard</code>.</li>
            <li>Ensure correct answer matches standard column formats (A, B, C, D, or E).</li>
          </ul>
        </div>
      </div>
    </AppShell>
    </RouteGuard>
  );
}
