"use client";

import { useState } from "react";
import LinkNext from "next/link";
import { ChevronDown } from "lucide-react";

export default function PublicHeader() {
  const [showContact, setShowContact] = useState(false);
  return (
    <>
      <div
        style={{
          position: "fixed",
          top: "1rem",
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "0 4%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <header
          style={{
            width: "100%",
            maxWidth: "1200px",
            height: "56px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            borderRadius: "999px",
            padding: "0 1.5rem 0 2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
          }}
        >
          {/* Logo */}
          <LinkNext
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              textDecoration: "none",
            }}
          >
            <img src="/logo.png" alt="afterboards" style={{ height: "30px", width: "auto", display: "block" }} />
          </LinkNext>

          {/* Right Button */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
              <button
                onClick={() => setShowContact(!showContact)}
                className="nav-link"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#374151",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  padding: 0,
                  fontFamily: "inherit",
                }}
              >
                Contact
              </button>
              {showContact && (
                <>
                  <div
                    onClick={() => setShowContact(false)}
                    style={{
                      position: "fixed",
                      top: 0,
                      bottom: 0,
                      left: 0,
                      right: 0,
                      zIndex: 109,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 0.5rem)",
                      right: 0,
                      background: "#ffffff",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                      padding: "0.75rem 1rem",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      zIndex: 110,
                      whiteSpace: "nowrap",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "#6B7280", marginBottom: "0.15rem" }}>Call Us</div>
                      <a
                        href="tel:9581400055"
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 700,
                          color: "#F25AA7",
                          textDecoration: "none",
                        }}
                      >
                        9581400055
                      </a>
                    </div>
                    <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: "0.5rem" }}>
                      <div style={{ fontSize: "0.75rem", color: "#6B7280", marginBottom: "0.25rem" }}>WhatsApp Us</div>
                      <a
                        href="https://wa.me/919581400055"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 700,
                          color: "#10B981",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem",
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.324 5.328 0 11.896 0c3.181.001 6.171 1.242 8.423 3.496 2.253 2.253 3.491 5.244 3.491 8.425 0 6.574-5.324 11.9-11.896 11.9-2.001 0-3.96-.5-5.69-1.458L0 24zm6.59-4.846c1.6.95 3.1 1.453 4.887 1.453 5.4 0 9.794-4.393 9.794-9.793 0-2.615-1.017-5.074-2.866-6.924C16.513 2.04 14.053 1.022 11.438 1.022c-5.4 0-9.799 4.393-9.799 9.795 0 1.902.5 3.5 1.462 5.097L2.09 20.827l5.056-1.328zm12.355-6.852c-.31-.155-1.838-.908-2.12-.99-.283-.1-.488-.15-.694.156-.205.308-.797.99-.977 1.2-.18.2-.358.23-.668.075-.309-.155-1.306-.48-2.486-1.534-.918-.818-1.539-1.83-1.719-2.138-.18-.3-.02-.463.136-.617.14-.138.31-.36.463-.54.155-.18.206-.31.31-.515.1-.2.05-.38-.025-.536-.075-.156-.694-1.67-.95-2.285-.25-.6-.503-.52-.693-.53-.18-.01-.385-.01-.59-.01-.206 0-.54.078-.823.387-.282.31-1.077 1.051-1.077 2.561 0 1.51 1.099 2.97 1.253 3.176.155.206 2.164 3.3 5.241 4.63.732.315 1.302.503 1.747.644.735.233 1.402.2 1.93.122.589-.088 1.838-.75 2.096-1.473.257-.721.257-1.34.18-1.472-.077-.132-.283-.21-.59-.364z"/>
                        </svg>
                        <span>Chat on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </>
              )}
            </div>
            <LinkNext href="/login" className="nav-link" style={{ color: "#374151", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none" }}>
              Log in
            </LinkNext>
            <LinkNext
              href="/register"
              style={{
                background: "#F25AA7",
                color: "#ffffff",
                borderRadius: "999px",
                padding: "0.45rem 1.4rem",
                fontSize: "0.875rem",
                fontWeight: 700,
                textDecoration: "none",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#E63F95";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#F25AA7";
              }}
            >
              Register
            </LinkNext>
          </div>
        </header>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .nav-link {
          transition: color 0.2s;
        }
        .nav-link:hover {
          color: #F25AA7 !important;
        }
      `}} />
    </>
  );
}
