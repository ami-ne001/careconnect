import { useState } from "react";
import { Eye, X } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";

const records = [
  { type: "Surgery", icon: "🔪", date: "June 14, 2025 (Scheduled: June 17)", doctor: "Dr. Sarah Mitchell", title: "Coronary Artery Bypass Graft", summary: "Scheduled June 17, 2025 — Dr. Sarah Mitchell — Status: Pre-Op Prep. Report to OR-2 at 06:30 AM. Fasting from midnight.", color: "bg-[#1E3A5F]/10 text-[#1E3A5F]" },
  { type: "Admission", icon: "🛏️", date: "June 13, 2025", doctor: "Dr. Sarah Mitchell", title: "Admitted — Room 301, Cardiology Ward", summary: "Patient admitted June 13, 2025 to Room 301 in the Cardiology Ward. Admitting physician: Dr. Sarah Mitchell. Diagnosis: Hypertensive Crisis. Expected discharge June 18, 2025.", color: "bg-sky-100 text-sky-600" },
  { type: "Consultation Notes", icon: "🩺", date: "June 14, 2025", doctor: "Dr. Sarah Mitchell", title: "Hypertension Follow-up", summary: "BP well-controlled at 128/84. Continue Amlodipine and Aspirin. Return in 1 month.", color: "bg-blue-100 text-blue-600" },
  { type: "Lab Report", icon: "🔬", date: "June 13, 2025", doctor: "Dr. Sarah Mitchell", title: "Complete Blood Count", summary: "All values within normal range. Hemoglobin: 14.2 g/dL, WBC: 6.8×10³/μL, Platelets: 245×10³/μL.", color: "bg-purple-100 text-purple-600" },
  { type: "Prescription", icon: "💊", date: "June 10, 2025", doctor: "Dr. Sarah Mitchell", title: "Medication Renewal", summary: "Amlodipine 5mg once daily and Aspirin 81mg once daily renewed for 30 days each.", color: "bg-green-100 text-green-600" },
  { type: "Lab Report", icon: "🔬", date: "May 22, 2025", doctor: "Dr. Sarah Mitchell", title: "Renal Function Panel", summary: "eGFR: 68 mL/min/1.73m². Mild CKD Stage 2. Creatinine: 1.2 mg/dL. Follow-up in 3 months.", color: "bg-purple-100 text-purple-600" },
  { type: "Consultation Notes", icon: "🩺", date: "May 15, 2025", doctor: "Dr. Sarah Mitchell", title: "Blood Pressure Review", summary: "BP slightly elevated at 138/90. Medication dosage adjusted. Dietary changes recommended.", color: "bg-blue-100 text-blue-600" },
  { type: "Imaging", icon: "🫁", date: "Apr 10, 2025", doctor: "Dr. Sarah Mitchell", title: "Chest X-Ray", summary: "No acute cardiopulmonary process. Heart size normal. Lung fields clear.", color: "bg-orange-100 text-orange-600" },
  { type: "Prescription", icon: "💊", date: "Mar 12, 2025", doctor: "Dr. Sarah Mitchell", title: "New Medication", summary: "Lisinopril 10mg added to regimen for additional blood pressure control.", color: "bg-green-100 text-green-600" },
  { type: "Consultation Notes", icon: "🩺", date: "Jan 8, 2025", doctor: "Dr. Sarah Mitchell", title: "Annual Checkup", summary: "General health assessment. Hypertension well-managed. Stage 1 CKD noted. All other systems normal.", color: "bg-blue-100 text-blue-600" },
];

export function PatientMedicalRecords() {
  const [selected, setSelected] = useState<typeof records[0] | null>(null);
  const [typeFilter, setTypeFilter] = useState("All");

  const filtered = records.filter((r) => typeFilter === "All" || r.type === typeFilter);

  return (
    <div>
      <PageHeader title="Medical Records" subtitle="Your complete medical history" />

      <div className="flex gap-2 mb-5 flex-wrap">
        {["All", "Consultation Notes", "Lab Report", "Prescription", "Imaging", "Surgery", "Admission"].map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${typeFilter === t ? "bg-[#1E3A5F] text-white" : "bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-[#E2E8F0]" />
        <div className="space-y-5 pl-14">
          {filtered.map((r, i) => (
            <div key={i} className="relative">
              <div className={`absolute -left-9 top-3 w-10 h-10 rounded-full ${r.color} flex items-center justify-center text-base border-2 border-white`} style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                {r.icon}
              </div>
              <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] hover:shadow-md transition-all" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">{r.type}</span>
                      <span className="text-xs text-[#64748B]">· {r.date}</span>
                    </div>
                    <h4 className="font-semibold text-[#0F172A] mb-1">{r.title}</h4>
                    <p className="text-sm text-[#64748B] leading-relaxed">{r.summary}</p>
                    <p className="text-xs text-[#94A3B8] mt-1.5">{r.doctor}</p>
                  </div>
                  <button onClick={() => setSelected(r)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#0F172A] hover:bg-[#F0F4F8] shrink-0">
                    <Eye size={12} />View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${selected.color} flex items-center justify-center text-lg`}>{selected.icon}</div>
                <div>
                  <p className="text-xs text-[#94A3B8] uppercase tracking-wider">{selected.type}</p>
                  <h3 className="font-bold text-[#0F172A]">{selected.title}</h3>
                </div>
              </div>
              <button onClick={() => setSelected(null)}><X size={18} className="text-[#64748B]" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-[#F1F5F9] pb-2"><span className="text-[#64748B]">Date</span><span className="font-medium">{selected.date}</span></div>
              <div className="flex justify-between border-b border-[#F1F5F9] pb-2"><span className="text-[#64748B]">Doctor</span><span className="font-medium">{selected.doctor}</span></div>
              <div className="pb-2">
                <p className="text-[#64748B] mb-1">Summary</p>
                <p className="text-[#0F172A] leading-relaxed">{selected.summary}</p>
              </div>
            </div>
            <button className="w-full h-10 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC] mt-4">Download PDF</button>
          </div>
        </div>
      )}
    </div>
  );
}