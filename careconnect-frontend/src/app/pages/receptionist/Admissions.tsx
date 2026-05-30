import { useState } from "react";
import { Bed, X, Plus, ChevronDown, Search, AlertCircle } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { StatCard } from "../../components/ui/StatCard";
import { useNavigate } from "react-router";

const admissions = [
  { patient: "Fatima Al-Zahrani", initials: "FA", room: "Room 301", ward: "Cardiology Ward", doctor: "Dr. Sarah Mitchell", admitDate: "June 13, 2025", dischargeDate: "June 18, 2025", diagnosis: "Hypertensive Crisis", status: "admitted" },
  { patient: "John Whitaker", initials: "JW", room: "Room 501", ward: "CCU", doctor: "Dr. Lisa Park", admitDate: "June 16, 2025", dischargeDate: "June 20, 2025", diagnosis: "NSTEMI — Post-intervention", status: "admitted" },
  { patient: "Carlos Rivera", initials: "CR", room: "Room 305", ward: "General Ward", doctor: "Dr. James Holloway", admitDate: "June 14, 2025", dischargeDate: "June 17, 2025", diagnosis: "Diabetic Ketoacidosis", status: "discharging" },
  { patient: "Maria Santos", initials: "MS", room: "Room 208", ward: "Endocrinology Ward", doctor: "Dr. Sarah Mitchell", admitDate: "June 15, 2025", dischargeDate: "June 19, 2025", diagnosis: "Uncontrolled Diabetes", status: "admitted" },
  { patient: "Thomas Green", initials: "TG", room: "Room 410", ward: "Orthopedics Ward", doctor: "Dr. Emily Ross", admitDate: "June 12, 2025", dischargeDate: "June 22, 2025", diagnosis: "Post Knee Replacement Surgery", status: "admitted" },
  { patient: "Sofia Ferreira", initials: "SF", room: "Room 402", ward: "Pediatrics Ward", doctor: "Dr. Mark Chen", admitDate: "June 16, 2025", dischargeDate: "June 18, 2025", diagnosis: "Acute Bronchiolitis", status: "admitted" },
  { patient: "Kevin Osei", initials: "KO", room: "Room 309", ward: "Cardiology Ward", doctor: "Dr. Sarah Mitchell", admitDate: "June 11, 2025", dischargeDate: "June 16, 2025", diagnosis: "Atrial Fibrillation", status: "discharging" },
  { patient: "Nadia Kowalski", initials: "NK", room: "Room 207", ward: "General Ward", doctor: "Dr. James Holloway", admitDate: "June 15, 2025", dischargeDate: "June 17, 2025", diagnosis: "Severe Gastroenteritis", status: "admitted" },
];

const wardRooms: Record<string, { number: string; status: "available" | "occupied" | "maintenance" }[]> = {
  "Cardiology Ward": [
    { number: "301", status: "occupied" }, { number: "302", status: "occupied" }, { number: "303", status: "available" },
    { number: "304", status: "available" }, { number: "305", status: "occupied" }, { number: "306", status: "maintenance" },
    { number: "307", status: "available" }, { number: "308", status: "occupied" },
  ],
  "General Ward": [
    { number: "201", status: "available" }, { number: "202", status: "occupied" }, { number: "203", status: "available" },
    { number: "204", status: "occupied" }, { number: "205", status: "maintenance" }, { number: "206", status: "available" },
    { number: "207", status: "occupied" }, { number: "208", status: "occupied" }, { number: "209", status: "available" }, { number: "210", status: "available" },
  ],
  "CCU": [
    { number: "501", status: "occupied" }, { number: "502", status: "occupied" }, { number: "503", status: "occupied" },
    { number: "504", status: "occupied" }, { number: "505", status: "occupied" }, { number: "506", status: "occupied" },
  ],
  "Orthopedics Ward": [
    { number: "401", status: "available" }, { number: "402", status: "occupied" }, { number: "403", status: "available" },
    { number: "404", status: "available" }, { number: "405", status: "maintenance" }, { number: "406", status: "available" },
  ],
  "Pediatrics Ward": [
    { number: "601", status: "occupied" }, { number: "602", status: "available" }, { number: "603", status: "available" },
    { number: "604", status: "occupied" },
  ],
  "Endocrinology Ward": [
    { number: "701", status: "available" }, { number: "702", status: "occupied" }, { number: "703", status: "available" },
    { number: "704", status: "available" },
  ],
};

const statusBadge = (s: string): "info" | "pending" | "completed" => {
  if (s === "admitted") return "info";
  if (s === "discharging") return "pending";
  return "completed";
};

