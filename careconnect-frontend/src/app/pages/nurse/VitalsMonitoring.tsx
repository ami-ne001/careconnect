import { useEffect, useState } from "react";
import { AlertTriangle, Plus, X } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { useAuth } from "../../../store/useAuth";
import { clinicalApi, VitalsResponse } from "../../../api/clinical.api";
import { patientApi } from "../../../api/patient.api";
import { receptionistApi, AdmissionResponse } from "../../../api/receptionist.api";
import type { PatientProfileResponse } from "../../../types/patient.types";

const borderMap: Record<string, string> = { stable: "border-emerald-200", watch: "border-amber-200", critical: "border-red-200" };
const dotMap: Record<string, string> = { stable: "bg-emerald-500", watch: "bg-amber-500", critical: "bg-red-500" };

export function NurseVitals() {
  const { userId } = useAuth();
  const [admissions, setAdmissions] = useState<AdmissionResponse[]>([]);
  const [patients, setPatients] = useState<Record<number, PatientProfileResponse>>({});
  const [vitals, setVitals] = useState<Record<number, VitalsResponse>>({});
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");

  useEffect(() => {
    if (!userId) return;
    // Get active admissions for patients this nurse is caring for
    clinicalApi.getCareTasksAssignedTo(userId).then(r => {
      const patientIds = Array.from(new Set(r.data.map(t => t.patientId)));
      Promise.all(patientIds.map(id => patientApi.getAdmissionsByPatientId(id).then(a => a.data).catch(() => [])))
        .then(results => {
          const active = results.flatMap(r => r).filter(a => a.status === "ADMITTED");
          setAdmissions(active);

          active.forEach(adm => {
            patientApi.getProfileById(adm.patientId)
              .then(p => setPatients(prev => ({ ...prev, [adm.patientId]: p.data })))
              .catch(() => {});
            clinicalApi.getLatestVitalsByPatient(adm.patientId)
              .then(v => setVitals(prev => ({ ...prev, [adm.patientId]: v.data })))
              .catch(() => {});
          });
          setLoading(false);
        });
    }).catch(() => setLoading(false));
  }, [userId]);

  const getPatientName = (id: number) => {
    const p = patients[id];
    return p ? `${p.firstName || ""} ${p.lastName || ""}`.trim() || `Patient #${id}` : `Patient #${id}`;
  };

  const getOverallStatus = (patientId: number) => {
    const v = vitals[patientId];
    if (!v) return "stable";
    if ((v.bpSystolic || 0) > 160 || (v.heartRate || 0) > 120 || (v.oxygenSat || 100) < 90) return "critical";
    if ((v.bpSystolic || 0) > 140 || (v.heartRate || 0) > 100 || (v.oxygenSat || 100) < 95) return "watch";
    return "stable";
  };

  const critical = admissions.filter(a => getOverallStatus(a.patientId) === "critical");

  return (
    <div>
      <PageHeader
        title="Vitals Monitoring"
        subtitle="Real-time patient vitals dashboard"
        actions={
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium hover:opacity-90">
            <Plus size={15} />Record Vitals
          </button>
        }
      />

      {/* Alert bar */}
      {critical.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-5 flex items-center gap-3">
          <AlertTriangle size={18} className="text-[#EF4444] shrink-0" />
          <p className="text-sm text-[#EF4444] font-medium">
            <strong>{critical.length} patient{critical.length > 1 ? "s" : ""}</strong> flagged with abnormal vitals — immediate attention required:{" "}
            {critical.map((p) => `${getPatientName(p.patientId)} (Room ${p.room.roomNumber})`).join(", ")}
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="animate-spin rounded-full h-8 w-8 border-4 border-[#1E3A5F] border-t-transparent" />
          <span className="text-sm text-[#64748B]">Loading vitals…</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {admissions.map((p) => {
            const v = vitals[p.patientId];
            const status = getOverallStatus(p.patientId);
            return (
              <div key={p.id} className={`bg-white rounded-xl border-2 p-4 ${borderMap[status]}`} style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-[#0F172A] text-sm">{getPatientName(p.patientId)}</p>
                    <p className="text-xs text-[#64748B]">Room {p.room.roomNumber} · Last: {v ? new Date(v.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Never"}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full animate-pulse ${dotMap[status]}`} />
                    <span className="text-xs font-semibold capitalize" style={{ color: status === "critical" ? "#EF4444" : status === "watch" ? "#F59E0B" : "#10B981" }}>{status}</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[
                    { l: "BP", v: v ? `${v.bpSystolic}/${v.bpDiastolic}` : "—", u: "" },
                    { l: "HR", v: v?.heartRate || "—", u: "bpm" },
                    { l: "Temp", v: v?.temperature || "—", u: "°C" },
                    { l: "O₂", v: v?.oxygenSat || "—", u: "%" },
                  ].map((val) => (
                    <div key={val.l} className={`p-2 rounded-lg text-center ${status === "critical" ? "bg-red-50" : status === "watch" ? "bg-amber-50" : "bg-[#F8FAFC]"}`}>
                      <p className="text-[9px] text-[#94A3B8] uppercase font-medium">{val.l}</p>
                      <p className="text-xs font-bold text-[#0F172A] leading-tight">{val.v}</p>
                      {val.u && <p className="text-[9px] text-[#94A3B8]">{val.u}</p>}
                    </div>
                  ))}
                </div>
                {/* Sparkline placeholder */}
                <div className="h-8 bg-[#F0F4F8] rounded mb-3 flex items-center justify-center overflow-hidden">
                  <svg viewBox="0 0 120 30" className="w-full h-full" preserveAspectRatio="none">
                    <polyline points="0,20 15,15 30,18 45,12 60,16 75,10 90,14 105,8 120,12" fill="none" stroke={status === "critical" ? "#EF4444" : status === "watch" ? "#F59E0B" : "#10B981"} strokeWidth="2" />
                  </svg>
                </div>
                <button onClick={() => { setSelectedPatientId(p.patientId.toString()); setShowModal(true); }} className="w-full py-1.5 rounded-lg bg-[#1E3A5F] text-white text-xs font-medium hover:opacity-90 transition-all">
                  Record New Vitals
                </button>
              </div>
            );
          })}
          {admissions.length === 0 && <div className="col-span-full py-10 text-center text-[#64748B]">No patients currently assigned to you.</div>}
        </div>
      )}

      {/* Record Vitals Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#0F172A]">Record Vitals</h3>
              <button onClick={() => setShowModal(false)}><X size={18} className="text-[#64748B]" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Patient</label>
                <select value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]">
                  <option value="">Select patient...</option>
                  {admissions.map((p) => <option key={p.id} value={p.patientId}>{getPatientName(p.patientId)} — Room {p.room.roomNumber}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "BP Systolic", placeholder: "e.g. 128" },
                  { label: "BP Diastolic", placeholder: "e.g. 84" },
                  { label: "Heart Rate (bpm)", placeholder: "e.g. 78" },
                  { label: "Temperature (°C)", placeholder: "e.g. 37.1" },
                  { label: "O₂ Saturation (%)", placeholder: "e.g. 97" },
                  { label: "Weight (kg)", placeholder: "e.g. 74" },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="block text-xs font-medium text-[#64748B] mb-1">{f.label}</label>
                    <input placeholder={f.placeholder} className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Notes</label>
                <textarea rows={2} className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-lg border border-[#E2E8F0] text-sm font-medium text-[#64748B]">Cancel</button>
                <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-lg bg-[#1E3A5F] text-white text-sm font-semibold">Save Vitals</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
