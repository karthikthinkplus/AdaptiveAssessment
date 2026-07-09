"use client";
import RouteGuard from "@/components/auth/RouteGuard";
import ProfileClient from "@/components/profile/ProfileClient";

export default function StudentProfilePage() {
  return (
    <RouteGuard allowedRoles={["student"]}>
      <ProfileClient />
    </RouteGuard>
  );
}
