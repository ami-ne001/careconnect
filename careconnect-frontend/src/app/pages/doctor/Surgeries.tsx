import { useState } from "react";
import { X, Plus, ChevronDown, Search, Check } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { StatCard } from "../../components/ui/StatCard";
import { useNavigate } from "react-router";

const STEPS = ["Scheduled", "Pre-Op Prep", "In Progress", "Post-Op Recovery", "Completed"];

const upcomingSurgeries = [
  {
    id: "surg-001",
    type: "Coronary Artery Bypass Graft (CABG)",
    patient: "John Whitaker",
    initials: "JW",
    date: "June 17, 2025",
    time: "08:00 AM",
    duration: "4 hours",
    or: "OR-2",
    nurse: "Nurse Rachel Kim",
    status: "Pre-Op Prep",
    statusVariant: "pending" as const,
  },
  {
    id: "surg-002",
    type: "Total Knee Replacement",
    patient: "Thomas Green",
    initials: "TG",
    date: "June 18, 2025",
    time: "07:30 AM",
    duration: "3 hours",
    or: "OR-1",
    nurse: "Nurse Carlos Vega",
    status: "Scheduled",
    statusVariant: "info" as const,
  },
  {
    id: "surg-003",
    type: "Laparoscopic Cholecystectomy",
    patient: "Layla Hassan",
    initials: "LH",
    date: "June 19, 2025",
    time: "10:00 AM",
    duration: "1.5 hours",
    or: "OR-3",
    nurse: "Nurse Nina Okafor",
    status: "Scheduled",
    statusVariant: "info" as const,
  },
];

const completedSurgeries = [
  { type: "Appendectomy", patient: "Carlos Rivera", date: "June 10, 2025", duration: "1h 05min", or: "OR-3", outcome: "Successful" },
  { type: "Hip Replacement", patient: "Omar Benali", date: "June 8, 2025", duration: "3h 20min", or: "OR-1", outcome: "Successful" },
  { type: "Hernia Repair", patient: "Remi Okafor", date: "June 5, 2025", duration: "1h 40min", or: "OR-2", outcome: "Successful" },
  { type: "C-Section", patient: "Amara Diallo", date: "June 3, 2025", duration: "50min", or: "OR-4", outcome: "Successful" },
  { type: "CABG", patient: "Felix Bergmann", date: "May 28, 2025", duration: "5h 10min", or: "OR-2", outcome: "Complicated" },
];

const orRooms = [
  { name: "OR-1", status: "Available", next: "June 18, 07:30 AM" },
  { name: "OR-2", status: "Occupied", next: "" },
  { name: "OR-3", status: "Available", next: "June 19, 10:00 AM" },
  { name: "OR-4", status: "Cleaning", next: "Est. ready June 16, 13:30" },
];

const commonSurgeries = ["Appendectomy", "CABG", "Knee Replacement", "Hip Replacement", "Cholecystectomy", "Hernia Repair", "C-Section"];

