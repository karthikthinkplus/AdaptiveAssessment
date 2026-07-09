"use client";
import RouteGuard from "@/components/auth/RouteGuard";
import ProfileClient from "@/components/profile/ProfileClient";

export default function QBMProfilePage() {
  return (
    <RouteGuard allowedRoles={["qbm", "content_manager"]}>
      <ProfileClient />
    </RouteGuard>
  );
}
