"use client";
import RouteGuard from "@/components/auth/RouteGuard";
import ProfileClient from "@/components/profile/ProfileClient";

export default function TeacherProfilePage() {
  return (
    <RouteGuard allowedRoles={["teacher"]}>
      <ProfileClient />
    </RouteGuard>
  );
}