function AdmitPatientModal({ onClose }: { onClose: () => void }) {
  const [selectedWard, setSelectedWard] = useState("Cardiology Ward");
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedBed, setSelectedBed] = useState("A");
  const wards = Object.keys(wardRooms);
  const rooms = wardRooms[selectedWard] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E8F0]">
          <h3 className="font-bold text-[#0F172A] text-lg">Admit New Patient</h3>
          <button onClick={onClose}><X size={18} className="text-[#64748B]" /></button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Patient Search</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input defaultValue="Ahmed Al-Farsi" className="w-full h-10 pl-9 pr-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" placeholder="Search by name or ID..." />
              </div>
              <div className="mt-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3 text-sm">
                <p className="font-medium text-[#0F172A]">Ahmed Al-Farsi</p>
                <p className="text-xs text-[#64748B]">DOB: Apr 12, 1985 · ID: NID-100016</p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Admitting Doctor</label>
              <div className="relative">
                <select className="w-full h-10 px-3 pr-8 rounded-lg border border-[#E2E8F0] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] appearance-none">
                  <option>Dr. Sarah Mitchell</option>
                  <option>Dr. Lisa Park</option>
                  <option>Dr. James Holloway</option>
                  <option>Dr. Emily Ross</option>
                  <option>Dr. Mark Chen</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Admission Reason / Diagnosis</label>
              <textarea rows={3} className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] resize-none" placeholder="Enter diagnosis or reason for admission..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Admission Date</label>
                <input type="date" defaultValue="2025-06-16" className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Expected Discharge</label>
                <input type="date" defaultValue="2025-06-20" className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Ward</label>
              <div className="relative">
                <select
                  value={selectedWard}
                  onChange={(e) => { setSelectedWard(e.target.value); setSelectedRoom(null); }}
                  className="w-full h-10 px-3 pr-8 rounded-lg border border-[#E2E8F0] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] appearance-none"
                >
                  {wards.map((w) => <option key={w}>{w}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Select Room</label>
              <div className="grid grid-cols-4 gap-1.5">
                {rooms.map((r) => (
                  <button
                    key={r.number}
                    disabled={r.status !== "available"}
                    onClick={() => setSelectedRoom(r.number)}
                    className={`p-2 rounded-lg border text-xs font-medium transition-all flex flex-col items-center gap-0.5
                      ${selectedRoom === r.number ? "border-[#1E3A5F] bg-[#1E3A5F] text-white" :
                        r.status === "available" ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400" :
                        r.status === "occupied" ? "border-red-200 bg-red-50 text-red-500 cursor-not-allowed opacity-60" :
                        "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60"}`}
                  >
                    <span className="font-bold">{r.number}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${r.status === "available" ? "bg-emerald-500" : r.status === "occupied" ? "bg-red-500" : "bg-gray-400"}`} />
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-2 text-xs text-[#64748B]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />Available</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />Occupied</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400" />Maintenance</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Bed</label>
              <div className="flex gap-2">
                {["A", "B"].map((b) => (
                  <button key={b} onClick={() => setSelectedBed(b)} className={`flex-1 h-9 rounded-lg border text-sm font-medium transition-all ${selectedBed === b ? "border-[#0EA5E9] bg-[#EFF6FF] text-[#0EA5E9]" : "border-[#E2E8F0] text-[#64748B]"}`}>Bed {b}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Notes</label>
              <textarea rows={3} className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] resize-none" placeholder="Additional notes..." />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[#E2E8F0] flex justify-end gap-3">
          <button onClick={onClose} className="px-5 h-10 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC]">Cancel</button>
          <button onClick={onClose} className="px-5 h-10 rounded-lg bg-[#1E3A5F] text-white text-sm font-semibold hover:opacity-90">Confirm Admission</button>
        </div>
      </div>
    </div>
  );
}

function DischargeModal({ patient, onClose }: { patient: typeof admissions[0]; onClose: () => void }) {
  const [followUp, setFollowUp] = useState(false);
  const [condition, setCondition] = useState("Stable");
  const [meds, setMeds] = useState(["Metformin 500mg", "Bisoprolol 5mg"]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E8F0]">
          <h3 className="font-bold text-[#0F172A] text-lg">Process Discharge</h3>
          <button onClick={onClose}><X size={18} className="text-[#64748B]" /></button>
        </div>
        <div className="p-6 space-y-4">
          {/* Patient banner */}
          <div className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0EA5E9] flex items-center justify-center text-white text-sm font-bold shrink-0">{patient.initials}</div>
              <div>
                <p className="font-semibold text-[#0F172A]">{patient.patient}</p>
                <p className="text-xs text-[#64748B]">{patient.room} · Admitted {patient.admitDate} · {patient.doctor}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Actual Discharge Date</label>
              <input type="date" defaultValue="2025-06-17" className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Discharge Status</label>
              <div className="relative">
                <select className="w-full h-10 px-3 pr-8 rounded-lg border border-[#E2E8F0] text-sm bg-white focus:outline-none appearance-none">
                  <option>Recovered</option>
                  <option>Against Medical Advice</option>
                  <option>Transferred</option>
                  <option>Deceased</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Discharge Diagnosis</label>
            <textarea rows={2} defaultValue={patient.diagnosis} className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] resize-none" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Condition on Discharge</label>
            <div className="flex gap-2 flex-wrap">
              {["Stable", "Improved", "Unchanged", "Critical"].map((c) => (
                <button key={c} onClick={() => setCondition(c)} className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${condition === c ? "border-[#0EA5E9] bg-[#EFF6FF] text-[#0EA5E9]" : "border-[#E2E8F0] text-[#64748B]"}`}>{c}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Medications on Discharge</label>
            <div className="space-y-2">
              {meds.map((m, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input defaultValue={m} className="flex-1 h-9 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
                  <button onClick={() => setMeds(meds.filter((_, j) => j !== i))} className="text-[#64748B] hover:text-red-500"><X size={14} /></button>
                </div>
              ))}
              <button onClick={() => setMeds([...meds, ""])} className="text-xs text-[#0EA5E9] font-medium flex items-center gap-1 hover:underline"><Plus size={12} />Add medication</button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Follow-up Instructions</label>
            <textarea rows={2} className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] resize-none" placeholder="Instructions for patient after discharge..." />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Follow-up Appointment</label>
              <button onClick={() => setFollowUp(!followUp)} className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${followUp ? "bg-[#0EA5E9]" : "bg-[#CBD5E1]"}`}>
                <span className={`inline-block w-3.5 h-3.5 rounded-full bg-white shadow transform transition-transform mt-0.75 ${followUp ? "translate-x-4.5" : "translate-x-0.75"}`} style={{ margin: "3px", transform: followUp ? "translateX(16px)" : "translateX(0)" }} />
              </button>
            </div>
            {followUp && (
              <div className="grid grid-cols-2 gap-3 mt-2">
                <input type="date" defaultValue="2025-06-30" className="h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
                <div className="relative">
                  <select className="w-full h-10 px-3 pr-8 rounded-lg border border-[#E2E8F0] text-sm bg-white focus:outline-none appearance-none">
                    <option>Dr. Sarah Mitchell</option>
                    <option>Dr. James Holloway</option>
                    <option>Dr. Emily Ross</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[#E2E8F0] flex justify-end gap-3">
          <button onClick={onClose} className="px-5 h-10 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC]">Cancel</button>
          <button onClick={onClose} className="px-5 h-10 rounded-lg bg-[#10B981] text-white text-sm font-semibold hover:opacity-90">✓ Complete Discharge</button>
        </div>
      </div>
    </div>
  );
}

export function AdmissionsManagement() {
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [dischargePatient, setDischargePatient] = useState<typeof admissions[0] | null>(null);
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title="Admissions Management" subtitle="Inpatient admissions and discharge processing · /receptionist/admissions" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-7">
        <StatCard title="Currently Admitted" value="14" subtitle="Active inpatients" icon={<Bed size={20} className="text-[#1E3A5F]" />} iconBg="bg-blue-50" />
        <StatCard title="Expected Discharges Today" value="3" subtitle="Scheduled for today" icon={<AlertCircle size={20} className="text-[#F59E0B]" />} iconBg="bg-amber-50" />
        <StatCard title="Available Rooms" value="8" subtitle="Ready for admission" icon={<Bed size={20} className="text-[#10B981]" />} iconBg="bg-emerald-50" />
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h3 className="font-semibold text-[#0F172A]">Current Admissions</h3>
          <button onClick={() => setShowAdmitModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium hover:opacity-90">
            <Plus size={14} />Admit New Patient
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {["Patient", "Room", "Ward", "Admitting Doctor", "Admission Date", "Expected Discharge", "Diagnosis", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {admissions.map((a, i) => (
                <tr key={i} className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] ${a.status === "discharging" ? "bg-amber-50/30" : ""}`}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-xs font-bold shrink-0">{a.initials}</div>
                      <span className="font-medium text-[#0F172A] whitespace-nowrap">{a.patient}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[#64748B] whitespace-nowrap">{a.room}</td>
                  <td className="px-4 py-3.5 text-[#64748B] whitespace-nowrap">{a.ward}</td>
                  <td className="px-4 py-3.5 text-[#64748B] whitespace-nowrap">{a.doctor}</td>
                  <td className="px-4 py-3.5 text-[#64748B] whitespace-nowrap">{a.admitDate}</td>
                  <td className="px-4 py-3.5 text-[#64748B] whitespace-nowrap">{a.dischargeDate}</td>
                  <td className="px-4 py-3.5 text-[#64748B] max-w-[180px] truncate">{a.diagnosis}</td>
                  <td className="px-4 py-3.5">
                    <Badge variant={statusBadge(a.status)} dot>{a.status === "admitted" ? "Admitted" : a.status === "discharging" ? "Discharging" : "Discharged"}</Badge>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#0F172A] hover:bg-[#F8FAFC] whitespace-nowrap">View Details</button>
                      <button
                        disabled={a.status !== "discharging"}
                        onClick={() => a.status === "discharging" && setDischargePatient(a)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${a.status === "discharging" ? "bg-[#F59E0B] text-white hover:opacity-90" : "bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed"}`}
                      >
                        Process Discharge
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdmitModal && <AdmitPatientModal onClose={() => setShowAdmitModal(false)} />}
      {dischargePatient && <DischargeModal patient={dischargePatient} onClose={() => setDischargePatient(null)} />}
    </div>
  );
}
