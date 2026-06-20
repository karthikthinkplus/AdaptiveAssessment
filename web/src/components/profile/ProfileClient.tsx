"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { MOCK_USERS, STUDENT_STATS } from "@/lib/mockData";
import { MOCK_AVATARS, AvatarItem } from "@/lib/avatarsData";
import { Edit2, Camera, Key, School, ShieldAlert, Award, User, X, Search, Flame } from "lucide-react";

type Role = "student" | "teacher" | "qbm" | "admin";
type ProfileSession = {
  role: Role;
  name: string;
  email: string;
  avatar: { emoji: string; bgGradient: string } | string;
  institution: string;
  grade?: string;
  dob?: string;
  phone?: string;
};

const isRole = (value: unknown): value is Role =>
  value === "student" || value === "teacher" || value === "qbm" || value === "admin";

const roleFallbacks: Record<Role, (typeof MOCK_USERS)[number]> = {
  student: MOCK_USERS.find(user => user.role === "student") || MOCK_USERS[0],
  teacher: MOCK_USERS.find(user => user.role === "teacher") || MOCK_USERS[0],
  qbm: MOCK_USERS.find(user => user.role === "qbm") || MOCK_USERS[0],
  admin: MOCK_USERS.find(user => user.role === "admin") || MOCK_USERS[0],
};

const roleFromPathname = (pathname: string | null): Role | null => {
  if (pathname?.startsWith("/teacher/profile")) return "teacher";
  if (pathname?.startsWith("/qbm/profile")) return "qbm";
  if (pathname?.startsWith("/admin/profile")) return "admin";
  if (pathname?.startsWith("/student/profile")) return "student";
  return null;
};

const getInitialProfile = (pathRole?: Role | null): ProfileSession | null => {
  if (typeof window === "undefined") return null;
  const session = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("tp_user") : null;
  const storedRole = typeof localStorage !== "undefined" ? localStorage.getItem("current_role") : null;
  const fallbackRole = pathRole || (isRole(storedRole) ? storedRole : null);

  try {
    const parsed = session ? JSON.parse(session) : null;
    const parsedRole = parsed && isRole(parsed.role) ? parsed.role : null;
    const role: Role | null = pathRole || parsedRole || fallbackRole;
    if (!role) return null;

    const sessionEmail = typeof parsed?.email === "string" ? parsed.email.toLowerCase().trim() : "";
    const userRecord =
      MOCK_USERS.find(user => user.role === role && user.email.toLowerCase() === sessionEmail) ||
      roleFallbacks[role];

    return {
      role,
      name: parsedRole === role ? (parsed.name || userRecord.name) : userRecord.name,
      email: parsedRole === role ? (parsed.email || userRecord.email) : userRecord.email,
      avatar: parsedRole === role ? (parsed.avatar || userRecord.avatar) : userRecord.avatar,
      institution: parsedRole === role ? (parsed.institution || userRecord.institution) : userRecord.institution,
      grade: userRecord.grade,
      dob: parsedRole === role ? (parsed.dob || userRecord.dob) : userRecord.dob,
      phone: parsedRole === role ? (parsed.phone || userRecord.phone) : userRecord.phone,
    };
  } catch (err) {
    console.error("Failed to parse tp_user in profile", err);
    return null;
  }
};

export default function ProfilePage() {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<ProfileSession | null>(null);

  useEffect(() => {
    if (!profile) {
      const resolvedProfile = getInitialProfile(roleFromPathname(pathname));
      if (!resolvedProfile) {
        router.replace("/login");
        return;
      }
      if (pathname === "/profile") {
        router.replace(`/${resolvedProfile.role}/profile`);
        return;
      }
      const timer = window.setTimeout(() => setProfile(resolvedProfile), 0);
      return () => window.clearTimeout(timer);
    } else if (pathname === "/profile") {
      router.replace(`/${profile.role}/profile`);
      return;
    }
  }, [pathname, profile, router]);

  if (!profile) return null;

  return <ProfileContent initialProfile={profile} />;
}

