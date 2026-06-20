"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function QBMLoginPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', sans-serif",
      color: "#4B5563"
    }}>
      Redirecting to unified login...
    </div>
  );
}
