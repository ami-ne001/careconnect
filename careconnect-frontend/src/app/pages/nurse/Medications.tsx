import { useEffect, useState } from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { useAuth } from "../../../store/useAuth";
import { clinicalApi, PrescriptionResponse } from "../../../api/clinical.api";
import { patientApi } from "../../../api/patient.api";
import { receptionistApi, AdmissionResponse } from "../../../api/receptionist.api";
import type { PatientProfileResponse } from "../../../types/patient.types";

interface ScheduleItem {
  id: string;
  time: string;
  patientId: number;
  med: string;
  dose: string;
  route: string;
  status: string;
  roomNumber: string;
}

const routeColors: Record<string, string> = {
  Oral: "bg-blue-100 text-blue-700",
  IV: "bg-purple-100 text-purple-700",
  SC: "bg-green-100 text-green-700",
  IM: "bg-orange-100 text-orange-700",
};

export function NurseMedications() {
  const { userId } = useAuth();
  const [filter, setFilter] = useState("All");
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [patients, setPatients] = useState<Record<number, PatientProfileResponse>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    // Get active admissions for patients this nurse is caring for
    clinicalApi.getCareTasksAssignedTo(userId).then(r => {
      const patientIds = Array.from(new Set(r.data.map(t => t.patientId)));
      Promise.all(patientIds.map(id => patientApi.getAdmissionsByPatientId(id).then(a => a.data).catch(() => [])))
        .then(results => {
          const activeAdms = results.flatMap(r => r).filter(a => a.status === "ADMITTED");
          
          // Fetch profiles and prescriptions for these admissions
          activeAdms.forEach(adm => {
            patientApi.getProfileById(adm.patientId)
              .then(p => setPatients(prev => ({ ...prev, [adm.patientId]: p.data })))
              .catch(() => {});
          });

          Promise.all(activeAdms.map(adm => 
            clinicalApi.getPrescriptionsByPatient(adm.patientId)
              .then(p => p.data.map(rx => ({ rx, room: adm.room.roomNumber })))
              .catch(() => [])
          )).then(rxResults => {
            const activeRx = rxResults.flatMap(r => r).filter(({ rx }) => rx.status === "ACTIVE");
            
            // Generate schedule items from prescriptions
            const items: ScheduleItem[] = [];
            activeRx.forEach(({ rx, room }) => {
              rx.items.forEach((item, idx) => {
                // Determine a time based on frequency for demonstration
                let time = "08:00";
                if (item.frequency.toLowerCase().includes("night") || item.frequency.toLowerCase().includes("bed")) time = "20:00";
                else if (item.frequency.toLowerCase().includes("twice")) time = "08:00 & 20:00";

                items.push({
                  id: `${rx.id}-${idx}`,
                  time,
                  patientId: rx.patientId,
                  med: item.medication,
                  dose: item.dosage,
                  route: "Oral",
                  status: "pending",
                  roomNumber: room,
                });
              });
            });
            setSchedule(items);
            setLoading(false);
          });
        });
    }).catch(() => setLoading(false));
  }, [userId]);

  const getPatientName = (id: number) => {
    const p = patients[id];
    return p ? `${p.firstName || ""} ${p.lastName || ""}`.trim() || `Patient #${id}` : `Patient #${id}`;
  };

  const markStatus = (id: string, val: string) => {
    setSchedule(prev => prev.map(item => item.id === id ? { ...item, status: val } : item));
  };

  const filtered = schedule.filter((m) => {
    if (filter === "Pending") return m.status === "pending";
    if (filter === "Administered") return m.status === "administered";
    if (filter === "Skipped") return m.status === "skipped";
    return true;
  });

  return (
    <div>
      <PageHeader title="Medication Schedule" subtitle="Today's medication administration schedule" />

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {["All", "Pending", "Administered", "Skipped"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f ? "bg-[#1E3A5F] text-white" : "bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]"}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="animate-spin rounded-full h-8 w-8 border-4 border-[#1E3A5F] border-t-transparent" />
          <span className="text-sm text-[#64748B]">Loading medications…</span>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  {["Time", "Patient", "Room", "Medication", "Dose", "Route", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => {
                  return (
                    <tr key={m.id} className={`border-b border-[#F1F5F9] ${m.status === "administered" ? "bg-emerald-50/40" : m.status === "skipped" ? "bg-red-50/40" : i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                      <td className="px-5 py-3.5 font-bold text-[#0F172A]">{m.time}</td>
                      <td className="px-5 py-3.5 font-medium text-[#0F172A]">{getPatientName(m.patientId)}</td>
                      <td className="px-5 py-3.5 text-[#64748B]">{m.roomNumber}</td>
                      <td className="px-5 py-3.5 text-[#0F172A]">{m.med}</td>
                      <td className="px-5 py-3.5 text-[#64748B]">{m.dose}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${routeColors[m.route] || "bg-gray-100 text-gray-600"}`}>{m.route}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={m.status === "administered" ? "active" : m.status === "skipped" ? "critical" : "pending"} dot>{m.status}</Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        {m.status === "pending" && (
                          <div className="flex gap-2">
                            <button onClick={() => markStatus(m.id, "administered")} className="px-3 py-1.5 rounded-lg bg-[#10B981] text-white text-xs font-medium hover:opacity-90">✓ Administer</button>
                            <button onClick={() => markStatus(m.id, "skipped")} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100">Skip</button>
                          </div>
                        )}
                        {m.status !== "pending" && <span className="text-xs text-[#94A3B8]">Recorded</span>}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={8} className="px-5 py-8 text-sm text-[#64748B] text-center">No medications scheduled.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
