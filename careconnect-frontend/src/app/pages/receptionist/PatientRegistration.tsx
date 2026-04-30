import { useState } from "react";
import { Upload, Plus, X } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";

const recentlyRegistered = [
  { name: "Yasmine Tazi", id: "PAT-1056", time: "Today, 09:42 AM" },
  { name: "Luca Bianchi", id: "PAT-1055", time: "Today, 08:15 AM" },
  { name: "Priya Sharma", id: "PAT-1054", time: "Yesterday, 03:30 PM" },
  { name: "Chen Wei", id: "PAT-1053", time: "Yesterday, 11:00 AM" },
  { name: "David Okonkwo", id: "PAT-1052", time: "June 13, 2:00 PM" },
];

export function PatientRegistration() {
  const [allergies, setAllergies] = useState(["Penicillin"]);
  const [conditions, setConditions] = useState(["Hypertension"]);
  const [allergyInput, setAllergyInput] = useState("");
  const [conditionInput, setConditionInput] = useState("");

  const addTag = (list: string[], setList: (v: string[]) => void, input: string, setInput: (v: string) => void) => {
    if (input.trim()) { setList([...list, input.trim()]); setInput(""); }
  };
  const removeTag = (list: string[], setList: (v: string[]) => void, val: string) => setList(list.filter((t) => t !== val));

  return (
    <div>
      <PageHeader title="Patient Registration" subtitle="Register a new patient in the system" />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h3 className="font-semibold text-[#0F172A] mb-5">New Patient Form</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left column */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Personal Information</h4>
                {[
                  { label: "First Name", placeholder: "Enter first name" },
                  { label: "Last Name", placeholder: "Enter last name" },
                  { label: "Date of Birth", type: "date" },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">{f.label}</label>
                    <input type={f.type || "text"} placeholder={f.placeholder} className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Gender</label>
                  <select className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]">
                    <option>Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">National ID / Passport</label>
                  <input placeholder="Enter ID number" className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Blood Type</label>
                  <select className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]">
                    <option>Select blood type</option>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Photo</label>
                  <div className="border-2 border-dashed border-[#E2E8F0] rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-[#0EA5E9] transition-colors">
                    <Upload size={20} className="text-[#94A3B8]" />
                    <span className="text-xs text-[#64748B]">Upload patient photo</span>
                    <span className="text-xs text-[#94A3B8]">JPG, PNG up to 2MB</span>
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Contact & Medical Info</h4>
                {[
                  { label: "Phone Number", placeholder: "+1 (555) 000-0000" },
                  { label: "Email Address", placeholder: "patient@email.com", type: "email" },
                  { label: "Address", placeholder: "Enter full address" },
                  { label: "Emergency Contact", placeholder: "Name — Relationship — Phone" },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">{f.label}</label>
                    <input type={f.type || "text"} placeholder={f.placeholder} className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
                  </div>
                ))}

                {/* Allergies */}
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Allergies</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {allergies.map((a) => (
                      <span key={a} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                        {a}<button onClick={() => removeTag(allergies, setAllergies, a)}><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={allergyInput} onChange={(e) => setAllergyInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTag(allergies, setAllergies, allergyInput, setAllergyInput)} placeholder="Add allergy..." className="flex-1 h-9 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
                    <button onClick={() => addTag(allergies, setAllergies, allergyInput, setAllergyInput)} className="w-9 h-9 rounded-lg bg-[#0EA5E9] text-white flex items-center justify-center"><Plus size={14} /></button>
                  </div>
                </div>

                {/* Chronic Conditions */}
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Chronic Conditions</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {conditions.map((c) => (
                      <span key={c} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                        {c}<button onClick={() => removeTag(conditions, setConditions, c)}><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={conditionInput} onChange={(e) => setConditionInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTag(conditions, setConditions, conditionInput, setConditionInput)} placeholder="Add condition..." className="flex-1 h-9 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
                    <button onClick={() => addTag(conditions, setConditions, conditionInput, setConditionInput)} className="w-9 h-9 rounded-lg bg-[#0EA5E9] text-white flex items-center justify-center"><Plus size={14} /></button>
                  </div>
                </div>

                {[
                  { label: "Insurance Provider", placeholder: "e.g. BlueCross Health" },
                  { label: "Insurance Number", placeholder: "INS-XXXXXXX" },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">{f.label}</label>
                    <input placeholder={f.placeholder} className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-5 border-t border-[#E2E8F0]">
              <button className="flex-1 h-11 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC]">Save as Draft</button>
              <button className="flex-1 h-11 rounded-lg bg-[#1E3A5F] text-white text-sm font-semibold hover:opacity-90">Register Patient</button>
            </div>
          </div>
        </div>

        {/* Recently registered */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)", height: "fit-content" }}>
          <h3 className="font-semibold text-[#0F172A] mb-4">Recently Registered</h3>
          <div className="space-y-3">
            {recentlyRegistered.map((r, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="w-9 h-9 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {r.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0F172A] truncate">{r.name}</p>
                  <p className="text-xs text-[#94A3B8]">{r.id}</p>
                </div>
                <p className="text-xs text-[#64748B] shrink-0">{r.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
