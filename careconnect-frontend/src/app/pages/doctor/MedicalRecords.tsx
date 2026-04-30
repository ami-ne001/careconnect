import { useState } from "react";
import { Search, Stethoscope, FlaskConical, Pill, FileText, FileMinus, Eye } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";

const records = [
  { type: "Consultation Notes", icon: <Stethoscope size={18} />, date: "June 14, 2025", patient: "Ahmed Al-Farsi", doctor: "Dr. Sarah Mitchell", summary: "Hypertension follow-up. BP well-controlled at 128/84. Continue current medications.", color: "bg-blue-100 text-blue-600" },
  { type: "Lab Report", icon: <FlaskConical size={18} />, date: "June 13, 2025", patient: "John Whitaker", doctor: "Dr. Sarah Mitchell", summary: "Lipid Panel: LDL 142 mg/dL (high), HDL 38 mg/dL (low). Recommend statin therapy review.", color: "bg-purple-100 text-purple-600" },
  { type: "Consultation Notes", icon: <Stethoscope size={18} />, date: "June 12, 2025", patient: "Maria Santos", doctor: "Dr. Sarah Mitchell", summary: "T2DM management. HbA1c 7.8%. Insulin dosage adjusted. Dietary counseling given.", color: "bg-blue-100 text-blue-600" },
  { type: "Prescription", icon: <Pill size={18} />, date: "June 10, 2025", patient: "Carlos Rivera", doctor: "Dr. Sarah Mitchell", summary: "Metformin 500mg BD renewed for 90 days. Glipizide 5mg added.", color: "bg-green-100 text-green-600" },
  { type: "Imaging", icon: <FileText size={18} />, date: "June 8, 2025", patient: "Oliver Bennett", doctor: "Dr. Sarah Mitchell", summary: "X-Ray Lumbar Spine: L4–L5 mild disc space narrowing. No fractures.", color: "bg-orange-100 text-orange-600" },
  { type: "Discharge Summary", icon: <FileMinus size={18} />, date: "May 28, 2025", patient: "Fatima Al-Zahrani", doctor: "Dr. Sarah Mitchell", summary: "Admitted for cardiac monitoring. Arrhythmia controlled. Discharged on Bisoprolol.", color: "bg-red-100 text-red-600" },
  { type: "Lab Report", icon: <FlaskConical size={18} />, date: "May 22, 2025", patient: "Ahmed Al-Farsi", doctor: "Dr. Sarah Mitchell", summary: "Renal Function Panel: eGFR 68 mL/min. Mild CKD stage 2. Follow-up in 3 months.", color: "bg-purple-100 text-purple-600" },
  { type: "Referral Letter", icon: <FileText size={18} />, date: "May 15, 2025", patient: "Thomas Grey", doctor: "Dr. Sarah Mitchell", summary: "Referred to Cardiology for CABG evaluation. Background of multi-vessel CAD.", color: "bg-slate-100 text-slate-600" },
];

const typeFilter = ["All Types", "Consultation Notes", "Lab Report", "Prescription", "Imaging", "Discharge Summary", "Referral Letter"];

export function DoctorMedicalRecords() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All Types");

  const filtered = records.filter((r) => {
    const matchSearch = r.patient.toLowerCase().includes(search.toLowerCase()) || r.summary.toLowerCase().includes(search.toLowerCase());
    const matchType = type === "All Types" || r.type === type;
    return matchSearch && matchType;
  });

  return (
    <div>
      <PageHeader title="Medical Records" subtitle="View and manage patient medical documentation" />

      <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] mb-5 flex flex-wrap gap-3 items-center" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2 bg-[#F0F4F8] rounded-lg px-3 py-2 flex-1 min-w-[200px]">
          <Search size={15} className="text-[#64748B]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search records by patient or summary..." className="bg-transparent text-sm w-full outline-none" />
        </div>
        <select value={type} onChange={(e) => setType(e.target.value)} className="h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm bg-white outline-none">
          {typeFilter.map((t) => <option key={t}>{t}</option>)}
        </select>
        <input type="date" defaultValue="2025-05-01" className="h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm bg-white outline-none text-[#64748B]" />
        <input type="date" defaultValue="2025-06-14" className="h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm bg-white outline-none text-[#64748B]" />
      </div>

      <div className="space-y-3">
        {filtered.map((r, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-[#E2E8F0] flex items-start gap-4 hover:shadow-md transition-all" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div className={`w-10 h-10 rounded-xl ${r.color} flex items-center justify-center shrink-0`}>
              {r.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">{r.type}</span>
                <span className="text-xs text-[#64748B]">{r.date}</span>
              </div>
              <p className="font-semibold text-[#0F172A] mb-0.5">{r.patient}</p>
              <p className="text-sm text-[#64748B] leading-relaxed">{r.summary}</p>
              <p className="text-xs text-[#94A3B8] mt-1">{r.doctor}</p>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#0F172A] hover:bg-[#F0F4F8] shrink-0">
              <Eye size={13} />View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
