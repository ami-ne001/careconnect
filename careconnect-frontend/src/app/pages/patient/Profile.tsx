import { useState } from "react";
import { Save, Camera, Plus, X, Eye, EyeOff } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";

const initialAllergies = ["Penicillin", "Sulfa drugs", "Latex"];
const initialConditions = ["Hypertension", "Type 2 Diabetes", "Hyperlipidemia"];
const currentMeds = [
  { name: "Amlodipine 5mg", dose: "1 tablet once daily" },
  { name: "Aspirin 81mg", dose: "1 tablet once daily" },
  { name: "Lisinopril 10mg", dose: "1 tablet once daily" },
];

export function PatientProfilePage() {
  const [allergies, setAllergies] = useState(initialAllergies);
  const [conditions, setConditions] = useState(initialConditions);
  const [newAllergy, setNewAllergy] = useState("");
  const [newCondition, setNewCondition] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Manage your personal and medical information" />

      <div className="space-y-6">
        {/* Personal + Contact Info */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Personal Info */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h3 className="font-semibold text-[#0F172A] mb-5">Personal Information</h3>
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-2xl font-bold">
                  AH
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#0EA5E9] flex items-center justify-center text-white hover:bg-[#0284C7]">
                  <Camera size={13} />
                </button>
              </div>
              <div>
                <p className="font-semibold text-[#0F172A]">Ahmed Hassan</p>
                <p className="text-sm text-[#64748B]">Patient ID: PT-00412</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">First Name</label>
                  <input
                    defaultValue="Ahmed"
                    className="w-full h-11 px-4 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Last Name</label>
                  <input
                    defaultValue="Hassan"
                    className="w-full h-11 px-4 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  defaultValue="1978-04-15"
                  className="w-full h-11 px-4 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Gender</label>
                  <select className="w-full h-11 px-4 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9] bg-white">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Blood Type</label>
                  <select className="w-full h-11 px-4 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9] bg-white">
                    <option>A+</option>
                    <option>A-</option>
                    <option>B+</option>
                    <option>B-</option>
                    <option selected>O+</option>
                    <option>O-</option>
                    <option>AB+</option>
                    <option>AB-</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1.5">National ID</label>
                <input
                  defaultValue="28110****1234"
                  className="w-full h-11 px-4 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9]"
                />
              </div>
            </div>
          </div>

          {/* Contact + Insurance */}
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h3 className="font-semibold text-[#0F172A] mb-5">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Email Address</label>
                  <input
                    defaultValue="ahmed.hassan@email.com"
                    type="email"
                    className="w-full h-11 px-4 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Phone Number</label>
                  <input
                    defaultValue="+1 (555) 847-2910"
                    type="tel"
                    className="w-full h-11 px-4 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Address</label>
                  <input
                    defaultValue="124 Maple Street, Springfield, IL 62701"
                    className="w-full h-11 px-4 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9]"
                  />
                </div>
              </div>
              <h4 className="font-medium text-[#0F172A] mt-5 mb-4">Emergency Contact</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] mb-1.5">Name</label>
                    <input
                      defaultValue="Sara Hassan"
                      className="w-full h-11 px-4 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] mb-1.5">Relationship</label>
                    <input
                      defaultValue="Spouse"
                      className="w-full h-11 px-4 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Phone</label>
                  <input
                    defaultValue="+1 (555) 291-0387"
                    className="w-full h-11 px-4 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9]"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <h3 className="font-semibold text-[#0F172A] mb-4">Insurance Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Insurance Provider</label>
                  <input
                    defaultValue="BlueCross BlueShield"
                    className="w-full h-11 px-4 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] mb-1.5">Policy Number</label>
                    <input
                      defaultValue="BCB-9821-XX"
                      className="w-full h-11 px-4 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#64748B] mb-1.5">Group Number</label>
                    <input
                      defaultValue="GRP-44821"
                      className="w-full h-11 px-4 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Info */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <h3 className="font-semibold text-[#0F172A] mb-5">Medical Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Allergies */}
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">Allergies</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {allergies.map((a) => (
                  <span
                    key={a}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEE2E2] text-[#991B1B] text-xs font-medium"
                  >
                    {a}
                    <button onClick={() => setAllergies(allergies.filter((x) => x !== a))}>
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  placeholder="Add allergy..."
                  className="flex-1 h-9 px-3 rounded-lg border border-[#E2E8F0] text-xs focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newAllergy.trim()) {
                      setAllergies([...allergies, newAllergy.trim()]);
                      setNewAllergy("");
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (newAllergy.trim()) {
                      setAllergies([...allergies, newAllergy.trim()]);
                      setNewAllergy("");
                    }
                  }}
                  className="w-9 h-9 rounded-lg bg-[#EFF6FF] text-[#0EA5E9] flex items-center justify-center hover:bg-[#0EA5E9]/20"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Chronic Conditions */}
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">Chronic Conditions</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {conditions.map((c) => (
                  <span
                    key={c}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEF3C7] text-[#92400E] text-xs font-medium"
                  >
                    {c}
                    <button onClick={() => setConditions(conditions.filter((x) => x !== c))}>
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  placeholder="Add condition..."
                  className="flex-1 h-9 px-3 rounded-lg border border-[#E2E8F0] text-xs focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newCondition.trim()) {
                      setConditions([...conditions, newCondition.trim()]);
                      setNewCondition("");
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (newCondition.trim()) {
                      setConditions([...conditions, newCondition.trim()]);
                      setNewCondition("");
                    }
                  }}
                  className="w-9 h-9 rounded-lg bg-[#FEF3C7] text-[#F59E0B] flex items-center justify-center hover:bg-[#FDE68A]"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Current Medications */}
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">Current Medications</label>
              <div className="space-y-2">
                {currentMeds.map((m) => (
                  <div key={m.name} className="flex items-center gap-2 p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                    <span className="text-base">💊</span>
                    <div>
                      <p className="text-xs font-medium text-[#0F172A]">{m.name}</p>
                      <p className="text-xs text-[#64748B]">{m.dose}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
              saved
                ? "bg-[#10B981] text-white"
                : "bg-[#1E3A5F] text-white hover:bg-[#162d4a]"
            }`}
          >
            <Save size={15} />
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <h3 className="font-semibold text-[#0F172A] mb-5">Change Password</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">Current Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  defaultValue="••••••••"
                  className="w-full h-11 px-4 pr-10 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9]"
                />
                <button
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">New Password</label>
              <input
                type="password"
                placeholder="New password"
                className="w-full h-11 px-4 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">Confirm New Password</label>
              <input
                type="password"
                placeholder="Confirm password"
                className="w-full h-11 px-4 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9]"
              />
            </div>
          </div>
          <button className="mt-4 px-5 py-2 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC]">
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}
