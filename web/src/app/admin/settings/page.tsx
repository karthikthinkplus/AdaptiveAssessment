"use client";
import AppShell from "@/components/layout/AppShell";
import { PLATFORM_SETTINGS } from "@/lib/mockData";
import { Save, Settings } from "lucide-react";
import { useState } from "react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(PLATFORM_SETTINGS);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppShell role="admin" userName="Ravi Kumar" userAvatar="RK" title="System Settings">
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>

        {saved && (
          <div className="animate-scale-in" style={{ background: "var(--success-light)", color: "var(--success)", padding: "0.75rem 1rem", borderRadius: "8px", fontSize: "0.875rem", fontWeight: 600, marginBottom: "1.5rem" }}>
            ✓ Settings saved successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* General Config Card */}
          <div className="tp-card animate-fade-in-up stagger-1">
            <h2 style={{ fontSize: "0.9375rem", fontWeight: 700, marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Settings size={18} color="var(--primary)" /> General Settings
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "0.375rem" }}>Platform Name</label>
                  <input type="text" className="tp-input" value={settings.platformName} onChange={(e) => setSettings({ ...settings, platformName: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "0.375rem" }}>Support Email</label>
                  <input type="email" className="tp-input" value={settings.supportEmail} onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "0.375rem" }}>Timezone</label>
                  <select className="tp-select" value={settings.defaultTimezone} onChange={(e) => setSettings({ ...settings, defaultTimezone: e.target.value })}>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="UTC">UTC / GMT</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "0.375rem" }}>Date Format</label>
                  <input type="text" className="tp-input" value={settings.dateFormat} onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })} />
                </div>
              </div>
            </div>
          </div>



          {/* Form submit button below the edits */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
            <button type="submit" className="tp-btn-primary" style={{ padding: "0.625rem 1.5rem", fontSize: "0.9375rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <Save size={16} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
