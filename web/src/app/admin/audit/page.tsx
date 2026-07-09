"use client";
import RouteGuard from "@/components/auth/RouteGuard";
import AppShell from "@/components/layout/AppShell";
import { Terminal } from "lucide-react";
import { useState } from "react";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);

  return (
    <RouteGuard allowedRoles={["admin"]}>
    <AppShell title="System Audit Logs">


      <div className="tp-card animate-fade-in-up">
        <table className="tp-table">
          <thead>
            <tr>
              <th>Log ID</th>
              <th>Action</th>
              <th>Triggered By</th>
              <th>Target Entity</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td style={{ fontWeight: 600, fontFamily: "monospace" }}>{log.id}</td>
                <td style={{ fontWeight: 700 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Terminal size={14} color="var(--primary)" />
                    <span>{log.action}</span>
                  </div>
                </td>
                <td>{log.user}</td>
                <td><code style={{ fontSize: "0.75rem", padding: "0.125rem 0.25rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 4 }}>{log.target}</code></td>
                <td>{log.time}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "var(--text-secondary)", padding: "2.5rem" }}>
                  No system audit events logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
    </RouteGuard>
  );
}
