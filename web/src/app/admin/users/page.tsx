"use client";
import AppShell from "@/components/layout/AppShell";
import { Search, UserPlus, Mail, X, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { INSTITUTION_LIST } from "@/lib/mockData";

type UserRole = "Student" | "Teacher" | "QBM" | "Admin";
type UserStatus = "Active" | "Inactive";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institution: string;
  status: UserStatus;
  joined: string;
}

const inferRole = (email: string, inst: string | null): string => {
  const e = email.toLowerCase();
  if (e.includes("admin")) return "Admin";
  if (e.includes("qbm") || e.includes("content")) return "QBM";
  if (e.includes("teacher") || inst === "School" || inst?.includes("Public School")) return "Teacher";
  return "Student";
};

const emptyUserDraft: Omit<AdminUser, "id" | "joined"> = {
  name: "",
  email: "",
  role: "Student",
  institution: "Platform",
  status: "Active",
};

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [draft, setDraft] = useState(emptyUserDraft);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const list = await api.get<any[]>("/api/v1/users");
      const mapped = (list || []).map((u: any) => ({
        id: u.id,
        name: u.full_name,
        email: u.email,
        role: inferRole(u.email, u.institution_name) as UserRole,
        institution: u.institution_name || "Platform",
        status: (u.is_active ? "Active" : "Inactive") as UserStatus,
        joined: new Date(u.created_at).toLocaleDateString()
      }));
      setUsers(mapped);
    } catch (err) {
      console.error("Failed to load users from backend", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query) ||
      user.institution.toLowerCase().includes(query);
    const matchesRole = roleFilter === "" || user.role === roleFilter;
    const matchesStatus = statusFilter === "" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const openAddUser = () => {
    setDraft(emptyUserDraft);
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const openEditUser = (user: AdminUser) => {
    setDraft({
      name: user.name,
      email: user.email,
      role: user.role,
      institution: user.institution,
      status: user.status,
    });
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setDraft(emptyUserDraft);
  };

  const saveUser = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (editingUser) {
        alert("Updating user profile info is handled via self-service profiles. Only status changes can be toggled here.");
      } else {
        if (draft.role === "Student") {
          await api.post("/api/v1/auth/signup/student", {
            email: draft.email,
            password: "Password123!",
            full_name: draft.name,
            grade: "Grade 10",
            student_code: `STU${Date.now().toString().slice(-4)}`
          });
        } else {
          await api.post("/api/v1/auth/signup/teacher", {
            email: draft.email,
            password: "Password123!",
            full_name: draft.name,
            institution_name: draft.institution
          });
        }
        await loadUsers();
      }
      closeModal();
    } catch (err: any) {
      alert("Failed to save user: " + err.message);
    }
  };

  const toggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(user => (
      user.id === id ? { ...user, status: user.status === "Active" ? "Inactive" : "Active" } : user
    )));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
    if (editingUser?.id === id) {
      closeModal();
    }
  };

  return (
    <AppShell role="admin" userName="Ravi Kumar" userAvatar="RK" title="User Management">
      {/* ── Actions Row ────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
        <button onClick={openAddUser} className="tp-btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
          <UserPlus size={16} /> Add New User
        </button>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "260px", maxWidth: "400px" }}>
          <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            className="tp-input"
            style={{ paddingLeft: "2.5rem" }}
            placeholder="Search by name, email, role, or school..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="tp-select" style={{ width: 150 }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="Student">Student</option>
          <option value="Teacher">Teacher</option>
          <option value="QBM">QBM</option>
          <option value="Admin">Admin</option>
        </select>
        <select className="tp-select" style={{ width: 150 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="tp-card animate-fade-in-up">
        <div style={{ overflowX: "auto" }}>
          <table className="tp-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Institution</th>
                <th>Joined Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{user.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <Mail size={12} /> {user.email}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`tp-badge ${
                      user.role === "Teacher" ? "tp-badge-primary" :
                      user.role === "Student" ? "tp-badge-neutral" :
                      user.role === "QBM" ? "tp-badge-warning" : "tp-badge-success"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.institution}</td>
                  <td>{user.joined}</td>
                  <td>
                    <span className={`tp-badge ${user.status === "Active" ? "tp-badge-success" : "tp-badge-danger"}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      <button onClick={() => openEditUser(user)} style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 600, fontSize: "0.75rem", cursor: "pointer" }}>
                        Edit
                      </button>
                      <button onClick={() => toggleUserStatus(user.id)} style={{ background: "none", border: "none", color: user.status === "Active" ? "var(--danger)" : "var(--success)", fontWeight: 600, fontSize: "0.75rem", cursor: "pointer" }}>
                        {user.status === "Active" ? "Suspend" : "Reactivate"}
                      </button>
                      <button onClick={() => deleteUser(user.id)} style={{ background: "none", border: "none", color: "var(--danger)", fontWeight: 600, fontSize: "0.75rem", cursor: "pointer" }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "3rem 1.5rem", color: "var(--text-secondary)" }}>
                    No users match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.38)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <form onSubmit={saveUser} className="tp-card animate-scale-in" style={{ width: "100%", maxWidth: 520, boxShadow: "var(--shadow-lg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ fontWeight: 800, fontSize: "1rem" }}>{editingUser ? "Edit User" : "Add New User"}</div>
              <button type="button" onClick={closeModal} className="tp-btn-ghost" style={{ padding: "0.35rem" }} title="Close form">
                <X size={16} />
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
              <label style={{ gridColumn: "1 / -1", fontSize: "0.8125rem", fontWeight: 700 }}>
                Full Name
                <input className="tp-input" value={draft.name} onChange={(e) => setDraft(prev => ({ ...prev, name: e.target.value }))} required style={{ marginTop: "0.35rem" }} />
              </label>
              <label style={{ gridColumn: "1 / -1", fontSize: "0.8125rem", fontWeight: 700 }}>
                Email
                <input type="email" className="tp-input" value={draft.email} onChange={(e) => setDraft(prev => ({ ...prev, email: e.target.value }))} required style={{ marginTop: "0.35rem" }} />
              </label>
              <label style={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                Role
                <select className="tp-select" value={draft.role} onChange={(e) => setDraft(prev => ({ ...prev, role: e.target.value as UserRole }))} style={{ marginTop: "0.35rem" }}>
                  <option value="Student">Student</option>
                  <option value="Teacher">Teacher</option>
                  <option value="QBM">QBM</option>
                  <option value="Admin">Admin</option>
                </select>
              </label>
              <label style={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                Status
                <select className="tp-select" value={draft.status} onChange={(e) => setDraft(prev => ({ ...prev, status: e.target.value as UserStatus }))} style={{ marginTop: "0.35rem" }}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
              <label style={{ gridColumn: "1 / -1", fontSize: "0.8125rem", fontWeight: 700 }}>
                Institution
                <select className="tp-select" value={draft.institution} onChange={(e) => setDraft(prev => ({ ...prev, institution: e.target.value }))} style={{ marginTop: "0.35rem" }}>
                  <option value="Platform">Platform</option>
                  {INSTITUTION_LIST.map(inst => (
                    <option key={inst.id} value={inst.name}>{inst.name}</option>
                  ))}
                </select>
              </label>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.25rem" }}>
              <button type="button" onClick={closeModal} className="tp-btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>Cancel</button>
              <button type="submit" className="tp-btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
                <Save size={15} /> {editingUser ? "Save User" : "Create User"}
              </button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  );
}
