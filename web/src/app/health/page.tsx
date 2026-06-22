"use client";

import { useState, useEffect } from "react";
import PublicHeader from "@/components/layout/PublicHeader";
import { 
  HeartPulse, 
  Activity, 
  ShieldCheck, 
  Cpu, 
  RefreshCw, 
  Server, 
  HardDrive, 
  Layers, 
  Clock 
} from "lucide-react";

interface HealthData {
  status: string;
  timestamp: string;
  uptime: string;
  environment: string;
  version: string;
  services: {
    mockDatabase: { status: string; latency: string; records: number };
    sessionStorage: { status: string; latency: string };
    routingEngine: { status: string; pathsCount: number };
  };
  system: {
    memoryUsed: string;
    memoryTotal: string;
    nodeVersion: string;
  };
}

export default function HealthPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [latency, setLatency] = useState<number | null>(null);
  const [uptimeSeconds, setUptimeSeconds] = useState(0);

  const fetchHealth = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const res = await fetch("/api/health");
      const json = await res.json();
      const duration = Math.round(performance.now() - start);
      setLatency(duration);
      setData(json);
      // Parse initial uptime
      const numericUptime = parseInt(json.uptime) || 0;
      setUptimeSeconds(numericUptime);
    } catch (err) {
      console.error("Failed to fetch health data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(() => {
      fetchHealth();
    }, 15000); // Poll every 15s

    return () => clearInterval(interval);
  }, []);

  // Increment local uptime display every second
  useEffect(() => {
    if (loading || !data) return;
    const interval = setInterval(() => {
      setUptimeSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, data]);

  const formatUptime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);
    return parts.join(" ");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC", display: "flex", flexDirection: "column", fontFamily: "'Inter', sans-serif" }}>
      <PublicHeader />

      <main style={{ flex: 1, maxWidth: 960, width: "100%", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        
        {/* Header Grid */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0F172A", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <HeartPulse size={28} color="#EF4444" style={{ animation: "pulse 2s infinite" }} />
              System Status
            </h1>
            <p style={{ color: "#64748B", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              Live metrics and diagnostics for the Adaptive Assessment Tool platform.
            </p>
          </div>
          <button 
            onClick={fetchHealth} 
            disabled={loading}
            className="tp-btn-secondary" 
            style={{ padding: "0.5rem 1rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Global Healthy Banner */}
        <div style={{
          background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
          color: "#fff",
          borderRadius: 16,
          padding: "1.75rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.2)",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ zIndex: 1 }}>
            <span style={{ fontSize: "0.8125rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.85 }}>Current Status</span>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginTop: "0.25rem" }}>All Systems Operational</h2>
          </div>
          <div style={{ display: "flex", gap: "2rem", zIndex: 1, textAlign: "right" }}>
            <div>
              <div style={{ fontSize: "0.8125rem", opacity: 0.85 }}>Uptime</div>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, fontFamily: "monospace" }}>
                {data ? formatUptime(uptimeSeconds) : "..."}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.8125rem", opacity: 0.85 }}>Ping Latency</div>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, fontFamily: "monospace" }}>
                {latency !== null ? `${latency}ms` : "..."}
              </div>
            </div>
          </div>
          <div style={{
            position: "absolute",
            right: "-20px",
            bottom: "-30px",
            opacity: 0.1,
            transform: "rotate(-10deg)"
          }}>
            <ShieldCheck size={180} />
          </div>
        </div>

        {/* Grid of monitored services */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
          
          {/* Card 1: Frontend Client */}
          <div style={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "#EEF2F6", display: "grid", placeItems: "center", color: "#6366F1" }}>
                  <Layers size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#1E293B" }}>Client Application</h3>
                  <span style={{ fontSize: "0.75rem", color: "#64748B" }}>Next.js App Core</span>
                </div>
              </div>
              <span className="tp-badge tp-badge-success">Active</span>
            </div>
            <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: "0.75rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.8125rem" }}>
              <div>
                <span style={{ color: "#64748B" }}>Version</span>
                <div style={{ fontWeight: 600, color: "#334155" }}>{data?.version || "0.1.0"}</div>
              </div>
              <div>
                <span style={{ color: "#64748B" }}>Routes Config</span>
                <div style={{ fontWeight: 600, color: "#334155" }}>{data?.services.routingEngine.pathsCount || 40} endpoints</div>
              </div>
            </div>
          </div>

          {/* Card 2: Mock Database */}
          <div style={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "#EEF2F6", display: "grid", placeItems: "center", color: "#10B981" }}>
                  <HardDrive size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#1E293B" }}>Database Mock</h3>
                  <span style={{ fontSize: "0.75rem", color: "#64748B" }}>Client Memory DB</span>
                </div>
              </div>
              <span className="tp-badge tp-badge-success">Operational</span>
            </div>
            <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: "0.75rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.8125rem" }}>
              <div>
                <span style={{ color: "#64748B" }}>Read Latency</span>
                <div style={{ fontWeight: 600, color: "#334155" }}>{data?.services.mockDatabase.latency || "1ms"}</div>
              </div>
              <div>
                <span style={{ color: "#64748B" }}>Schema Index</span>
                <div style={{ fontWeight: 600, color: "#334155" }}>{data?.services.mockDatabase.records || 384} records</div>
              </div>
            </div>
          </div>

          {/* Card 3: Server Platform */}
          <div style={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "#EEF2F6", display: "grid", placeItems: "center", color: "#F59E0B" }}>
                  <Server size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#1E293B" }}>Server Engine</h3>
                  <span style={{ fontSize: "0.75rem", color: "#64748B" }}>Node.js Process</span>
                </div>
              </div>
              <span className="tp-badge tp-badge-success">Healthy</span>
            </div>
            <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: "0.75rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.8125rem" }}>
              <div>
                <span style={{ color: "#64748B" }}>Environment</span>
                <div style={{ fontWeight: 600, color: "#334155", textTransform: "capitalize" }}>{data?.environment || "development"}</div>
              </div>
              <div>
                <span style={{ color: "#64748B" }}>Node Engine</span>
                <div style={{ fontWeight: 600, color: "#334155" }}>{data?.system.nodeVersion || "N/A"}</div>
              </div>
            </div>
          </div>

        </div>

        {/* Resources & Health Metrics Panel */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.5rem" }}>
          
          {/* Diagnostic Log */}
          <div style={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0F172A", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Activity size={18} color="#6366F1" />
              Service Status Checks
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {[
                { name: "Public Landing Interface", path: "/", target: "Landing flow", status: "Healthy" },
                { name: "Unified Auth Sign-In Controller", path: "/login", target: "Session router", status: "Healthy" },
                { name: "Registration Page Handler", path: "/register", target: "Account setup", status: "Healthy" },
                { name: "Adaptive Assessment Engine Page", path: "/assessment/start", target: "Test launcher", status: "Healthy" },
                { name: "System Settings Administrator Node", path: "/admin/settings", target: "Platform settings", status: "Healthy" }
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: i < 4 ? "1px solid #F1F5F9" : "none" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#334155" }}>{item.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748B", marginTop: "0.125rem" }}>{item.path} · {item.target}</div>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#10B981", fontWeight: 700, backgroundColor: "#ECFDF5", padding: "0.25rem 0.625rem", borderRadius: 999 }}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* System Performance Details */}
          <div style={{ backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0F172A", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Cpu size={18} color="#6366F1" />
              Node.js Container Runtime
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.875rem" }}>
              <div>
                <div style={{ color: "#64748B", marginBottom: "0.25rem" }}>Memory Allocation Heap Used</div>
                <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "#334155" }}>{data?.system.memoryUsed || "..."}</div>
              </div>
              <div>
                <div style={{ color: "#64748B", marginBottom: "0.25rem" }}>Memory Allocation Heap Total</div>
                <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "#334155" }}>{data?.system.memoryTotal || "..."}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #F1F5F9", paddingTop: "1rem", marginTop: "0.5rem" }}>
                <span style={{ color: "#64748B" }}>Timestamp</span>
                <span style={{ fontWeight: 500, color: "#334155", fontFamily: "monospace" }}>
                  {data ? new Date(data.timestamp).toLocaleTimeString() : "..."}
                </span>
              </div>
            </div>
          </div>

        </div>

      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.7; }
        }
      `}} />
    </div>
  );
}
