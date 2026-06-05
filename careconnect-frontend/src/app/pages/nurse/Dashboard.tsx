import { useEffect, useState, useMemo } from "react";
import { Users, HeartPulse, Pill, ClipboardList, AlertTriangle, Check, X } from "lucide-react";
import { StatCard } from "../../components/ui/StatCard";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { useAuth } from "../../../store/useAuth";
import { clinicalApi, CareTaskResponse, VitalsResponse, PrescriptionResponse } from "../../../api/clinical.api";
import { patientApi } from "../../../api/patient.api";
import { AdmissionResponse } from "../../../api/receptionist.api";
import type { PatientProfileResponse } from "../../../types/patient.types";

const statusColors: Record<string, string> = {
  stable: "bg-emerald-500", watch: "bg-amber-500", critical: "bg-red-500",
};
const statusText: Record<string, string> = {
  stable: "text-emerald-700", watch: "text-amber-700", critical: "text-red-700",
};

export function NurseDashboard() {
  const { userId } = useAuth();
  const [tasks, setTasks] = useState<CareTaskResponse[]>([]);
  const [admissions, setAdmissions] = useState<AdmissionResponse[]>([]);
  const [patients, setPatients] = useState<Record<number, PatientProfileResponse>>({});
  const [vitals, setVitals] = useState<Record<number, VitalsResponse>>({});
  const [prescriptions, setPrescriptions] = useState<PrescriptionResponse[]>([]);

  useEffect(() => {
    if (userId) {
      clinicalApi.getCareTasksAssignedTo(userId).then(res => {
        setTasks(res.data);
        const patientIds = Array.from(new Set(res.data.map(t => t.patientId)));
        
        // Fetch Admissions for these patients
        Promise.all(patientIds.map(id => patientApi.getAdmissionsByPatientId(id)))
          .then(responses => {
            const activeAdmissions = responses.flatMap(r => r.data).filter(a => a.status === "ADMITTED");
            setAdmissions(activeAdmissions);
            
            // For active admissions, fetch vitals, prescriptions, and profiles
            activeAdmissions.forEach(adm => {
              patientApi.getProfileById(adm.patientId)
                .then(pRes => setPatients(prev => ({...prev, [adm.patientId]: pRes.data})))
                .catch(console.error);
              
              clinicalApi.getLatestVitalsByPatient(adm.patientId)
                .then(vRes => setVitals(prev => ({...prev, [adm.patientId]: vRes.data})))
                .catch(() => { /* ignore 404 */ });
              
              clinicalApi.getPrescriptionsByPatient(adm.patientId)
                .then(prRes => {
                  setPrescriptions(prev => {
                    // avoid duplicates by filtering out existing ids
                    const newIds = prRes.data.map(p => p.id);
                    return [...prev.filter(p => !newIds.includes(p.id)), ...prRes.data];
                  });
                })
                .catch(console.error);
            });
          }).catch(console.error);
      }).catch(console.error);
    }
  }, [userId]);

  const getPatientName = (patientId: number) => {
    const p = patients[patientId];
    return p ? `${p?.firstName || ""} ${p?.lastName || ""}`.trim() || `Patient #${patientId}` : `Patient #${patientId}`;
  };

  const getVitalStatus = (vital: VitalsResponse | undefined, type: "bp" | "hr" | "temp" | "o2") => {
    if (!vital) return "stable";
    switch (type) {
      case "bp":
        const s = vital.bpSystolic || 120;
        return s > 140 ? "watch" : s > 160 ? "critical" : "stable";
      case "hr":
        const h = vital.heartRate || 80;
        return h > 100 ? "watch" : h > 120 ? "critical" : "stable";
      case "temp":
        const t = vital.temperature || 37;
        return t > 38 ? "watch" : t > 39 ? "critical" : "stable";
      case "o2":
        const o = vital.oxygenSat || 98;
        return o < 95 ? "watch" : o < 90 ? "critical" : "stable";
      default: return "stable";
    }
  };

  const getOverallStatus = (vital: VitalsResponse | undefined) => {
    if (!vital) return "stable";
    const statuses = [getVitalStatus(vital, "bp"), getVitalStatus(vital, "hr"), getVitalStatus(vital, "temp"), getVitalStatus(vital, "o2")];
    if (statuses.includes("critical")) return "critical";
    if (statuses.includes("watch")) return "watch";
    return "stable";
  };

  const upcomingMedications = useMemo(() => {
    const meds: any[] = [];
    prescriptions.filter(p => p.status === "ACTIVE").forEach(p => {
      p.items.forEach(item => {
        meds.push({
          time: "10:00 AM", // simplistic
          patient: getPatientName(p.patientId),
          room: admissions.find(a => a.patientId === p.patientId)?.room.roomNumber || "N/A",
          med: `${item.medication} ${item.dosage}`,
          route: "Oral",
          status: "pending"
        });
      });
    });
    return meds.slice(0, 5); // limit to 5
  }, [prescriptions, patients, admissions]);

  const pendingTasks = tasks.filter(t => t.status !== "COMPLETED");
  const surgeryPrepTasks = tasks.filter(t => t.surgeryId);

  const toggleTaskStatus = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "COMPLETED" ? "TODO" : "COMPLETED";
    clinicalApi.updateCareTaskStatus(id, newStatus).then(() => {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    });
  };

  return (
    <div>
      <PageHeader title="Nurse Dashboard" subtitle="Patient monitoring and care tasks overview" />

      {/* Discharge Alert */}
      {admissions.some(a => a.expectedDischargeDate && new Date(a.expectedDischargeDate).toDateString() === new Date().toDateString()) && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Patients are scheduled for discharge today</p>
            <p className="text-xs text-amber-700 mt-0.5">
              {admissions.filter(a => a.expectedDischargeDate && new Date(a.expectedDischargeDate).toDateString() === new Date().toDateString())
                .map(a => `${getPatientName(a.patientId)} (Room ${a.room.roomNumber})`).join(" · ")}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-7">
        <StatCard title="Patients Assigned" value={admissions.length.toString()} subtitle="Your ward" icon={<Users size={20} className="text-[#1E3A5F]" />} iconBg="bg-blue-50" />
        <StatCard title="Vitals Due Today" value={admissions.filter(a => !vitals[a.patientId]).length.toString()} subtitle="Pending rounds" icon={<HeartPulse size={20} className="text-[#EF4444]" />} iconBg="bg-red-50" />
        <StatCard title="Medications to Administer" value={upcomingMedications.length.toString()} subtitle="This shift" icon={<Pill size={20} className="text-[#0EA5E9]" />} iconBg="bg-sky-50" />
        <StatCard title="Tasks Pending" value={pendingTasks.length.toString()} subtitle="Requires attention" icon={<ClipboardList size={20} className="text-[#F59E0B]" />} iconBg="bg-amber-50" />
      </div>

      {/* Patient monitoring grid */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 mb-6" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <h3 className="font-semibold text-[#0F172A] mb-4">Patient Monitoring Grid</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {admissions.length === 0 && <p className="text-sm text-[#64748B]">No patients assigned.</p>}
          {admissions.map((adm) => {
            const v = vitals[adm.patientId];
            const overall = getOverallStatus(v);
            return (
              <div key={adm.id} className={`rounded-xl p-4 border-2 ${overall === "critical" ? "border-red-200 bg-red-50" : overall === "watch" ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-[#0F172A] text-sm">{getPatientName(adm.patientId)}</p>
                    <p className="text-xs text-[#64748B]">Room {adm.room.roomNumber}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1E3A5F] text-white">Inpatient</span>
                    <div className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${statusColors[overall]}`} />
                      <span className={`text-xs font-semibold capitalize ${statusText[overall]}`}>{overall}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: "BP", val: v ? `${v.bpSystolic}/${v.bpDiastolic}` : "--", unit: "mmHg", status: getVitalStatus(v, "bp") },
                    { label: "HR", val: v?.heartRate || "--", unit: "bpm", status: getVitalStatus(v, "hr") },
                    { label: "Temp", val: v?.temperature || "--", unit: "°C", status: getVitalStatus(v, "temp") },
                    { label: "O₂", val: v?.oxygenSat || "--", unit: "%", status: getVitalStatus(v, "o2") },
                  ].map((metric) => (
                    <div key={metric.label} className={`p-1.5 rounded-lg ${metric.status === "critical" ? "bg-red-100" : metric.status === "watch" ? "bg-amber-100" : "bg-white"}`}>
                      <p className="text-[10px] text-[#64748B] mb-0.5">{metric.label}</p>
                      <p className="text-xs font-bold text-[#0F172A]">{metric.val}</p>
                      <p className="text-[9px] text-[#94A3B8]">{metric.unit}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Medication schedule */}
        <div className="bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="px-5 py-4 border-b border-[#E2E8F0]">
            <h3 className="font-semibold text-[#0F172A]">Upcoming Medications</h3>
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {upcomingMedications.map((m, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <span className="text-sm font-bold text-[#0F172A] w-12 shrink-0">{m.time}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#0F172A]">{m.patient}</p>
                  <p className="text-xs text-[#64748B]">{m.med} · {m.route} · {m.room}</p>
                </div>
                {m.status === "administered" ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">✓ Done</span>
                ) : (
                  <button className="px-3 py-1.5 rounded-lg bg-[#0EA5E9] text-white text-xs font-medium">Administer</button>
                )}
              </div>
            ))}
            {upcomingMedications.length === 0 && <p className="px-5 py-4 text-sm text-[#64748B]">No upcoming medications.</p>}
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="px-5 py-4 border-b border-[#E2E8F0]">
            <h3 className="font-semibold text-[#0F172A]">Care Tasks</h3>
          </div>
          <div className="divide-y divide-[#F1F5F9] max-h-96 overflow-y-auto">
            {tasks.map((t) => {
              const done = t.status === "COMPLETED";
              return (
                <div key={t.id} className={`flex items-center gap-3 px-5 py-3.5 ${done ? "opacity-60" : ""}`}>
                  <input type="checkbox" checked={done} onChange={() => toggleTaskStatus(t.id, t.status)} className="w-4 h-4 accent-[#10B981]" />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${done ? "line-through text-[#94A3B8]" : "text-[#0F172A]"}`}>{t.title}</p>
                    <p className="text-xs text-[#64748B]">{getPatientName(t.patientId)}</p>
                  </div>
                  <Badge variant={t.priority === "URGENT" || t.priority === "HIGH" ? "error" : "info" as any}>{t.priority}</Badge>
                </div>
              );
            })}
            {tasks.length === 0 && <p className="px-5 py-4 text-sm text-[#64748B]">No care tasks assigned.</p>}
          </div>
        </div>
      </div>

      {/* Surgery Prep Tasks */}
      {surgeryPrepTasks.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center gap-2">
            <span className="text-lg">🔪</span>
            <h3 className="font-semibold text-[#0F172A]">Surgery Prep Tasks</h3>
          </div>
          <div className="p-5 grid grid-cols-1 xl:grid-cols-2 gap-4">
            {surgeryPrepTasks.map((s) => (
              <div key={s.id} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-[#0F172A] text-sm">{getPatientName(s.patientId)}</p>
                    <p className="text-xs text-[#64748B]">{s.title}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${s.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {s.status === "COMPLETED" ? "Ready" : "Pending"}
                  </span>
                </div>
                <div className="text-sm text-[#0F172A] mb-3">
                  {s.description}
                </div>
                {s.status !== "COMPLETED" && (
                  <button onClick={() => toggleTaskStatus(s.id, s.status)} className="w-full h-8 rounded-lg bg-[#0EA5E9] text-white text-xs font-medium hover:opacity-90">Complete Tasks</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}