function StatusStepper({ currentStep }: { currentStep: string }) {
  const currentIdx = STEPS.indexOf(currentStep);
  return (
    <div className="flex items-center gap-0 w-full mt-3">
      {STEPS.map((step, i) => {
        const isDone = i < currentIdx;
        const isActive = i === currentIdx;
        return (
          <div key={step} className="flex items-center flex-1 min-w-0">
            <div className={`flex flex-col items-center flex-1 min-w-0`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors
                ${isDone ? "bg-[#10B981] text-white" : isActive ? "bg-[#0EA5E9] text-white ring-4 ring-[#0EA5E9]/20" : "bg-[#E2E8F0] text-[#94A3B8]"}`}>
                {isDone ? <Check size={12} /> : i + 1}
              </div>
              <span className={`text-[9px] mt-1 text-center truncate w-full px-0.5 ${isActive ? "text-[#0EA5E9] font-semibold" : isDone ? "text-[#10B981]" : "text-[#94A3B8]"}`}>{step}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 shrink-0 ${i < currentIdx ? "bg-[#10B981]" : "bg-[#E2E8F0]"}`} style={{ minWidth: 8 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ScheduleSurgeryModal({ onClose }: { onClose: () => void }) {
  const [selectedOR, setSelectedOR] = useState<string | null>(null);
  const [priority, setPriority] = useState("Elective");
  const [selectedType, setSelectedType] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E8F0]">
          <h3 className="font-bold text-[#0F172A] text-lg">Schedule New Surgery</h3>
          <button onClick={onClose}><X size={18} className="text-[#64748B]" /></button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Patient Search</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input className="w-full h-10 pl-9 pr-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" placeholder="Search by name or ID..." />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Surgery Type</label>
              <input value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" placeholder="e.g. Appendectomy" />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {commonSurgeries.map((s) => (
                  <button key={s} onClick={() => setSelectedType(s)} className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${selectedType === s ? "bg-[#1E3A5F] text-white border-[#1E3A5F]" : "border-[#E2E8F0] text-[#64748B] hover:border-[#0EA5E9]"}`}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Lead Surgeon</label>
              <input defaultValue="Dr. Sarah Mitchell" className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Assisting Surgeon</label>
                <div className="relative">
                  <select className="w-full h-10 px-3 pr-8 rounded-lg border border-[#E2E8F0] text-sm bg-white focus:outline-none appearance-none">
                    <option value="">Optional</option>
                    <option>Dr. Emily Ross</option>
                    <option>Dr. Mark Chen</option>
                    <option>Dr. Lisa Park</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Assisting Nurse</label>
                <div className="relative">
                  <select className="w-full h-10 px-3 pr-8 rounded-lg border border-[#E2E8F0] text-sm bg-white focus:outline-none appearance-none">
                    <option>Nurse Rachel Kim</option>
                    <option>Nurse Carlos Vega</option>
                    <option>Nurse Nina Okafor</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Pre-Op Notes</label>
              <textarea rows={3} className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] resize-none" placeholder="Pre-operative notes and preparation instructions..." />
            </div>
          </div>

          {/* Right */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Date</label>
                <input type="date" defaultValue="2025-06-20" className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Time</label>
                <input type="time" defaultValue="08:00" className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Estimated Duration</label>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 flex-1">
                  <input type="number" defaultValue="2" className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
                  <span className="text-sm text-[#64748B] whitespace-nowrap">hrs</span>
                </div>
                <div className="flex items-center gap-1.5 flex-1">
                  <input type="number" defaultValue="30" className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
                  <span className="text-sm text-[#64748B] whitespace-nowrap">min</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Operating Room</label>
              <div className="grid grid-cols-2 gap-2">
                {orRooms.map((or) => (
                  <button
                    key={or.name}
                    onClick={() => setSelectedOR(or.name)}
                    className={`p-3 rounded-xl border text-left transition-all ${selectedOR === or.name ? "border-[#1E3A5F] bg-[#EFF6FF]" : "border-[#E2E8F0] hover:border-[#0EA5E9]"}`}
                  >
                    <p className="font-semibold text-[#0F172A] text-sm">{or.name}</p>
                    <p className={`text-xs font-medium ${or.status === "Available" ? "text-emerald-600" : or.status === "Occupied" ? "text-red-500" : "text-amber-500"}`}>{or.status}</p>
                    {or.next && <p className="text-[10px] text-[#94A3B8] mt-0.5">{or.next}</p>}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Priority</label>
              <div className="flex gap-2">
                {[
                  { label: "Elective", color: "border-emerald-300 bg-emerald-50 text-emerald-700" },
                  { label: "Urgent", color: "border-amber-300 bg-amber-50 text-amber-700" },
                  { label: "Emergency", color: "border-red-300 bg-red-50 text-red-700" },
                ].map((p) => (
                  <button key={p.label} onClick={() => setPriority(p.label)} className={`flex-1 h-9 rounded-lg border text-sm font-medium transition-all ${priority === p.label ? p.color + " ring-2 ring-offset-1 ring-current" : "border-[#E2E8F0] text-[#64748B]"}`}>{p.label}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Special Equipment</label>
              <input className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" placeholder="Type and press Enter to add tags..." />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[#E2E8F0] flex justify-end gap-3">
          <button onClick={onClose} className="px-5 h-10 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC]">Cancel</button>
          <button onClick={onClose} className="px-5 h-10 rounded-lg bg-[#1E3A5F] text-white text-sm font-semibold hover:opacity-90">Schedule Surgery</button>
        </div>
      </div>
    </div>
  );
}

export function DoctorSurgeries() {
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Surgeries"
        subtitle="Manage surgical procedures and operating schedules · /doctor/surgeries"
        actions={
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium hover:opacity-90">
            <Plus size={14} />Schedule Surgery
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-7">
        <StatCard title="Upcoming Surgeries" value="3" subtitle="Scheduled" icon={<span className="text-[#0EA5E9]">🔪</span>} iconBg="bg-sky-50" />
        <StatCard title="Completed This Month" value="8" subtitle="June 2025" icon={<span className="text-[#10B981]">✅</span>} iconBg="bg-emerald-50" />
        <StatCard title="Next Surgery" value="Tomorrow" subtitle="08:00 AM — CABG" icon={<span className="text-[#F59E0B]">📅</span>} iconBg="bg-amber-50" />
        <StatCard title="Average Duration" value="2h 45min" subtitle="This month" icon={<span className="text-[#8B5CF6]">⏱</span>} iconBg="bg-purple-50" />
      </div>

      <div className="flex gap-1 bg-white rounded-xl p-1.5 border border-[#E2E8F0] mb-6 w-fit" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        {["Upcoming", "Completed", "All"].map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t ? "bg-[#1E3A5F] text-white" : "text-[#64748B] hover:text-[#0F172A]"}`}>{t}</button>
        ))}
      </div>

      {activeTab === "Upcoming" && (
        <div className="space-y-4">
          {upcomingSurgeries.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-[#E2E8F0] p-5" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-sm font-bold shrink-0">{s.initials}</div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-[#0F172A] truncate">{s.type}</h4>
                    <p className="text-sm text-[#64748B]">{s.patient}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-[#64748B] shrink-0">
                  <div><span className="text-xs text-[#94A3B8] block">Date & Time</span><span className="font-medium text-[#0F172A]">{s.date} — {s.time}</span></div>
                  <div><span className="text-xs text-[#94A3B8] block">Duration</span><span className="font-medium text-[#0F172A]">{s.duration}</span></div>
                  <div><span className="text-xs text-[#94A3B8] block">OR</span><span className="font-medium text-[#0F172A]">{s.or}</span></div>
                  <div><span className="text-xs text-[#94A3B8] block">Nurse</span><span className="font-medium text-[#0F172A]">{s.nurse}</span></div>
                </div>
                <Badge variant={s.statusVariant}>{s.status}</Badge>
              </div>
              <StatusStepper currentStep={s.status} />
              <div className="flex gap-2 mt-4">
                <button onClick={() => navigate(`/doctor/surgeries/${s.id}`)} className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#0F172A] hover:bg-[#F8FAFC]">View Details</button>
                <button className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#0F172A] hover:bg-[#F8FAFC]">Add Pre-Op Notes</button>
                <button className="px-3 py-1.5 rounded-lg bg-[#0EA5E9] text-white text-xs font-medium hover:opacity-90">Update Status</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Completed" && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  {["Surgery Type", "Patient", "Date", "Duration (Actual)", "OR", "Outcome", "Notes"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {completedSurgeries.map((c, i) => (
                  <tr key={i} className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] ${i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                    <td className="px-5 py-3.5 font-medium text-[#0F172A]">{c.type}</td>
                    <td className="px-5 py-3.5 text-[#64748B]">{c.patient}</td>
                    <td className="px-5 py-3.5 text-[#64748B] whitespace-nowrap">{c.date}</td>
                    <td className="px-5 py-3.5 text-[#64748B]">{c.duration}</td>
                    <td className="px-5 py-3.5 text-[#64748B]">{c.or}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={c.outcome === "Successful" ? "active" : "warning"}>{c.outcome}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <button className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#0EA5E9] hover:bg-[#F8FAFC]">View Notes</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "All" && (
        <div className="space-y-4">
          {upcomingSurgeries.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-[#E2E8F0] p-5" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-sm font-bold shrink-0">{s.initials}</div>
                  <div>
                    <h4 className="font-bold text-[#0F172A]">{s.type}</h4>
                    <p className="text-sm text-[#64748B]">{s.patient}</p>
                  </div>
                </div>
                <Badge variant={s.statusVariant}>{s.status}</Badge>
              </div>
              <StatusStepper currentStep={s.status} />
            </div>
          ))}
          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    {["Surgery Type", "Patient", "Date", "OR", "Outcome"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {completedSurgeries.map((c, i) => (
                    <tr key={i} className={`border-b border-[#F1F5F9] ${i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                      <td className="px-5 py-3.5 font-medium text-[#0F172A]">{c.type}</td>
                      <td className="px-5 py-3.5 text-[#64748B]">{c.patient}</td>
                      <td className="px-5 py-3.5 text-[#64748B]">{c.date}</td>
                      <td className="px-5 py-3.5 text-[#64748B]">{c.or}</td>
                      <td className="px-5 py-3.5"><Badge variant={c.outcome === "Successful" ? "active" : "warning"}>{c.outcome}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showModal && <ScheduleSurgeryModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
