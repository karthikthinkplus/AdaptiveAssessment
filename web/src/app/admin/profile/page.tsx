"use client";
import RouteGuard from "@/components/auth/RouteGuard";
import ProfileClient from "@/components/profile/ProfileClient";

export default function AdminProfilePage() {
  return (
    <RouteGuard allowedRoles={["admin"]}>
      <ProfileClient />
    </RouteGuard>
  );
}
