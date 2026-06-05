import { useEffect, useState, useMemo } from "react";
import { X, Plus, ChevronDown, Search, Check } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { StatCard } from "../../components/ui/StatCard";
import { useNavigate } from "react-router";
import { useAuth } from "../../../store/useAuth";
import { clinicalApi, SurgeryResponse, OperatingRoomOverviewResponse } from "../../../api/clinical.api";
import { patientApi } from "../../../api/patient.api";
import type { PatientProfileResponse } from "../../../types/patient.types";

const STEPS = ["SCHEDULED", "PRE_OP", "IN_PROGRESS", "POST_OP", "COMPLETED"];

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
              <span className={`text-[9px] mt-1 text-center truncate w-full px-0.5 ${isActive ? "text-[#0EA5E9] font-semibold" : isDone ? "text-[#10B981]" : "text-[#94A3B8]"}`}>{step.replace("_", " ")}</span>
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
  const [priority, setPriority] = useState("ELECTIVE");
  const [selectedType, setSelectedType] = useState("");
  const [orOverview, setOrOverview] = useState<OperatingRoomOverviewResponse | null>(null);

  useEffect(() => {
    clinicalApi.getOperatingRoomsOverview().then(res => setOrOverview(res.data)).catch(console.error);
  }, []);

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
              <input defaultValue="Current User" className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Assisting Surgeon</label>
                <div className="relative">
                  <select className="w-full h-10 px-3 pr-8 rounded-lg border border-[#E2E8F0] text-sm bg-white focus:outline-none appearance-none">
                    <option value="">Optional</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Assisting Nurse</label>
                <div className="relative">
                  <select className="w-full h-10 px-3 pr-8 rounded-lg border border-[#E2E8F0] text-sm bg-white focus:outline-none appearance-none">
                    <option value="">Optional</option>
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
                <input type="date" className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Time</label>
                <input type="time" className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Estimated Duration</label>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 flex-1">
                  <input type="number" defaultValue="2" className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
                  <span className="text-sm text-[#64748B] whitespace-nowrap">hrs</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Operating Room</label>
              <div className="grid grid-cols-2 gap-2">
                {orOverview?.rooms.map((or) => (
                  <button
                    key={or.id}
                    onClick={() => setSelectedOR(or.name)}
                    className={`p-3 rounded-xl border text-left transition-all ${selectedOR === or.name ? "border-[#1E3A5F] bg-[#EFF6FF]" : "border-[#E2E8F0] hover:border-[#0EA5E9]"}`}
                  >
                    <p className="font-semibold text-[#0F172A] text-sm">{or.name}</p>
                    <p className={`text-xs font-medium ${or.status === "AVAILABLE" ? "text-emerald-600" : or.status === "IN_USE" ? "text-red-500" : "text-amber-500"}`}>{or.status}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Priority</label>
              <div className="flex gap-2">
                {[
                  { label: "ELECTIVE", color: "border-emerald-300 bg-emerald-50 text-emerald-700" },
                  { label: "URGENT", color: "border-amber-300 bg-amber-50 text-amber-700" },
                  { label: "EMERGENCY", color: "border-red-300 bg-red-50 text-red-700" },
                ].map((p) => (
                  <button key={p.label} onClick={() => setPriority(p.label)} className={`flex-1 h-9 rounded-lg border text-sm font-medium transition-all ${priority === p.label ? p.color + " ring-2 ring-offset-1 ring-current" : "border-[#E2E8F0] text-[#64748B]"}`}>{p.label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[#E2E8F0] flex justify-end gap-3">
          <button onClick={onClose} className="px-5 h-10 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC]">Cancel</button>
          <button onClick={onClose} className="px-5 h-10 rounded-lg bg-[#1E3A5F] text-white text-sm font-semibold hover:opacity-90">Schedule</button>
        </div>
      </div>
    </div>
  );
}

export function DoctorSurgeries() {
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { userId } = useAuth();

  const [surgeries, setSurgeries] = useState<SurgeryResponse[]>([]);
  const [patients, setPatients] = useState<Record<number, PatientProfileResponse>>({});

  useEffect(() => {
    if (userId) {
      clinicalApi.getSurgeriesBySurgeon(userId).then(res => {
        setSurgeries(res.data);
        // Fetch patient info for each surgery
        const uniquePatientIds = Array.from(new Set(res.data.map(s => s.patientId)));
        uniquePatientIds.forEach(id => {
          patientApi.getProfileById(id).then(pRes => {
            setPatients(prev => ({ ...prev, [id]: pRes.data }));
          }).catch(console.error);
        });
      }).catch(console.error);
    }
  }, [userId]);

  const upcomingSurgeries = useMemo(() => surgeries.filter(s => s.status !== "COMPLETED" && s.status !== "CANCELLED"), [surgeries]);
  const completedSurgeries = useMemo(() => surgeries.filter(s => s.status === "COMPLETED"), [surgeries]);

  const getStatusVariant = (status: string) => {
    if (status === "COMPLETED") return "active";
    if (status === "SCHEDULED") return "info";
    if (status === "CANCELLED") return "error";
    return "pending";
  };

  const getPatientName = (patientId: number) => {
    const p = patients[patientId];
    return p ? `${p?.firstName || ""} ${p?.lastName || ""}`.trim() || `Patient #${patientId}` : `Patient #${patientId}`;
  };

  const getPatientInitials = (patientId: number) => {
    const p = patients[patientId];
    return p && p.firstName && p.lastName ? `${p.firstName[0]}${p.lastName[0]}` : `P`;
  };

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
        <StatCard title="Upcoming Surgeries" value={upcomingSurgeries.length.toString()} subtitle="Assigned to you" icon={<span className="text-[#0EA5E9]">🔪</span>} iconBg="bg-sky-50" />
        <StatCard title="Completed Surgeries" value={completedSurgeries.length.toString()} subtitle="Total" icon={<span className="text-[#10B981]">✅</span>} iconBg="bg-emerald-50" />
        <StatCard title="Next Surgery" value={upcomingSurgeries.length > 0 ? new Date(upcomingSurgeries[0].scheduledAt).toLocaleDateString() : "None"} subtitle={upcomingSurgeries.length > 0 ? upcomingSurgeries[0].surgeryType : ""} icon={<span className="text-[#F59E0B]">📅</span>} iconBg="bg-amber-50" />
        <StatCard title="Total Surgeries" value={surgeries.length.toString()} subtitle="All time" icon={<span className="text-[#8B5CF6]">⏱</span>} iconBg="bg-purple-50" />
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
                  <div className="w-10 h-10 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-sm font-bold shrink-0">{getPatientInitials(s.patientId)}</div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-[#0F172A] truncate">{s.surgeryType}</h4>
                    <p className="text-sm text-[#64748B]">{getPatientName(s.patientId)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-[#64748B] shrink-0">
                  <div><span className="text-xs text-[#94A3B8] block">Scheduled</span><span className="font-medium text-[#0F172A]">{new Date(s.scheduledAt).toLocaleString()}</span></div>
                  <div><span className="text-xs text-[#94A3B8] block">Est. Duration</span><span className="font-medium text-[#0F172A]">{s.estimatedDuration} min</span></div>
                  <div><span className="text-xs text-[#94A3B8] block">OR</span><span className="font-medium text-[#0F172A]">{s.operatingRoomName}</span></div>
                  <div><span className="text-xs text-[#94A3B8] block">Priority</span><span className="font-medium text-[#0F172A]">{s.priority}</span></div>
                </div>
                <Badge variant={getStatusVariant(s.status) as any}>{s.status}</Badge>
              </div>
              <StatusStepper currentStep={s.status} />
              <div className="flex gap-2 mt-4">
                <button onClick={() => navigate(`/doctor/surgeries/${s.id}`)} className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#0F172A] hover:bg-[#F8FAFC]">View Details</button>
                <button className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#0F172A] hover:bg-[#F8FAFC]">Add Pre-Op Notes</button>
                <button className="px-3 py-1.5 rounded-lg bg-[#0EA5E9] text-white text-xs font-medium hover:opacity-90">Update Status</button>
              </div>
            </div>
          ))}
          {upcomingSurgeries.length === 0 && <p className="text-sm text-[#64748B] py-4">No upcoming surgeries found.</p>}
        </div>
      )}

      {activeTab === "Completed" && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  {["Surgery Type", "Patient", "Date", "OR", "Outcome", "Notes"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {completedSurgeries.map((c, i) => (
                  <tr key={c.id} className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] ${i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                    <td className="px-5 py-3.5 font-medium text-[#0F172A]">{c.surgeryType}</td>
                    <td className="px-5 py-3.5 text-[#64748B]">{getPatientName(c.patientId)}</td>
                    <td className="px-5 py-3.5 text-[#64748B] whitespace-nowrap">{new Date(c.actualEndAt || c.scheduledAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 text-[#64748B]">{c.operatingRoomName}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={c.outcome === "SUCCESSFUL" ? "active" : "warning"}>{c.outcome || "N/A"}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <button className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#0EA5E9] hover:bg-[#F8FAFC]">View Notes</button>
                    </td>
                  </tr>
                ))}
                {completedSurgeries.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-4 text-sm text-[#64748B] text-center">No completed surgeries.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "All" && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  {["Surgery Type", "Patient", "Date", "OR", "Status"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {surgeries.map((c, i) => (
                  <tr key={c.id} className={`border-b border-[#F1F5F9] ${i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                    <td className="px-5 py-3.5 font-medium text-[#0F172A]">{c.surgeryType}</td>
                    <td className="px-5 py-3.5 text-[#64748B]">{getPatientName(c.patientId)}</td>
                    <td className="px-5 py-3.5 text-[#64748B]">{new Date(c.scheduledAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 text-[#64748B]">{c.operatingRoomName}</td>
                    <td className="px-5 py-3.5"><Badge variant={getStatusVariant(c.status) as any}>{c.status}</Badge></td>
                  </tr>
                ))}
                {surgeries.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-4 text-sm text-[#64748B] text-center">No surgeries.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && <ScheduleSurgeryModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