function ProfileContent({ initialProfile }: { initialProfile: ProfileSession }) {
  const [editing, setEditing] = useState(false);
  const [activeRole] = useState<Role>(initialProfile.role);
  const [name] = useState(initialProfile.name);
  const [email, setEmail] = useState(initialProfile.email);
  const [dob, setDob] = useState(initialProfile.dob || "Not provided");
  const [phone, setPhone] = useState(initialProfile.phone || "Not provided");
  const [institution, setInstitution] = useState(initialProfile.institution);
  const profileGrade = initialProfile.grade || "Class 10 - A";
  const [roleDetail, setRoleDetail] = useState(
    activeRole === "student" ? profileGrade :
    activeRole === "teacher" ? "Mathematics" :
    activeRole === "qbm" ? "Content Operations" :
    "System Administration"
  );
  const streakCount = activeRole === "student" ? 12 : activeRole === "teacher" ? 8 : activeRole === "qbm" ? 6 : 15;
  const skillValue = activeRole === "student" ? STUDENT_STATS.abilityLabel :
    activeRole === "teacher" ? "Mathematics" :
    activeRole === "qbm" ? "Content Operations" :
    "Platform Administration";
  const overallKnowledgeValue = activeRole === "student" ? `${STUDENT_STATS.overallProgress}%` :
    activeRole === "teacher" ? "74.5%" :
    activeRole === "qbm" ? "104 approved" :
    "99.9%";

  // Avatar states
  const [activeAvatar, setActiveAvatar] = useState<{ emoji: string; bgGradient: string } | string>(initialProfile.avatar);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSelectedAvatar, setTempSelectedAvatar] = useState<AvatarItem>(MOCK_AVATARS[0]);

  // Password Reset Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Toast notifications
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const triggerToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  const handleSave = () => {
    setEditing(false);
    const session = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("tp_user") : null;
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed.role !== activeRole) return;
        parsed.name = name;
        parsed.email = email;
        parsed.institution = institution;
        parsed.dob = dob;
        parsed.phone = phone;
        parsed.roleDetail = roleDetail;
        sessionStorage.setItem("tp_user", JSON.stringify(parsed));
        // dispatch storage event for TopNav to refresh
        window.dispatchEvent(new Event("storage"));
      } catch (err) {
        console.error(err);
      }
    }
    triggerToast("Profile details updated successfully!");
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      triggerToast("All fields are required.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      triggerToast("New passwords do not match.", "error");
      return;
    }
    triggerToast("Password changed successfully!");
    setShowPasswordModal(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const getRoleLabel = (r: Role) => {
    switch (r) {
      case "student": return "Student";
      case "teacher": return "Teacher";
      case "qbm": return "QBM Developer";
      case "admin": return "Administrator";
    }
  };

  const filteredAvatars = MOCK_AVATARS;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Legendary": return "#F59E0B";
      case "Epic": return "#8B5CF6";
      case "Rare": return "#3B82F6";
      default: return "#64748B";
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case "Legendary": return "#FEF3C7";
      case "Epic": return "#F3E8FF";
      case "Rare": return "#DBEAFE";
      default: return "#F1F5F9";
    }
  };

  const getAvatarSource = (avatar: { emoji: string; bgGradient: string } | string) =>
    typeof avatar === "string" ? avatar : avatar.emoji;

  const isImageAvatar = (avatar: { emoji: string; bgGradient: string } | string) =>
    getAvatarSource(avatar).startsWith("/avatars/");

  const openAvatarModal = () => {
    const activeSource = getAvatarSource(activeAvatar);
    const current = MOCK_AVATARS.find(a => a.imageSrc === activeSource || a.emoji === activeSource);
    setTempSelectedAvatar(current || MOCK_AVATARS[0]);
    setShowAvatarModal(true);
  };

  const saveSelectedAvatar = () => {
    setActiveAvatar(tempSelectedAvatar);
    setShowAvatarModal(false);
    const session = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("tp_user") : null;
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed.role !== activeRole) return;
        parsed.avatar = tempSelectedAvatar.imageSrc;
        sessionStorage.setItem("tp_user", JSON.stringify(parsed));
        window.dispatchEvent(new Event("storage"));
      } catch (err) {
        console.error(err);
      }
    }
    triggerToast("Avatar updated successfully!");
  };

  return (
    <AppShell role={activeRole} userName={name} userAvatar={getAvatarSource(activeAvatar)} title="Profile">
      {/* ── Dynamic keyframe animation style ── */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes avatar-pulse {
          0% { box-shadow: 0 0 10px rgba(160, 137, 230, 0.4), 0 0 5px rgba(160, 137, 230, 0.2); }
          50% { box-shadow: 0 0 25px rgba(160, 137, 230, 0.8), 0 0 15px rgba(160, 137, 230, 0.4); }
          100% { box-shadow: 0 0 10px rgba(160, 137, 230, 0.4), 0 0 5px rgba(160, 137, 230, 0.2); }
        }
        @keyframes epic-pulse {
          0% { box-shadow: 0 0 8px rgba(160, 137, 230, 0.3); }
          50% { box-shadow: 0 0 20px rgba(160, 137, 230, 0.6); }
          100% { box-shadow: 0 0 8px rgba(160, 137, 230, 0.3); }
        }
        .av-modal-scroll::-webkit-scrollbar { width: 6px; }
        .av-modal-scroll::-webkit-scrollbar-track { background: var(--bg-deep); border-radius: 10px; }
        .av-modal-scroll::-webkit-scrollbar-thumb { background: var(--border-purple); border-radius: 10px; }
        .av-modal-scroll::-webkit-scrollbar-thumb:hover { background: var(--primary); }
      `}} />


      <div style={{ width: "100%", maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "260px 1fr", gap: "1.5rem" }}>
        
        {/* Avatar Sidebar */}
        <div className="tp-card animate-fade-in-up" style={{ textAlign: "center", padding: "2rem 1.5rem", height: "fit-content" }}>
          <div style={{ position: "relative", display: "inline-block", marginBottom: "1rem" }}>
            <div 
              onClick={openAvatarModal}
              style={{
                width: 90, height: 90, borderRadius: "50%",
                background: typeof activeAvatar === "string" ? "var(--primary-light)" : activeAvatar.bgGradient,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: typeof activeAvatar === "string" ? "1.75rem" : "2.5rem",
                fontWeight: 800, 
                color: typeof activeAvatar === "string" ? "var(--primary)" : "#fff",
                margin: "0 auto",
                cursor: "pointer",
                border: "4px solid var(--border-purple)",
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
                transition: "transform 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              {isImageAvatar(activeAvatar) ? (
                <img
                  src={getAvatarSource(activeAvatar)}
                  alt="Selected avatar"
                  style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                getAvatarSource(activeAvatar)
              )}
            </div>
            <button 
              onClick={openAvatarModal}
              style={{
                position: "absolute", bottom: -2, right: -2,
                width: 28, height: 28, borderRadius: "50%",
                background: "var(--primary)", border: "2px solid #fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                boxShadow: "var(--shadow-sm)"
              }}>
              <Camera size={13} color="#fff" />
            </button>
          </div>
          <div style={{ fontWeight: 800, fontSize: "1.0625rem", marginBottom: "0.25rem" }}>{name}</div>
          <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>{email}</div>
          <span className="tp-badge tp-badge-primary">{getRoleLabel(activeRole)}</span>

          {activeRole === "student" && (
            <div style={{ marginTop: "1.4rem", paddingTop: "1.2rem", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "0.85rem", textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", fontSize: "0.8125rem", color: "var(--text-secondary)", fontWeight: 800 }}>
                  <span style={{ width: 26, height: 26, borderRadius: "50%", display: "grid", placeItems: "center", background: "linear-gradient(180deg, #FFB000 0%, #FF6B00 55%, #E8194B 100%)" }}>
                    <Flame size={15} fill="#FFF7A8" stroke="#FFFFFF" strokeWidth={2.4} />
                  </span>
                  Streak
                </span>
                <span style={{ fontWeight: 900, color: "var(--text-primary)" }}>{streakCount}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", fontSize: "0.8125rem" }}>
                <span style={{ color: "var(--text-secondary)", fontWeight: 800 }}>Skill</span>
                <span style={{ color: "var(--text-primary)", fontWeight: 900, textAlign: "right" }}>{skillValue}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", fontSize: "0.8125rem" }}>
                <span style={{ color: "var(--text-secondary)", fontWeight: 800 }}>Overall Knowledge</span>
                <span style={{ color: "var(--text-primary)", fontWeight: 900, textAlign: "right" }}>{overallKnowledgeValue}</span>
              </div>
            </div>
          )}

          <button className="tp-btn-primary" style={{ width: "100%", marginTop: "1.5rem", justifyContent: "center" }} onClick={() => setEditing(!editing)}>
            <Edit2 size={14} /> {editing ? "Cancel Edit" : "Edit Profile"}
          </button>
        </div>

        {/* Right Area: The Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Card 1: Personal Information */}
          <div className="tp-card animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, fontSize: "0.9375rem", marginBottom: "1.25rem", color: "var(--text-primary)" }}>
              <User size={18} color="var(--primary)" />
              Personal Information
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              <div>
                <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Full Name</div>
                <div style={{ fontSize: "0.9375rem", fontWeight: 600 }}>{name}</div>
              </div>

              <div>
                <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email Address</div>
                {editing ? (
                  <input className="tp-input" value={email} onChange={e => setEmail(e.target.value)} />
                ) : (
                  <div style={{ fontSize: "0.9375rem", fontWeight: 600 }}>{email}</div>
                )}
              </div>

              <div>
                <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Date of Birth</div>
                {editing ? (
                  <input className="tp-input" value={dob} onChange={e => setDob(e.target.value)} />
                ) : (
                  <div style={{ fontSize: "0.9375rem", fontWeight: 600 }}>{dob}</div>
                )}
              </div>

              <div>
                <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Phone Number</div>
                {editing ? (
                  <input className="tp-input" value={phone} onChange={e => setPhone(e.target.value)} />
                ) : (
                  <div style={{ fontSize: "0.9375rem", fontWeight: 600 }}>{phone}</div>
                )}
              </div>
            </div>
            {editing && (
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
                <button className="tp-btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
                <button className="tp-btn-primary" onClick={handleSave}>Save Changes</button>
              </div>
            )}
          </div>

          {/* Card 2: Institution Information */}
          {activeRole !== "admin" && (
            <div className="tp-card animate-fade-in-up" style={{ animationDelay: "0.10s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, fontSize: "0.9375rem", marginBottom: "1.25rem", color: "var(--text-primary)" }}>
                <School size={18} color="var(--primary)" />
                Institution Information
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Institution Name</div>
                  {editing ? (
                    <input className="tp-input" value={institution} onChange={e => setInstitution(e.target.value)} />
                  ) : (
                    <div style={{ fontSize: "0.9375rem", fontWeight: 600 }}>{institution}</div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {activeRole === "student" ? "Current Grade" : activeRole === "teacher" ? "Department" : activeRole === "qbm" ? "Role Domain" : "Level"}
                  </div>
                  {editing ? (
                    <input className="tp-input" value={roleDetail} onChange={e => setRoleDetail(e.target.value)} />
                  ) : (
                    <div style={{ fontSize: "0.9375rem", fontWeight: 600 }}>{roleDetail}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Card 4: Account Settings */}
          <div className="tp-card animate-fade-in-up" style={{ animationDelay: "0.20s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, fontSize: "0.9375rem", marginBottom: "1.25rem", color: "var(--text-primary)" }}>
              <ShieldAlert size={18} color="var(--primary)" />
              Account Settings
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              <div>
                <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Change Password</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                  <span style={{ fontSize: "1.125rem", letterSpacing: "0.15em", color: "var(--text-secondary)" }}>••••••••</span>
                  <button 
                    onClick={() => setShowPasswordModal(true)}
                    style={{ fontSize: "0.8125rem", color: "var(--primary)", fontWeight: 600, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Key size={12} /> Change
                  </button>
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Account Status</div>
                <span className="tp-badge tp-badge-success">Active</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Avatar Choice Modal Card ────────────────────────────────── */}
      {showAvatarModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(8px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          fontFamily: "'Inter', sans-serif"
        }}>
          {/* Modal Container */}
          <div className="animate-fade-in-up" style={{
            backgroundColor: "var(--surface-solid)",
            borderRadius: "20px",
            boxShadow: "var(--shadow-lg)",
            width: "100%",
            maxWidth: "640px",
            height: "auto",
            maxHeight: "86vh",
            display: "grid",
            gridTemplateColumns: "1fr",
            overflow: "auto",
            position: "relative",
            border: "1px solid var(--border)"
          }}>
            {/* Close Button */}
            <button 
              onClick={() => setShowAvatarModal(false)}
              style={{
                position: "absolute",
                top: "1.25rem",
                right: "1.25rem",
                backgroundColor: "var(--primary-light)",
                border: "1px solid var(--border-purple)",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--primary)",
                zIndex: 10,
                transition: "background-color 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--primary-mid)"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--primary-light)"}  
            >
              <X size={16} />
            </button>

            {/* LEFT PANEL: Selected Avatar Preview */}
            <div style={{
              backgroundColor: "var(--bg-deep)",
              borderRight: "1px solid var(--border)",
              padding: "2.5rem 1.5rem",
              display: "none",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              textAlign: "center"
            }}>
              <div>

                {/* Avatar Icon Container with Rarity border/effects */}
                <div style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: tempSelectedAvatar.bgGradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "4rem",
                  margin: "0 auto 1.25rem",
                  position: "relative",
                  border: tempSelectedAvatar.borderColor ? `4px solid ${tempSelectedAvatar.borderColor}` : "4px solid #fff",
                  boxShadow: tempSelectedAvatar.glowColor ? `0 0 20px ${tempSelectedAvatar.glowColor}` : "0 8px 24px rgba(0,0,0,0.08)",
                  animation: tempSelectedAvatar.rarity === "Legendary" ? "avatar-pulse 2s infinite ease-in-out" : 
                             tempSelectedAvatar.rarity === "Epic" ? "epic-pulse 2.5s infinite ease-in-out" : "none"
                }}>
                  {tempSelectedAvatar.emoji}
                </div>

                <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.5rem" }}>
                  <span style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    padding: "2px 8px",
                    borderRadius: "20px",
                    color: getRarityColor(tempSelectedAvatar.rarity),
                    backgroundColor: getRarityBg(tempSelectedAvatar.rarity)
                  }}>
                    {tempSelectedAvatar.rarity}
                  </span>
                </div>

                <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                  {tempSelectedAvatar.name}
                </h3>
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.4, maxWidth: "200px" }}>
                  {tempSelectedAvatar.category === "Animals" ? "Unlock the township farm with this special companion." : 
                   tempSelectedAvatar.category === "Townspeople" ? "Represent your favorite civic leader on your profile." :
                   tempSelectedAvatar.category === "Fantasy" ? "Harness magical or historical prowess as your profile photo." :
                   "Showcase your expertise and favorite outdoor hobbies."}
                </p>
              </div>

              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <button 
                  onClick={() => {
                    setActiveAvatar(tempSelectedAvatar);
                    setShowAvatarModal(false);
                    const session = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("tp_user") : null;
                    if (session) {
                      try {
                        const parsed = JSON.parse(session);
                        if (parsed.role !== activeRole) return;
                        parsed.avatar = tempSelectedAvatar.emoji;
                        sessionStorage.setItem("tp_user", JSON.stringify(parsed));
                        window.dispatchEvent(new Event("storage"));
                      } catch (err) {
                        console.error(err);
                      }
                    }
                    triggerToast("Avatar updated successfully!");
                  }}
                  style={{
                    width: "100%",
                    background: "linear-gradient(135deg, #F25AA7 0%, #FF7BC0 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "0.75rem",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    boxShadow: "var(--shadow-purple)"
                  }}
                >
                  Set Avatar
                </button>
                <button 
                  onClick={() => setShowAvatarModal(false)}
                  style={{
                    width: "100%",
                    backgroundColor: "transparent",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    padding: "0.75rem",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* RIGHT PANEL: Grid of Avatars */}
            <div style={{
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              minWidth: 0
            }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "1rem" }}>
                Choose Avatar
              </h2>

              {/* Filters & Search */}
              <div style={{ display: "none", gap: "0.5rem", marginBottom: "1rem" }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <Search size={14} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                  <input 
                    type="text" 
                    placeholder="Search characters..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.45rem 1rem 0.45rem 2.25rem",
                      fontSize: "0.8125rem",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      outline: "none",
                      background: "var(--surface)",
                      color: "var(--text-primary)"
                    }}
                  />
                </div>
              </div>



              {/* Grid Container */}
              <div className="av-modal-scroll" style={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                paddingRight: "0.5rem"
              }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(120px, 1fr))",
                  gap: "1rem"
                }}>
                  {filteredAvatars.map(av => {
                    const isSelected = tempSelectedAvatar.id === av.id;

                    return (
                      <div 
                        key={av.id}
                        onClick={() => setTempSelectedAvatar(av)}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          cursor: "pointer",
                          padding: "0.85rem 0.65rem 0.75rem",
                          borderRadius: "16px",
                          border: isSelected ? "2px solid var(--primary)" : "2px solid var(--border)",
                          backgroundColor: isSelected ? "var(--primary-light)" : "var(--surface)",
                          transition: "all 0.18s",
                          gap: "0.55rem",
                          boxShadow: isSelected ? "0 10px 24px rgba(160, 137, 230, 0.18)" : "none"
                        }}
                      >
                        <div style={{
                          width: 82,
                          height: 82,
                          borderRadius: "50%",
                          background: av.bgGradient,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 6px 14px rgba(15, 23, 42, 0.12)",
                          border: "3px solid #fff",
                          overflow: "hidden",
                          flexShrink: 0
                        }}>
                          <img src={av.imageSrc} alt={av.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <span style={{
                          fontSize: "0.75rem",
                          color: isSelected ? "var(--primary)" : "var(--text-secondary)",
                          fontWeight: isSelected ? 800 : 600,
                          textAlign: "center",
                          marginTop: "0.125rem",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          lineHeight: 1.3,
                          width: "100%"
                        } as React.CSSProperties}>
                          {av.name}
                        </span>
                      </div>
                    );
                  })}
                  
                  {filteredAvatars.length === 0 && (
                    <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "2rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                      No avatars found matching your filters.
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={saveSelectedAvatar}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #F25AA7 0%, #FF7BC0 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "12px",
                  padding: "0.85rem",
                  fontWeight: 800,
                  fontSize: "0.9375rem",
                  cursor: "pointer",
                  marginTop: "1.25rem",
                  boxShadow: "var(--shadow-purple)"
                }}
              >
                Save Avatar
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ── Password Reset Modal ────────────────────────────────── */}
      {showPasswordModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(8px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          fontFamily: "'Inter', sans-serif"
        }}>
          <div className="animate-fade-in-up" style={{
            backgroundColor: "var(--surface-solid)",
            borderRadius: "20px",
            boxShadow: "var(--shadow-lg)",
            width: "100%",
            maxWidth: "400px",
            padding: "2rem",
            position: "relative",
            border: "1px solid var(--border)"
          }}>
            <button 
              onClick={() => setShowPasswordModal(false)}
              style={{
                position: "absolute",
                top: "1.25rem",
                right: "1.25rem",
                backgroundColor: "var(--primary-light)",
                border: "1px solid var(--border-purple)",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--primary)"
              }}
            >
              <X size={16} />
            </button>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "1.5rem" }}>
              Change Password
            </h3>
            <form onSubmit={handlePasswordReset}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "0.375rem" }}>Current Password</label>
                <input 
                  type="password" 
                  className="tp-input" 
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="••••••••" 
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "0.375rem" }}>New Password</label>
                <input 
                  type="password" 
                  className="tp-input" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••" 
                />
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "0.375rem" }}>Confirm New Password</label>
                <input 
                  type="password" 
                  className="tp-input" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" 
                />
              </div>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button type="button" className="tp-btn-ghost" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                <button type="submit" className="tp-btn-primary">Update Password</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Toast Notifications ────────────────────────────────── */}
      {toastMessage && (
        <div style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          backgroundColor: toastType === "success" ? "#10B981" : "#EF4444",
          color: "#fff",
          padding: "0.75rem 1.5rem",
          borderRadius: "10px",
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
          zIndex: 10000,
          fontWeight: 600,
          fontSize: "0.875rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          animation: "fade-in 0.25s forwards"
        }}>
          {toastType === "success" ? "✓" : "✗"} {toastMessage}
        </div>
      )}

    </AppShell>
  );
}
