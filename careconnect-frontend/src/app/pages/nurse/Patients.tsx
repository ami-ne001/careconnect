import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { useAuth } from "../../../store/useAuth";
import { clinicalApi, CareTaskResponse, VitalsResponse } from "../../../api/clinical.api";
import { patientApi } from "../../../api/patient.api";
import { receptionistApi, AdmissionResponse } from "../../../api/receptionist.api";
import type { PatientProfileResponse } from "../../../types/patient.types";

export function NursePatients() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [admissions, setAdmissions] = useState<AdmissionResponse[]>([]);
  const [patients, setPatients] = useState<Record<number, PatientProfileResponse>>({});
  const [vitals, setVitals] = useState<Record<number, VitalsResponse>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    // Get tasks assigned to this nurse, find unique patients, then get their admissions
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

  return (
    <div>
      <PageHeader title="My Patients" subtitle="Assigned patients for this shift" />
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="animate-spin rounded-full h-8 w-8 border-4 border-[#1E3A5F] border-t-transparent" />
          <span className="text-sm text-[#64748B]">Loading patients…</span>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  {["Room", "Patient", "Diagnosis", "Attending Doctor", "Admitted", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {admissions.map((adm, i) => {
                  const status = getOverallStatus(adm.patientId);
                  return (
                    <tr key={adm.id} className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] ${status === "critical" ? "bg-red-50/50" : i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                      <td className="px-5 py-3.5 font-bold text-[#1E3A5F]">{adm.room.roomNumber}</td>
                      <td className="px-5 py-3.5 font-medium text-[#0F172A]">{getPatientName(adm.patientId)}</td>
                      <td className="px-5 py-3.5 text-[#64748B]">{adm.diagnosis || adm.admissionReason || "—"}</td>
                      <td className="px-5 py-3.5 text-[#64748B]">Doctor #{adm.admittingDoctorId}</td>
                      <td className="px-5 py-3.5 text-[#64748B]">{new Date(adm.admissionDate).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5"><Badge variant={status as any} dot>{status}</Badge></td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2">
                          <button onClick={() => navigate('/nurse/care-tasks')} className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#0F172A] hover:bg-[#F0F4F8]">View Tasks</button>
                          <button onClick={() => navigate('/nurse/vitals-monitoring')} className="px-3 py-1.5 rounded-lg bg-[#0EA5E9]/10 text-[#0EA5E9] text-xs font-medium hover:bg-[#0EA5E9]/20">Record Vitals</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {admissions.length === 0 && <tr><td colSpan={7} className="px-5 py-8 text-sm text-[#64748B] text-center">No patients assigned.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
