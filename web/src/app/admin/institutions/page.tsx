"use client";
import RouteGuard from "@/components/auth/RouteGuard";
import AppShell from "@/components/layout/AppShell";
import { Search, Building, Plus, MapPin, X, Save, Trash2, Power } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export interface Institution {
  id: string;
  name: string;
  type: "School" | "College";
  city: string;
  students: number;
  teachers: number;
  status: "Active" | "Inactive";
  joinedAt: string;
}

type InstitutionDraft = Omit<Institution, "id" | "joinedAt">;

const emptyDraft: InstitutionDraft = {
  name: "",
  type: "School",
  city: "",
  students: 0,
  teachers: 0,
  status: "Active",
};

const inferRole = (email: string, inst: string | null): string => {
  const e = email.toLowerCase();
  if (e.includes("admin")) return "Admin";
  if (e.includes("qbm") || e.includes("content")) return "QBM";
  if (e.includes("teacher") || inst === "School" || inst?.includes("Public School")) return "Teacher";
  return "Student";
};

export default function AdminInstitutionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [profileInstitution, setProfileInstitution] = useState<Institution | null>(null);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);
  const [draft, setDraft] = useState<InstitutionDraft>(emptyDraft);

  useEffect(() => {
    api.get<any[]>("/api/v1/users").then((list) => {
      const uList = list || [];
      const instNames = Array.from(new Set(uList.map(u => u.institution_name).filter(Boolean)));
      
      const mapped = instNames.map((name, idx) => {
        const matchingUsers = uList.filter(u => u.institution_name === name);
        const stuCount = matchingUsers.filter(u => inferRole(u.email, u.institution_name) === "Student").length;
        const teachCount = matchingUsers.filter(u => inferRole(u.email, u.institution_name) === "Teacher").length;
        return {
          id: `inst-${idx}`,
          name,
          type: "School" as const,
          city: "Local",
          students: stuCount,
          teachers: teachCount,
          status: "Active" as const,
          joinedAt: "Jun 2026"
        };
      });
      setInstitutions(mapped);
    }).catch((err) => {
      console.error("Failed to load institutions from API users list", err);
    });
  }, []);


  const filteredInsts = institutions.filter(inst => {
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      inst.name.toLowerCase().includes(query) ||
      inst.city.toLowerCase().includes(query) ||
      inst.type.toLowerCase().includes(query);
    const matchesType = typeFilter === "" || inst.type === typeFilter;
    const matchesStatus = statusFilter === "" || inst.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const openRegister = () => {
    setDraft(emptyDraft);
    setEditingInstitution(null);
    setIsRegisterOpen(true);
  };

  const openSettings = (institution: Institution) => {
    setEditingInstitution(institution);
    setDraft({
      name: institution.name,
      type: institution.type,
      city: institution.city,
      students: institution.students,
      teachers: institution.teachers,
      status: institution.status,
    });
    setIsRegisterOpen(true);
  };

  const closeForm = () => {
    setIsRegisterOpen(false);
    setEditingInstitution(null);
    setDraft(emptyDraft);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (editingInstitution) {
      setInstitutions(prev => prev.map(inst => inst.id === editingInstitution.id ? { ...inst, ...draft } : inst));
    } else {
      const newInstitution: Institution = {
        ...draft,
        id: `i${Date.now()}`,
        joinedAt: "Jun 2026",
      };
      setInstitutions(prev => [newInstitution, ...prev]);
    }
    closeForm();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setStatusFilter("");
  };

  const toggleInstitutionStatus = (id: string) => {
    setInstitutions(prev => prev.map(inst => (
      inst.id === id
        ? { ...inst, status: inst.status === "Active" ? "Inactive" : "Active" }
        : inst
    )));
  };

  const deleteInstitution = (id: string) => {
    setInstitutions(prev => prev.filter(inst => inst.id !== id));
    if (profileInstitution?.id === id) {
      setProfileInstitution(null);
    }
    if (editingInstitution?.id === id) {
      closeForm();
    }
  };

  return (
    <RouteGuard allowedRoles={["admin"]}>
    <AppShell role="admin" userName="Ravi Kumar" userAvatar="RK" title="Institution Management">
      {/* -- Actions Row ---------------------------------------------- */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
        <button onClick={openRegister} className="tp-btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
          <Plus size={16} /> Register Institution
        </button>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "0.75rem", alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "260px", maxWidth: "400px" }}>
          <label htmlFor="institution-search" style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.35rem" }}>Search</label>
          <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            id="institution-search"
            type="text"
            className="tp-input"
            style={{ paddingLeft: "2.5rem" }}
            placeholder="Search by institution name or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <label htmlFor="institution-type-filter" style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)" }}>
          Type
          <select id="institution-type-filter" className="tp-select" style={{ width: 160, marginTop: "0.35rem" }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            <option value="School">School</option>
            <option value="College">College</option>
          </select>
        </label>
        <label htmlFor="institution-status-filter" style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)" }}>
          Status
          <select id="institution-status-filter" className="tp-select" style={{ width: 160, marginTop: "0.35rem" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </label>
        <button onClick={clearFilters} className="tp-btn-secondary" style={{ padding: "0.625rem 1rem", fontSize: "0.875rem" }}>
          Clear Filters
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1.25rem", fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
        <span>
          Showing <strong style={{ color: "var(--text-primary)" }}>{filteredInsts.length}</strong> of <strong style={{ color: "var(--text-primary)" }}>{institutions.length}</strong> institutions
        </span>
        {(searchTerm || typeFilter || statusFilter) && (
          <span style={{ color: "var(--primary)", fontWeight: 700 }}>
            Filters applied
          </span>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
        {filteredInsts.map((inst, i) => (
          <div key={inst.id} className="tp-card animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s`, display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
                  <Building size={20} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--text-primary)" }}>{inst.name}</h3>
                  <span className="tp-badge tp-badge-neutral" style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem" }}>{inst.type}</span>
                </div>
              </div>
              <span className={`tp-badge ${inst.status === "Active" ? "tp-badge-success" : "tp-badge-danger"}`}>
                {inst.status}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", fontSize: "0.8125rem", color: "var(--text-secondary)", borderTop: "1px solid var(--border)", paddingTop: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <MapPin size={14} color="var(--text-muted)" />
                <span>{inst.city}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.25rem" }}>
                <span>Students: <strong>{inst.students}</strong></span>
                <span>Teachers: <strong>{inst.teachers}</strong></span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                Registered in {inst.joinedAt}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button onClick={() => setProfileInstitution(inst)} className="tp-btn-secondary" style={{ flex: 1, padding: "0.4rem", fontSize: "0.75rem", justifyContent: "center" }}>
                View Profile
              </button>
              <button onClick={() => openSettings(inst)} className="tp-btn-ghost" style={{ padding: "0.4rem 0.75rem", fontSize: "0.75rem", justifyContent: "center" }}>
                Settings
              </button>
              <button
                onClick={() => toggleInstitutionStatus(inst.id)}
                className="tp-btn-ghost"
                style={{ padding: "0.4rem 0.75rem", fontSize: "0.75rem", justifyContent: "center", color: inst.status === "Active" ? "var(--warning)" : "var(--success)" }}
                title={inst.status === "Active" ? `Deactivate ${inst.name}` : `Reactivate ${inst.name}`}
              >
                <Power size={13} /> {inst.status === "Active" ? "Deactivate" : "Reactivate"}
              </button>
              <button
                onClick={() => deleteInstitution(inst.id)}
                className="tp-btn-ghost"
                style={{ padding: "0.4rem 0.75rem", fontSize: "0.75rem", justifyContent: "center", color: "var(--danger)" }}
                title={`Delete ${inst.name}`}
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredInsts.length === 0 && (
        <div className="tp-card" style={{ textAlign: "center", color: "var(--text-secondary)", marginTop: "1rem" }}>
          No institutions match the selected filters.
        </div>
      )}

      {profileInstitution && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.38)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div className="tp-card animate-scale-in" style={{ width: "100%", maxWidth: 460, boxShadow: "var(--shadow-lg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ fontWeight: 800, fontSize: "1rem" }}>{profileInstitution.name}</div>
              <button onClick={() => setProfileInstitution(null)} className="tp-btn-ghost" style={{ padding: "0.35rem" }} title="Close profile">
                <X size={16} />
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {[
                ["Type", profileInstitution.type],
                ["City", profileInstitution.city],
                ["Students", profileInstitution.students.toLocaleString()],
                ["Teachers", profileInstitution.teachers.toLocaleString()],
                ["Status", profileInstitution.status],
                ["Registered", profileInstitution.joinedAt],
              ].map(([label, value]) => (
                <div key={label} style={{ padding: "0.75rem", background: "var(--surface)", borderRadius: 8 }}>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.72rem", marginBottom: "0.25rem" }}>{label}</div>
                  <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isRegisterOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.38)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <form onSubmit={handleSubmit} className="tp-card animate-scale-in" style={{ width: "100%", maxWidth: 520, boxShadow: "var(--shadow-lg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ fontWeight: 800, fontSize: "1rem" }}>{editingInstitution ? "Institution Settings" : "Register Institution"}</div>
              <button type="button" onClick={closeForm} className="tp-btn-ghost" style={{ padding: "0.35rem" }} title="Close form">
                <X size={16} />
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
              <label style={{ gridColumn: "1 / -1", fontSize: "0.8125rem", fontWeight: 700 }}>
                Institution Name
                <input className="tp-input" value={draft.name} onChange={(e) => setDraft(prev => ({ ...prev, name: e.target.value }))} required style={{ marginTop: "0.35rem" }} />
              </label>
              <label style={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                Type
                <select className="tp-select" value={draft.type} onChange={(e) => setDraft(prev => ({ ...prev, type: e.target.value as Institution["type"] }))} style={{ marginTop: "0.35rem" }}>
                  <option value="School">School</option>
                  <option value="College">College</option>
                </select>
              </label>
              <label style={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                Status
                <select className="tp-select" value={draft.status} onChange={(e) => setDraft(prev => ({ ...prev, status: e.target.value as Institution["status"] }))} style={{ marginTop: "0.35rem" }}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
              <label style={{ gridColumn: "1 / -1", fontSize: "0.8125rem", fontWeight: 700 }}>
                City
                <input className="tp-input" value={draft.city} onChange={(e) => setDraft(prev => ({ ...prev, city: e.target.value }))} required style={{ marginTop: "0.35rem" }} />
              </label>
              <label style={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                Students
                <input type="number" min={0} className="tp-input" value={draft.students} onChange={(e) => setDraft(prev => ({ ...prev, students: Number(e.target.value) }))} style={{ marginTop: "0.35rem" }} />
              </label>
              <label style={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                Teachers
                <input type="number" min={0} className="tp-input" value={draft.teachers} onChange={(e) => setDraft(prev => ({ ...prev, teachers: Number(e.target.value) }))} style={{ marginTop: "0.35rem" }} />
              </label>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.25rem" }}>
              <button type="button" onClick={closeForm} className="tp-btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>Cancel</button>
              <button type="submit" className="tp-btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
                <Save size={15} /> {editingInstitution ? "Save Settings" : "Register"}
              </button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
    </RouteGuard>
  );
}
