"use client";

import Link from "next/link";

export default function PublicHeader() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: 76,
        padding: "0 4rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(180deg, rgba(247,251,255,0.78) 0%, rgba(247,251,255,0.38) 72%, rgba(247,251,255,0) 100%)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(221,235,250,0.28)",
      }}
    >
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          textDecoration: "none",
        }}
      >
        <img src="/logo.png" alt="thinkplus" style={{ height: 56, width: "auto", display: "block" }} />
      </Link>
    </header>
  );
}
