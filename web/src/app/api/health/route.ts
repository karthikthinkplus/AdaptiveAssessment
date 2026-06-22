import { NextResponse } from "next/server";

const START_TIME = Date.now();

export async function GET() {
  const uptime = Math.floor((Date.now() - START_TIME) / 1000);
  const memory = typeof process !== "undefined" && process.memoryUsage ? process.memoryUsage() : null;

  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: `${uptime}s`,
    environment: process.env.NODE_ENV || "development",
    version: "0.1.0",
    services: {
      mockDatabase: { status: "healthy", latency: "1ms", records: 384 },
      sessionStorage: { status: "active", latency: "0ms" },
      routingEngine: { status: "operational", pathsCount: 40 }
    },
    system: {
      memoryUsed: memory ? `${Math.round(memory.heapUsed / 1024 / 1024)} MB` : "N/A",
      memoryTotal: memory ? `${Math.round(memory.heapTotal / 1024 / 1024)} MB` : "N/A",
      nodeVersion: process.version || "N/A"
    }
  });
}
