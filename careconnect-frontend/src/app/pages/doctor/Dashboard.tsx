import { useEffect, useState, useMemo } from "react";
import { Calendar, Users, FlaskConical, Stethoscope, ChevronRight, Bed } from "lucide-react";
import { StatCard } from "../../components/ui/StatCard";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { useNavigate } from "react-router";
import { useAuth } from "../../../store/useAuth";
import { clinicalApi, SurgeryResponse, ConsultationResponse, VitalsResponse } from "../../../api/clinical.api";
import { appointmentApi, AppointmentResponse } from "../../../api/appointment.api";
import { labApi, LabRequestResponse } from "../../../api/lab.api";
import { receptionistApi, AdmissionResponse } from "../../../api/receptionist.api";
import { patientApi } from "../../../api/patient.api";
import type { PatientProfileResponse } from "../../../types/patient.types";

const typeColor: Record<string, "active" | "pending" | "critical"> = {
  CHECKUP: "active", FOLLOW_UP: "pending", EMERGENCY: "critical",
  Checkup: "active", "Follow-up": "pending", Emergency: "critical",
};

export function DoctorDashboard() {
  const navigate = useNavigate();
  const { userId, firstName, lastName } = useAuth();

  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [consultations, setConsultations] = useState<ConsultationResponse[]>([]);
  const [labRequests, setLabRequests] = useState<LabRequestResponse[]>([]);
  const [admissions, setAdmissions] = useState<AdmissionResponse[]>([]);
  const [surgeries, setSurgeries] = useState<SurgeryResponse[]>([]);
  const [patients, setPatients] = useState<Record<number, PatientProfileResponse>>({});
  const [vitals, setVitals] = useState<Record<number, VitalsResponse>>({});

  const fetchPatient = (id: number) => {
    if (!patients[id]) {
      patientApi.getProfileById(id).then(r => setPatients(prev => ({ ...prev, [id]: r.data }))).catch(() => {});
    }
  };

  useEffect(() => {
    if (!userId) return;

    appointmentApi.getAppointmentsByDoctor(userId).then(r => {
      setAppointments(r.data);
      r.data.forEach(a => fetchPatient(a.patientId));
    }).catch(console.error);

    clinicalApi.getConsultationsByDoctor(userId).then(r => setConsultations(r.data)).catch(console.error);

    labApi.getLabRequestsByDoctor(userId).then(r => setLabRequests(r.data)).catch(console.error);

    clinicalApi.getSurgeriesBySurgeon(userId).then(r => {
      setSurgeries(r.data);
      r.data.forEach(s => fetchPatient(s.patientId));
    }).catch(console.error);

    receptionistApi.getActiveAdmissions().then(r => {
      const myAdm = r.data.filter(a => a.admittingDoctorId === userId);
      setAdmissions(myAdm);
      myAdm.forEach(a => {
        fetchPatient(a.patientId);
        clinicalApi.getLatestVitalsByPatient(a.patientId)
          .then(v => setVitals(prev => ({ ...prev, [a.patientId]: v.data })))
          .catch(() => {});
      });
    }).catch(console.error);
  }, [userId]);

  const getPatientName = (id: number) => {
    const p = patients[id];
    return p ? `${p.firstName || ""} ${p.lastName || ""}`.trim() || `Patient #${id}` : `Patient #${id}`;
  };
  const getInitials = (id: number) => {
    const p = patients[id];
    return p && p.firstName && p.lastName ? `${p.firstName[0]}${p.lastName[0]}` : "P";
  };

  const todayStr = new Date().toDateString();
  const todayAppointments = appointments.filter(a => new Date(a.scheduledAt).toDateString() === todayStr);
  const pendingLabs = labRequests.filter(l => l.status !== "COMPLETED" && l.status !== "CANCELLED");
  const recentConsults = useMemo(() =>
    [...consultations].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()).slice(0, 5),
  [consultations]);
  const upcomingSurgeries = surgeries.filter(s => s.status !== "COMPLETED" && s.status !== "CANCELLED");

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div>
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#0EA5E9] rounded-xl p-5 mb-6 text-white">
        <p className="text-white/70 text-sm mb-1">{greeting}</p>
        <h2 className="font-bold text-xl">Dr. {firstName} {lastName} 👋</h2>
        <p className="text-white/60 text-sm mt-0.5">{dateStr}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-7">
        <StatCard title="Today's Appointments" value={todayAppointments.length.toString()} subtitle="Scheduled today" icon={<Calendar size={20} className="text-[#0EA5E9]" />} iconBg="bg-sky-50" />
        <StatCard title="Pending Consultations" value={consultations.filter(c => c.status === "OPEN").length.toString()} subtitle="Awaiting review" icon={<Stethoscope size={20} className="text-[#8B5CF6]" />} iconBg="bg-purple-50" />
        <StatCard title="Lab Results Pending" value={pendingLabs.length.toString()} subtitle="Awaiting results" icon={<FlaskConical size={20} className="text-[#F59E0B]" />} iconBg="bg-amber-50" />
        <StatCard title="Active Patients" value={admissions.length.toString()} subtitle="Under your care" icon={<Users size={20} className="text-[#10B981]" />} iconBg="bg-emerald-50" />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-7">
        {[
          { label: "Start Consultation", path: "/doctor/consultations" },
          { label: "Request Lab Test", path: "/doctor/lab-requests" },
          { label: "Write Prescription", path: "/doctor/prescriptions" },
          { label: "View Patient Records", path: "/doctor/medical-records" },
        ].map((a) => (
          <button key={a.label} onClick={() => navigate(a.path)} className="px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#0EA5E9] transition-all">
            {a.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Today's schedule */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <h3 className="font-semibold text-[#0F172A]">Today's Schedule</h3>
            <button onClick={() => navigate("/doctor/appointments")} className="text-xs text-[#0EA5E9] font-medium hover:underline flex items-center gap-1">View All <ChevronRight size={12} /></button>
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {todayAppointments.length === 0 && <p className="px-5 py-4 text-sm text-[#64748B]">No appointments today.</p>}
            {todayAppointments.map((s) => {
              const time = new Date(s.scheduledAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
              const isActive = s.status === "CONFIRMED" || s.status === "IN_PROGRESS";
              const isCompleted = s.status === "COMPLETED";
              return (
                <div key={s.id} className={`flex items-center gap-4 px-5 py-3.5 ${isActive ? "bg-blue-50" : ""}`}>
                  <div className="text-center shrink-0 w-12">
                    <p className="text-sm font-bold text-[#0F172A]">{time}</p>
                  </div>
                  <div className={`w-1 h-8 rounded-full shrink-0 ${isActive ? "bg-[#0EA5E9]" : isCompleted ? "bg-[#10B981]" : "bg-[#E2E8F0]"}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#0F172A]">{s.patientName || getPatientName(s.patientId)}</p>
                    <p className="text-xs text-[#64748B]">{s.room || "—"}</p>
                  </div>
                  <Badge variant={typeColor[s.type] || "pending"}>{s.type}</Badge>
                  {isActive && (
                    <button className="px-3 py-1.5 rounded-lg bg-[#0EA5E9] text-white text-xs font-medium">Start</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending lab results */}
        <div className="bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="px-5 py-4 border-b border-[#E2E8F0]">
            <h3 className="font-semibold text-[#0F172A]">Pending Lab Results</h3>
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {pendingLabs.length === 0 && <p className="px-5 py-4 text-sm text-[#64748B]">No pending lab results.</p>}
            {pendingLabs.slice(0, 5).map((l) => (
              <div key={l.id} className="px-5 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">{l.patientName || getPatientName(l.patientId)}</p>
                  <p className="text-xs text-[#64748B]">{l.testTypeName} · {new Date(l.requestedAt).toLocaleDateString()}</p>
                </div>
                <button className="px-3 py-1.5 rounded-lg bg-[#0EA5E9]/10 text-[#0EA5E9] text-xs font-medium hover:bg-[#0EA5E9]/20">Review</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Consultations */}
      <div className="bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="px-5 py-4 border-b border-[#E2E8F0]">
          <h3 className="font-semibold text-[#0F172A]">Recent Consultations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {["Patient", "Diagnosis", "Date", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentConsults.map((c, i) => (
                <tr key={c.id} className={`border-b border-[#F1F5F9] ${i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                  <td className="px-5 py-3.5 font-medium text-[#0F172A]">{getPatientName(c.patientId)}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{c.diagnosis || "—"}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{new Date(c.startedAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5"><Badge variant={c.status === "CLOSED" ? "completed" : "active"}>{c.status}</Badge></td>
                </tr>
              ))}
              {recentConsults.length === 0 && <tr><td colSpan={4} className="px-5 py-4 text-sm text-[#64748B] text-center">No consultations yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* My Admitted Patients */}
      <div className="mt-6 bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bed size={18} className="text-[#1E3A5F]" />
            <h3 className="font-semibold text-[#0F172A]">My Admitted Patients</h3>
            <span className="px-2 py-0.5 rounded-full bg-[#1E3A5F] text-white text-xs font-bold">{admissions.length}</span>
          </div>
          <button onClick={() => navigate("/receptionist/admissions")} className="text-xs text-[#0EA5E9] font-medium hover:underline flex items-center gap-1">View All <ChevronRight size={12} /></button>
        </div>
        <div className="p-4 overflow-x-auto">
          <div className="flex gap-4" style={{ minWidth: "max-content" }}>
            {admissions.map((adm) => {
              const v = vitals[adm.patientId];
              const dayCount = Math.ceil((Date.now() - new Date(adm.admissionDate).getTime()) / 86400000);
              const borderColor = v && (v.bpSystolic || 0) > 150 ? "border-red-300" : v && (v.bpSystolic || 0) > 140 ? "border-amber-300" : "border-[#E2E8F0]";
              return (
                <div key={adm.id} className={`w-56 shrink-0 rounded-xl border-2 p-4 bg-white ${borderColor}`} style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-9 h-9 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-xs font-bold shrink-0">{getInitials(adm.patientId)}</div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#0F172A] text-sm truncate">{getPatientName(adm.patientId)}</p>
                      <span className="px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1E3A5F] text-[10px] font-bold">Room {adm.room.roomNumber}</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#64748B] mb-0.5">{adm.diagnosis || "—"}</p>
                  <p className="text-xs text-[#64748B] mb-1">Admitted {new Date(adm.admissionDate).toLocaleDateString()}</p>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold mb-2">
                    Day {dayCount}
                  </div>
                  <div className="grid grid-cols-2 gap-1 mb-3">
                    <div className="bg-[#F8FAFC] rounded-lg p-1.5 text-center">
                      <p className="text-[9px] text-[#94A3B8]">BP</p>
                      <p className="text-xs font-bold text-[#0F172A]">{v ? `${v.bpSystolic}/${v.bpDiastolic}` : "—"}</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-lg p-1.5 text-center">
                      <p className="text-[9px] text-[#94A3B8]">HR</p>
                      <p className="text-xs font-bold text-[#0F172A]">{v?.heartRate || "—"}</p>
                    </div>
                  </div>
                  <button className="w-full h-7 rounded-lg bg-[#1E3A5F] text-white text-[10px] font-semibold hover:opacity-90">View Patient</button>
                </div>
              );
            })}
            {admissions.length === 0 && <p className="text-sm text-[#64748B]">No admitted patients.</p>}
          </div>
        </div>
      </div>

      {/* Upcoming Surgeries */}
      <div className="mt-6 bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔪</span>
            <h3 className="font-semibold text-[#0F172A]">Upcoming Surgeries</h3>
            <span className="px-2 py-0.5 rounded-full bg-[#0EA5E9] text-white text-xs font-bold">{upcomingSurgeries.length}</span>
          </div>
          <button onClick={() => navigate("/doctor/surgeries")} className="text-xs text-[#0EA5E9] font-medium hover:underline flex items-center gap-1">View All Surgeries <ChevronRight size={12} /></button>
        </div>
        <div className="divide-y divide-[#F1F5F9]">
          {upcomingSurgeries.slice(0, 3).map((s) => (
            <div key={s.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#0F172A] text-sm truncate">{s.surgeryType}</p>
                <p className="text-xs text-[#64748B]">{getPatientName(s.patientId)} · {new Date(s.scheduledAt).toLocaleString()}</p>
              </div>
              <span className="text-xs text-[#64748B] font-medium shrink-0">{s.operatingRoomName}</span>
              <Badge variant={s.status === "SCHEDULED" ? "info" : "pending"}>{s.status}</Badge>
            </div>
          ))}
          {upcomingSurgeries.length === 0 && <p className="px-5 py-4 text-sm text-[#64748B]">No upcoming surgeries.</p>}
        </div>
      </div>
    </div>
  );
}