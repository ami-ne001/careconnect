import { useCallback, useEffect, useState } from "react";
import { Search, Plus, X, Edit2, ShieldAlert, Stethoscope } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { adminApi, clinicalApi } from "@/api";
import { getApiErrorMessage } from "@/utils/apiError";
import { toast } from "sonner";
import type { AdminUser, Department, UserCreateRequest, UserRole, UserUpdateRequest } from "@/types";
import type { DoctorProfileUpdateRequest } from "@/api/clinical.api";

const ALL_ROLES_FILTER = "" as const;

// Roles admin can CREATE
const CREATABLE_ROLES = [
  { label: "Admin", value: "ADMIN" },
  { label: "Doctor", value: "DOCTOR" },
  { label: "Nurse", value: "NURSE" },
  { label: "Receptionist", value: "RECEPTIONIST" },
  { label: "Lab Technician", value: "LAB_TECHNICIAN" },
];

// Roles available in the filter (all, including patient for viewing)
const ALL_ROLE_FILTER_OPTIONS = [
  { label: "Admin", value: "ADMIN" },
  { label: "Doctor", value: "DOCTOR" },
  { label: "Nurse", value: "NURSE" },
  { label: "Receptionist", value: "RECEPTIONIST" },
  { label: "Patient", value: "PATIENT" },
  { label: "Lab Technician", value: "LAB_TECHNICIAN" },
];

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | typeof ALL_ROLES_FILTER>(ALL_ROLES_FILTER);
  const [statusFilter, setStatusFilter] = useState("All");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Basic user fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("DOCTOR");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");

  // Doctor profile fields
  const [specialty, setSpecialty] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [bio, setBio] = useState("");
  const [isSurgeon, setIsSurgeon] = useState(false);

  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<AdminUser | null>(null);
  const [deactivateLoading, setDeactivateLoading] = useState(false);

  const loadUsers = useCallback(async (role?: UserRole) => {
    setLoading(true);
    try {
      const { data } = await adminApi.getUsers(role);
      setUsers(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to load users."));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDepartments = useCallback(async () => {
    try {
      const { data } = await adminApi.getDepartments();
      setDepartments(data);
    } catch (err) {
      console.error("Failed to load departments:", err);
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  useEffect(() => {
    loadUsers(roleFilter || undefined);
  }, [roleFilter, loadUsers]);

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setRole("DOCTOR");
    setDepartmentId("");
    setPhone("");
    setGender("");
    setDateOfBirth("");
    setAddress("");
    setSpecialty("");
    setLicenseNumber("");
    setYearsExperience("");
    setBio("");
    setIsSurgeon(false);
  };

  const openCreate = () => {
    setFormMode("create");
    setSelectedUser(null);
    resetForm();
    setFormOpen(true);
  };

  const openEdit = async (user: AdminUser) => {
    setFormMode("edit");
    setSelectedUser(user);
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email);
    setPassword("");
    setRole(user.role);
    setDepartmentId(user.departmentId ? String(user.departmentId) : "");
    setPhone(user.phone || "");
    setGender(user.gender || "");
    setDateOfBirth(user.dateOfBirth || "");
    setAddress(user.address || "");

    // Reset doctor profile fields
    setSpecialty("");
    setLicenseNumber("");
    setYearsExperience("");
    setBio("");
    setIsSurgeon(false);

    // If doctor, fetch the doctor profile
    if (user.role === "DOCTOR") {
      try {
        const { data: dp } = await clinicalApi.getDoctorProfile(user.id);
        setSpecialty(dp.specialty || "");
        setLicenseNumber(dp.licenseNumber || "");
        setYearsExperience(dp.yearsExperience != null ? String(dp.yearsExperience) : "");
        setBio(dp.bio || "");
        setIsSurgeon(dp.isSurgeon || false);
      } catch {
        // Profile may not exist yet, that's fine
      }
    }

    setFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    const commonData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role,
      departmentId: departmentId ? Number(departmentId) : null,
      phone: phone.trim() || undefined,
      gender: (gender as any) || null,
      dateOfBirth: dateOfBirth || null,
      address: address.trim() || undefined,
    };

    try {
      let savedUserId: number | undefined;

      if (formMode === "create") {
        if (!email.trim() || !password.trim()) {
          toast.error("Email and Password are required for new users.");
          setFormLoading(false);
          return;
        }
        const body: UserCreateRequest = {
          ...commonData,
          email: email.trim(),
          password: password.trim(),
        };
        const { data: newUser } = await adminApi.createUser(body);
        savedUserId = newUser.id;
        toast.success("User account created successfully!");
      } else if (selectedUser) {
        const body: UserUpdateRequest = commonData;
        await adminApi.updateUser(selectedUser.id, body);
        savedUserId = selectedUser.id;
        toast.success("User updated successfully!");
      }

      // If role is DOCTOR, also create/update the doctor profile
      if (role === "DOCTOR" && savedUserId) {
        const doctorProfileData: DoctorProfileUpdateRequest = {
          isSurgeon,
          specialty: specialty.trim() || undefined,
          licenseNumber: licenseNumber.trim() || undefined,
          yearsExperience: yearsExperience ? Number(yearsExperience) : undefined,
          bio: bio.trim() || undefined,
        };
        await clinicalApi.updateDoctorProfile(savedUserId, doctorProfileData);
        toast.success("Doctor profile saved.");
      }

      setFormOpen(false);
      await loadUsers(roleFilter || undefined);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to save user."));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    setDeactivateLoading(true);
    try {
      await adminApi.deactivateUser(deactivateTarget.id);
      toast.success(`User ${deactivateTarget.firstName} deactivated.`);
      setDeactivateOpen(false);
      setDeactivateTarget(null);
      await loadUsers(roleFilter || undefined);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to deactivate user."));
    } finally {
      setDeactivateLoading(false);
    }
  };

  const filtered = users.filter((u) => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const matchSearch =
      fullName.includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "All" ||
      (statusFilter === "active" && u.isActive) ||
      (statusFilter === "inactive" && !u.isActive);
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="Manage all hospital staff accounts"
        actions={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium hover:opacity-90 transition-all cursor-pointer"
          >
            <Plus size={15} />Add New User
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] mb-5 flex flex-wrap gap-3 items-center" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2 bg-[#F0F4F8] rounded-lg px-3 py-2 flex-1 min-w-[200px]">
          <Search size={15} className="text-[#64748B] shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="bg-transparent text-sm w-full outline-none text-[#0F172A] placeholder:text-[#94A3B8]"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as UserRole | typeof ALL_ROLES_FILTER)}
          className="h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm text-[#0F172A] bg-white outline-none focus:ring-2 focus:ring-[#0EA5E9]"
        >
          <option value={ALL_ROLES_FILTER}>All Roles</option>
          {ALL_ROLE_FILTER_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm text-[#0F172A] bg-white outline-none focus:ring-2 focus:ring-[#0EA5E9]"
        >
          <option value="All">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <span className="animate-spin rounded-full h-8 w-8 border-4 border-[#1E3A5F] border-t-transparent" />
              <span className="text-sm text-[#64748B]">Loading users...</span>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  {["Name / Email", "Role", "Department", "Gender", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-[#64748B]">No users found.</td>
                  </tr>
                ) : (
                  filtered.map((u, i) => (
                    <tr key={u.id} className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors ${i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                            {u.firstName[0]}{u.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium text-[#0F172A]">{u.firstName} {u.lastName}</p>
                            <p className="text-xs text-[#64748B]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant="info">{u.role}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-[#64748B]">{u.departmentName ?? "—"}</td>
                      <td className="px-5 py-3.5 text-[#64748B]">{u.gender || "—"}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={u.isActive ? "active" : "inactive"} dot>{u.isActive ? "Active" : "Inactive"}</Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          {/* Patients can't be edited from here */}
                          {u.role !== "PATIENT" && (
                            <button
                              onClick={() => openEdit(u)}
                              className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#0F172A] hover:bg-[#F0F4F8] transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Edit2 size={12} /> Edit
                            </button>
                          )}
                          {u.isActive && (
                            <button
                              onClick={() => {
                                setDeactivateTarget(u);
                                setDeactivateOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-red-50 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create / Edit slide-over */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/35 backdrop-blur-xs" onClick={() => !formLoading && setFormOpen(false)} />
          <div className="w-[440px] bg-white h-full shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
              <div>
                <h3 className="font-semibold text-[#0F172A]">{formMode === "create" ? "Add New Staff Member" : "Edit Staff Member"}</h3>
                {role === "DOCTOR" && (
                  <p className="text-xs text-[#0EA5E9] flex items-center gap-1 mt-0.5">
                    <Stethoscope size={11} /> Includes doctor profile fields
                  </p>
                )}
              </div>
              <button disabled={formLoading} onClick={() => setFormOpen(false)} className="cursor-pointer">
                <X size={18} className="text-[#64748B]" />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">

                {/* ── Account Info ── */}
                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Account Information</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#0F172A] mb-1">First Name</label>
                    <input
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#0F172A] mb-1">Last Name</label>
                    <input
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                    />
                  </div>
                </div>

                {formMode === "create" && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-[#0F172A] mb-1">Email</label>
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#0F172A] mb-1">Password</label>
                      <input
                        required
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-medium text-[#0F172A] mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    disabled={formMode === "edit"}
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] disabled:bg-[#F8FAFC] disabled:text-[#94A3B8]"
                  >
                    {CREATABLE_ROLES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#0F172A] mb-1">Department</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                  >
                    <option value="">No Department / General</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#0F172A] mb-1">Phone Number</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#0F172A] mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#0F172A] mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#0F172A] mb-1">Address</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    className="w-full p-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                  />
                </div>

                {/* ── Doctor Profile ── */}
                {role === "DOCTOR" && (
                  <>
                    <div className="border-t border-[#E2E8F0] pt-4">
                      <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-4 flex items-center gap-1.5">
                        <Stethoscope size={12} className="text-[#0EA5E9]" /> Doctor Profile
                      </p>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-[#0F172A] mb-1">Specialty</label>
                          <input
                            value={specialty}
                            onChange={(e) => setSpecialty(e.target.value)}
                            placeholder="e.g. Cardiology, Pediatrics"
                            className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#0F172A] mb-1">License Number</label>
                          <input
                            value={licenseNumber}
                            onChange={(e) => setLicenseNumber(e.target.value)}
                            placeholder="Medical license number"
                            className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#0F172A] mb-1">Years of Experience</label>
                          <input
                            type="number"
                            min={0}
                            max={60}
                            value={yearsExperience}
                            onChange={(e) => setYearsExperience(e.target.value)}
                            placeholder="e.g. 8"
                            className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#0F172A] mb-1">Bio / Notes</label>
                          <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={3}
                            placeholder="Short professional biography..."
                            className="w-full p-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                          />
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer select-none">
                          <div
                            onClick={() => setIsSurgeon(!isSurgeon)}
                            className={`w-10 h-5 rounded-full transition-colors relative ${isSurgeon ? "bg-[#0EA5E9]" : "bg-[#CBD5E1]"}`}
                          >
                            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isSurgeon ? "translate-x-5" : "translate-x-0.5"}`} />
                          </div>
                          <span className="text-sm font-medium text-[#0F172A]">Qualified Surgeon</span>
                        </label>
                      </div>
                    </div>
                  </>
                )}

              </div>

              <div className="px-6 py-4 border-t border-[#E2E8F0] flex gap-3">
                <button
                  type="button"
                  disabled={formLoading}
                  onClick={() => setFormOpen(false)}
                  className="flex-1 h-10 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 h-10 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium hover:opacity-90 cursor-pointer flex items-center justify-center gap-2"
                >
                  {formLoading ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate confirmation dialog */}
      {deactivateOpen && deactivateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => !deactivateLoading && setDeactivateOpen(false)} />
          <div className="relative bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <ShieldAlert size={28} />
              <h3 className="text-lg font-bold text-[#0F172A]">Deactivate User Account</h3>
            </div>
            <p className="text-sm text-[#64748B] leading-relaxed">
              Are you sure you want to deactivate the account for <strong>{deactivateTarget.firstName} {deactivateTarget.lastName}</strong> ({deactivateTarget.email})?
              They will be instantly logged out and blocked from logging in.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                disabled={deactivateLoading}
                onClick={() => setDeactivateOpen(false)}
                className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC] cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={deactivateLoading}
                onClick={handleDeactivate}
                className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 cursor-pointer flex items-center gap-2"
              >
                {deactivateLoading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Deactivating...
                  </>
                ) : (
                  "Deactivate User"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
