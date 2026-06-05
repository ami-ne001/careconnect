import { useEffect, useState } from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { useAuth } from "../../../store/useAuth";
import { clinicalApi } from "../../../api/clinical.api";
import { appointmentApi, AppointmentResponse } from "../../../api/appointment.api";
import { patientApi } from "../../../api/patient.api";

export function NurseAppointments() {
  const { userId } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    // To show nursing appointments, we find patients assigned to this nurse, then fetch their appointments for today.
    clinicalApi.getCareTasksAssignedTo(userId).then(r => {
      const patientIds = Array.from(new Set(r.data.map(t => t.patientId)));
      Promise.all(patientIds.map(id => appointmentApi.getAppointmentsByPatient(id).then(a => a.data).catch(() => [])))
        .then(results => {
          const allAppts = results.flat();
          // Filter to today's appointments
          const today = new Date().toDateString();
          const todayAppts = allAppts.filter(a => new Date(a.scheduledAt).toDateString() === today);
          setAppointments(todayAppts.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()));

          // Fetch missing patient names
          todayAppts.forEach(a => {
            if (!a.patientName) {
              patientApi.getProfileById(a.patientId).then(p => {
                setAppointments(prev => prev.map(pa => pa.id === a.id ? { ...pa, patientName: `${p.data.firstName || ""} ${p.data.lastName || ""}`.trim() } : pa));
              }).catch(() => {});
            }
          });
          setLoading(false);
        });
    }).catch(() => setLoading(false));
  }, [userId]);

  return (
    <div>
      <PageHeader title="Nursing Appointments" subtitle="Today's patient procedures and nursing involvement" />
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="animate-spin rounded-full h-8 w-8 border-4 border-[#1E3A5F] border-t-transparent" />
          <span className="text-sm text-[#64748B]">Loading appointments…</span>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  {["Time", "Patient", "Room", "Procedure / Reason", "Doctor", "Nursing Action Required", "Status"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appointments.map((a, i) => {
                  const time = new Date(a.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const isCompleted = a.status === "COMPLETED";
                  const isActive = a.status === "IN_PROGRESS" || a.status === "CONFIRMED";
                  return (
                    <tr key={a.id} className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] ${isActive ? "bg-blue-50/50" : i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                      <td className="px-5 py-3.5 font-bold text-[#0F172A]">{time}</td>
                      <td className="px-5 py-3.5 font-medium text-[#0F172A]">{a.patientName || `Patient #${a.patientId}`}</td>
                      <td className="px-5 py-3.5 text-[#64748B]">{a.room || "—"}</td>
                      <td className="px-5 py-3.5 text-[#64748B]">{a.type}</td>
                      <td className="px-5 py-3.5 text-[#64748B]">{a.doctorName || `Dr. #${a.doctorId}`}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">Prep / Assist</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={isCompleted ? "completed" : isActive ? "active" : "pending"} dot>
                          {a.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
                {appointments.length === 0 && <tr><td colSpan={7} className="px-5 py-8 text-sm text-[#64748B] text-center">No appointments scheduled for your patients today.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
