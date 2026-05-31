import { useState, useEffect } from "react";
import { Save, Camera, Plus, X, Eye, EyeOff } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { patientApi, authApi } from "@/api";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";
import { useAuth } from "@/store/useAuth";
import type { AdminUser } from "@/types";
import type { PatientProfileResponse, AllergyResponse, ChronicConditionResponse } from "@/types";

export function PatientProfilePage() {
  const { userId } = useAuth();

  // User account data (from auth-service)
  const [userInfo, setUserInfo] = useState<AdminUser | null>(null);

  // Auth-service editable fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("MALE");

  // Patient-service editable fields
  const [profile, setProfile] = useState<PatientProfileResponse | null>(null);
  const [bloodType, setBloodType] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [insuranceNumber, setInsuranceNumber] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");

  // Medical lists
  const [allergies, setAllergies] = useState<AllergyResponse[]>([]);
  const [conditions, setConditions] = useState<ChronicConditionResponse[]>([]);

  // Add allergy form
  const [newAllergen, setNewAllergen] = useState("");
  const [newSeverity, setNewSeverity] = useState("MEDIUM");
  const [newReaction, setNewReaction] = useState("");

  // Add condition form
  const [newConditionName, setNewConditionName] = useState("");

  // Password change
  const [showPass, setShowPass] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!userId) {
      toast.error("Session not found. Please log in again.");
      setLoading(false);
      return;
    }

    Promise.all([
      authApi.getMe(),
      patientApi.getProfileByUserId(userId),
    ])
      .then(([{ data: user }, { data: pat }]) => {
        // Populate user info
        setUserInfo(user);
        setFirstName(user.firstName || "");
        setLastName(user.lastName || "");
        setEmail(user.email || "");
        setPhone(user.phone || "");
        setAddress(user.address || "");
        setDateOfBirth(user.dateOfBirth || "");
        setGender(user.gender || "MALE");

        // Populate patient profile
        setProfile(pat);
        setBloodType(pat.bloodType || "");
        setNationalId(pat.nationalId || "");
        setInsuranceProvider(pat.insuranceProvider || "");
        setInsuranceNumber(pat.insuranceNumber || "");
        setEmergencyContactName(pat.emergencyContactName || "");
        setEmergencyContactPhone(pat.emergencyContactPhone || "");
        setAllergies(pat.allergies || []);
        setConditions(pat.chronicConditions || []);
      })
      .catch((err) => {
        toast.error(getApiErrorMessage(err, "Failed to load profile."));
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const handleSave = async () => {
    if (!profile || !userInfo) return;
    setSubmitting(true);
    try {
      // 1. Update personal details in auth-service
      await authApi.updateMe({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role: userInfo.role,
        departmentId: userInfo.departmentId,
        phone: phone.trim() || undefined,
        gender: gender as any,
        dateOfBirth: dateOfBirth || undefined,
        address: address.trim() || undefined,
      });

      // 2. Update medical details in patient-service
      await patientApi.updateProfile(profile.id, {
        bloodType: bloodType || undefined,
        nationalId: nationalId.trim() || undefined,
        insuranceProvider: insuranceProvider.trim() || undefined,
        insuranceNumber: insuranceNumber.trim() || undefined,
        emergencyContactName: emergencyContactName.trim() || undefined,
        emergencyContactPhone: emergencyContactPhone.trim() || undefined,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      toast.success("Profile saved successfully!");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to save profile."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAllergy = async () => {
    if (!profile || !newAllergen.trim()) return;
    try {
      const { data } = await patientApi.addAllergy(profile.id, {
        allergen: newAllergen.trim(),
        severity: newSeverity,
        reaction: newReaction.trim() || undefined,
      });
      setAllergies((prev) => [...prev, data]);
      setNewAllergen("");
      setNewReaction("");
      toast.success("Allergy added.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to add allergy."));
    }
  };

  const handleRemoveAllergy = async (allergyId: number) => {
    if (!profile) return;
    try {
      await patientApi.removeAllergy(profile.id, allergyId);
      setAllergies((prev) => prev.filter((a) => a.id !== allergyId));
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to remove allergy."));
    }
  };

  const handleAddCondition = async () => {
    if (!profile || !newConditionName.trim()) return;
    try {
      const { data } = await patientApi.addChronicCondition(profile.id, {
        conditionName: newConditionName.trim(),
        diagnosisDate: new Date().toISOString().split("T")[0],
      });
      setConditions((prev) => [...prev, data]);
      setNewConditionName("");
      toast.success("Condition added.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to add condition."));
    }
  };

  const handleRemoveCondition = async (conditionId: number) => {
    if (!profile) return;
    try {
      await patientApi.removeChronicCondition(profile.id, conditionId);
      setConditions((prev) => prev.filter((c) => c.id !== conditionId));
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to remove condition."));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <span className="animate-spin rounded-full h-8 w-8 border-4 border-[#1E3A5F] border-t-transparent" />
        <span className="text-sm text-[#64748B]">Loading your profile…</span>
      </div>
    );
  }

  const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "P";
  const inputCls =
    "w-full h-11 px-4 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9]";
  const labelCls = "block text-xs font-medium text-[#64748B] mb-1.5";

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Manage your personal and medical information" />

      <div className="space-y-6">
        {/* ── Personal + Contact Info ── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Personal Info */}
          <div
            className="bg-white rounded-xl border border-[#E2E8F0] p-6"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
          >
            <h3 className="font-semibold text-[#0F172A] mb-5">Personal Information</h3>

            {/* Avatar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1E3A5F] to-[#0EA5E9] flex items-center justify-center text-white text-2xl font-bold select-none">
                  {initials}
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#0EA5E9] flex items-center justify-center text-white hover:bg-[#0284C7] cursor-pointer transition-colors">
                  <Camera size={13} />
                </button>
              </div>
              <div>
                <p className="font-semibold text-[#0F172A]">{firstName} {lastName}</p>
                <p className="text-sm text-[#64748B]">Patient ID: #{profile?.id ?? "—"}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>First Name</label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Last Name</label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Date of Birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className={`${inputCls} bg-white`}
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Blood Type</label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className={`${inputCls} bg-white`}
                  >
                    <option value="">— Select —</option>
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bt) => (
                      <option key={bt} value={bt}>{bt}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>National ID</label>
                <input
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="ID / Passport number"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Contact + Insurance */}
          <div className="space-y-5">
            <div
              className="bg-white rounded-xl border border-[#E2E8F0] p-6"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <h3 className="font-semibold text-[#0F172A] mb-5">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Email Address</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Phone Number</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Address</label>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street Address, City"
                    className={inputCls}
                  />
                </div>
              </div>

              <h4 className="font-medium text-[#0F172A] mt-5 mb-4">Emergency Contact</h4>
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Name</label>
                  <input
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="Full name"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Phone</label>
                  <input
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            <div
              className="bg-white rounded-xl border border-[#E2E8F0] p-6"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <h3 className="font-semibold text-[#0F172A] mb-4">Insurance Details</h3>
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Insurance Provider</label>
                  <input
                    value={insuranceProvider}
                    onChange={(e) => setInsuranceProvider(e.target.value)}
                    placeholder="e.g. BlueCross BlueShield"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Insurance Number</label>
                  <input
                    value={insuranceNumber}
                    onChange={(e) => setInsuranceNumber(e.target.value)}
                    placeholder="Policy / Member ID"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Medical Info ── */}
        <div
          className="bg-white rounded-xl border border-[#E2E8F0] p-6"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
        >
          <h3 className="font-semibold text-[#0F172A] mb-5">Medical Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Allergies */}
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">
                Allergies
              </label>
              <div className="flex flex-wrap gap-2 mb-3 min-h-[28px]">
                {allergies.length === 0 && (
                  <span className="text-xs text-[#94A3B8] italic">None recorded</span>
                )}
                {allergies.map((a) => (
                  <span
                    key={a.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEE2E2] text-[#991B1B] text-xs font-medium"
                  >
                    {a.allergen}
                    <span className="opacity-60 text-[10px]">({a.severity})</span>
                    <button
                      onClick={() => handleRemoveAllergy(a.id)}
                      className="cursor-pointer hover:text-red-900"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    value={newAllergen}
                    onChange={(e) => setNewAllergen(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddAllergy()}
                    placeholder="Add allergy…"
                    className="flex-1 h-9 px-3 rounded-lg border border-[#E2E8F0] text-xs focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9]"
                  />
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value)}
                    className="h-9 px-2 rounded-lg border border-[#E2E8F0] text-xs bg-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                  <button
                    onClick={handleAddAllergy}
                    className="w-9 h-9 rounded-lg bg-[#EFF6FF] text-[#0EA5E9] flex items-center justify-center hover:bg-[#0EA5E9]/20 cursor-pointer shrink-0"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <input
                  value={newReaction}
                  onChange={(e) => setNewReaction(e.target.value)}
                  placeholder="Reaction (optional)…"
                  className="w-full h-9 px-3 rounded-lg border border-[#E2E8F0] text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Chronic Conditions */}
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">
                Chronic Conditions
              </label>
              <div className="flex flex-wrap gap-2 mb-3 min-h-[28px]">
                {conditions.length === 0 && (
                  <span className="text-xs text-[#94A3B8] italic">None recorded</span>
                )}
                {conditions.map((c) => (
                  <span
                    key={c.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEF3C7] text-[#92400E] text-xs font-medium"
                  >
                    {c.conditionName}
                    <button
                      onClick={() => handleRemoveCondition(c.id)}
                      className="cursor-pointer hover:text-amber-900"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newConditionName}
                  onChange={(e) => setNewConditionName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCondition()}
                  placeholder="Add condition…"
                  className="flex-1 h-9 px-3 rounded-lg border border-[#E2E8F0] text-xs focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9]"
                />
                <button
                  onClick={handleAddCondition}
                  className="w-9 h-9 rounded-lg bg-[#FEF3C7] text-[#F59E0B] flex items-center justify-center hover:bg-[#FDE68A] cursor-pointer"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Save ── */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={submitting}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50 ${
              saved
                ? "bg-[#10B981] text-white"
                : "bg-[#1E3A5F] text-white hover:bg-[#162d4a]"
            }`}
          >
            {submitting ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Saving…
              </>
            ) : (
              <>
                <Save size={15} />
                {saved ? "Saved!" : "Save Changes"}
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
