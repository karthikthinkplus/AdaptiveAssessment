"use client";

import LinkNext from "next/link";
import { ChevronDown } from "lucide-react";

export default function PublicHeader() {
  return (
    <>
      <div
        style={{
          position: "sticky",
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

          {/* Navigation Links */}
          <nav className="header-nav" style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            <div className="nav-item-dropdown" style={{ display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer", color: "#374151", fontWeight: 600, fontSize: "0.875rem" }}>
              <span>Products</span>
              <ChevronDown size={14} style={{ opacity: 0.7 }} />
            </div>
            <div className="nav-item-dropdown" style={{ display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer", color: "#374151", fontWeight: 600, fontSize: "0.875rem" }}>
              <span>Solutions</span>
              <ChevronDown size={14} style={{ opacity: 0.7 }} />
            </div>
            <div className="nav-item-dropdown" style={{ display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer", color: "#374151", fontWeight: 600, fontSize: "0.875rem" }}>
              <span>Resources</span>
              <ChevronDown size={14} style={{ opacity: 0.7 }} />
            </div>
            <LinkNext href="#" style={{ color: "#374151", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none" }}>
              Contact
            </LinkNext>
          </nav>

          {/* Right Button */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <LinkNext href="/login" style={{ color: "#374151", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none" }}>
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
              Start Free Trial
            </LinkNext>
          </div>
        </header>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .header-nav a:hover,
        .nav-item-dropdown:hover {
          color: #F25AA7 !important;
        }

        @media (max-width: 900px) {
          .header-nav {
            display: none !important;
          }
        }
      `}} />
    </>
  );
}
