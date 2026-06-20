"use client";
import AppShell from "@/components/layout/AppShell";
import { Terminal } from "lucide-react";

export default function AdminAuditPage() {
  const logs = [
    { id: "L901", action: "Settings Update", user: "Admin User (Admin)", target: "requireEmailVerification -> true", ip: "192.168.1.45", time: "Jun 17, 2026 17:10" },
    { id: "L902", action: "User Deactivation", user: "Admin User (Admin)", target: "student:sunita@example.com", ip: "192.168.1.45", time: "Jun 17, 2026 16:30" },
    { id: "L903", action: "Bulk Question Upload", user: "Ravi Kumar (QBM)", target: "Question Bank [Math: 25 items]", ip: "192.168.1.12", time: "Jun 17, 2026 15:45" },
    { id: "L904", action: "Institution Registration", user: "Admin User (Admin)", target: "Institution [Delhi Public School]", ip: "192.168.1.45", time: "Jun 16, 2026 11:20" },
  ];

  return (
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
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
