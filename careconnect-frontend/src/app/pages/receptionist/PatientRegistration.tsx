import { useState } from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { receptionistApi, adminApi } from "@/api";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";

export function PatientRegistration() {
  /* ── Step 1 fields: adminApi.createUser ─────────────────── */
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("MALE");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  /* ── Step 2 fields: receptionistApi.createPatientProfile ── */
  const [bloodType, setBloodType] = useState("O+");
  const [nationalId, setNationalId] = useState("");
  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [insuranceNumber, setInsuranceNumber] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setFirstName(""); setLastName(""); setEmail(""); setPassword("");
    setDateOfBirth(""); setGender("MALE"); setPhone(""); setAddress("");
    setBloodType("O+"); setNationalId(""); setInsuranceProvider("");
    setInsuranceNumber(""); setEmergencyContactName(""); setEmergencyContactPhone("");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim() || !dateOfBirth) {
      toast.error("Please fill in all required fields: First name, Last name, Email, Password and Date of Birth.");
      return;
    }

    setSubmitting(true);
    try {
      // Step 1 — create the login account in auth-service
      const { data: newUser } = await adminApi.createUser({
        firstName: firstName.trim(),
        lastName:  lastName.trim(),
        email:     email.trim(),
        password:  password.trim(),
        role:      "PATIENT" as any,
        phone:     phone.trim()   || undefined,
        gender:    gender as any,
        dateOfBirth: dateOfBirth  || undefined,
        address:   address.trim() || undefined,
      });

      // Step 2 — create the patient profile in patient-service using the new user's ID
      await receptionistApi.createPatientProfile({
        userId:               newUser.id,
        bloodType:            bloodType         || undefined,
        nationalId:           nationalId.trim() || undefined,
        insuranceProvider:    insuranceProvider.trim()  || undefined,
        insuranceNumber:      insuranceNumber.trim()    || undefined,
        emergencyContactName: emergencyContactName.trim() || undefined,
        emergencyContactPhone:emergencyContactPhone.trim()|| undefined,
      });

      toast.success(`Patient account for ${firstName} ${lastName} created successfully!`);
      resetForm();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to register patient. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full h-11 px-3 rounded-lg border border-[#E2E8F0] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] transition-shadow";
  const labelCls = "block text-sm font-medium text-[#0F172A] mb-1.5";
  const sectionTitle = (n: string, text: string) => (
    <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E3A5F] border-l-2 border-[#0EA5E9] pl-2 mb-4">
      {n}. {text}
    </h4>
  );

  return (
    <div>
      <PageHeader
        title="Patient Registration"
        subtitle="Create a login account and medical profile for a new patient in one step"
      />

      <form onSubmit={handleRegister} noValidate className="grid grid-cols-1 gap-6">
        {/* ── Main Form ─────────────────────────────── */}
        <div
          className="bg-white rounded-xl border border-[#E2E8F0] p-6 animate-fade-in"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
        >
          <h3 className="font-semibold text-[#0F172A] mb-6 border-b pb-3 text-base">
            New Patient Form
          </h3>

          <div className="space-y-8">
            {/* ── Section 1: Account Credentials ── */}
            <div className="space-y-4">
              {sectionTitle("1", "Login Credentials")}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Email Address <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patient@example.com"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Temporary Password <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set a temporary password"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* ── Section 2: Personal Details ── */}
            <div className="space-y-4">
              {sectionTitle("2", "Personal Details")}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>First Name <span className="text-red-500">*</span></label>
                  <input
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Last Name <span className="text-red-500">*</span></label>
                  <input
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Date of Birth <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className={inputCls}
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Phone Number</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Address</label>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, City"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* ── Section 3: Medical Profile ── */}
            <div className="space-y-4">
              {sectionTitle("3", "Medical Profile")}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Blood Type</label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className={inputCls}
                  >
                    {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((bt) => (
                      <option key={bt} value={bt}>{bt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>National ID</label>
                  <input
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    placeholder="National ID / Passport No."
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* ── Section 4: Emergency Contact ── */}
            <div className="space-y-4">
              {sectionTitle("4", "Emergency Contact")}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Contact Name</label>
                  <input
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="Full name"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Contact Phone</label>
                  <input
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* ── Section 5: Insurance ── */}
            <div className="space-y-4">
              {sectionTitle("5", "Insurance Information")}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Insurance Provider</label>
                  <input
                    value={insuranceProvider}
                    onChange={(e) => setInsuranceProvider(e.target.value)}
                    placeholder="e.g. BlueCross Health"
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

          {/* ── Submit Button ── */}
          <div className="mt-8 pt-5 border-t border-[#E2E8F0]">
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-xl bg-[#1E3A5F] text-white text-sm font-semibold hover:bg-[#162d4a] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              {submitting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Creating Account &amp; Registering Profile…
                </>
              ) : (
                "Create Account & Register Profile"
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
