import { useState, useEffect } from "react";
import { Calendar, UserCheck, Clock, CreditCard, Plus, Bed, LayoutGrid } from "lucide-react";
import { StatCard } from "../../components/ui/StatCard";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { useNavigate } from "react-router";
import { appointmentApi, receptionistApi, billingApi, adminApi } from "@/api";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";
import type { QueueResponse, AppointmentResponse } from "@/api/appointment.api";
import type { AdmissionResponse } from "@/api/receptionist.api";
import type { AdminUser } from "@/types";

export function ReceptionistDashboard() {
  const navigate = useNavigate();
  
  const [queue, setQueue] = useState<QueueResponse[]>([]);
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [admissions, setAdmissions] = useState<AdmissionResponse[]>([]);
  const [patients, setPatients] = useState<AdminUser[]>([]);
  const [doctors, setDoctors] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const getPatientName = (patientId: number) => {
    const p = patients.find((pat) => pat.id === patientId);
    return p ? `${p.firstName} ${p.lastName}` : `Patient #${patientId}`;
  };

  const getDoctorName = (doctorId: number) => {
    const d = doctors.find((doc) => doc.id === doctorId);
    return d ? `${d.firstName} ${d.lastName}` : `Physician #${doctorId}`;
  };

  const getAppointmentDetailsForQueue = (appointmentId: number) => {
    const appt = appointments.find((a) => a.id === appointmentId);
    if (!appt) return { patientName: "Patient", doctorName: "Physician" };
    return {
      patientName: getPatientName(appt.patientId),
      doctorName: getDoctorName(appt.doctorId)
    };
  };

  const loadData = () => {
    setLoading(true);
    Promise.all([
      appointmentApi.getTodayQueue(),
      appointmentApi.getAllAppointments(0, 100),
      receptionistApi.getActiveAdmissions(),
      adminApi.getUsers("PATIENT"),
      adminApi.getUsers("DOCTOR")
    ])
      .then(([{ data: q }, { data: apptsPage }, { data: activeAdmissions }, { data: ptsList }, { data: docs }]) => {
        setQueue(q);
        setAppointments(apptsPage.content || []);
        setAdmissions(activeAdmissions);
        setPatients(ptsList || []);
        setDoctors(docs || []);
      })
      .catch((err) => {
        console.error(err);
        toast.error(getApiErrorMessage(err, "Failed to load dashboard data."));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCall = async (queueId: number) => {
    try {
      await appointmentApi.callNext(queueId);
      toast.success("Patient called to consultation room.");
      loadData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to call next patient."));
    }
  };

  const handleCheckIn = async (queueId: number, appointmentId: number) => {
    try {
      // Set status in queue
      await appointmentApi.updateQueueStatus(queueId, "CHECKED_IN");
      await appointmentApi.updateAppointmentStatus(appointmentId, "CHECKED_IN");
      toast.success("Patient successfully checked in!");
      loadData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to process check-in."));
    }
  };

  // Helper formatting dates/times
  const getTodayDateString = () => new Date().toISOString().split("T")[0];
  const todayAppts = appointments.filter(a => a.scheduledAt.startsWith(getTodayDateString()));
  const checkedInAppts = todayAppts.filter(a => ["CHECKED_IN", "IN_PROGRESS", "COMPLETED"].includes(a.status));
  const waitingQueue = queue.filter(q => q.status === "WAITING" || q.status === "CALLED" || q.status === "IN_ROOM");

  // Format today's schedule list
  const sortedTodayAppts = [...todayAppts].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

  return (
    <div>
      <PageHeader title="Receptionist Dashboard" subtitle="Front desk operations overview" />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="animate-spin rounded-full h-8 w-8 border-4 border-[#1E3A5F] border-t-transparent" />
          <span className="text-sm text-[#64748B]">Loading dashboard status…</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-7">
            <StatCard title="Today's Appointments" value={String(todayAppts.length)} subtitle="Total scheduled today" icon={<Calendar size={20} className="text-[#0EA5E9]" />} iconBg="bg-sky-50" />
            <StatCard title="Checked In" value={String(checkedInAppts.length)} subtitle="Arrived today" icon={<UserCheck size={20} className="text-[#10B981]" />} iconBg="bg-emerald-50" />
            <StatCard title="Queue Length" value={String(waitingQueue.length)} subtitle="Currently waiting" icon={<Clock size={20} className="text-[#F59E0B]" />} iconBg="bg-amber-50" />
            <StatCard title="Active Admissions" value={String(admissions.length)} subtitle="Occupied beds" icon={<Bed size={20} className="text-[#EF4444]" />} iconBg="bg-red-50" />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 mb-7">
            {[
              { label: "+ Schedule Appointment", path: "/receptionist/appointments", bg: "bg-[#1E3A5F] text-white" },
              { label: "+ Register New Patient", path: "/receptionist/patient-registration", bg: "bg-white border border-[#E2E8F0] text-[#0F172A]" },
              { label: "Process Payment", path: "/receptionist/billing", bg: "bg-white border border-[#E2E8F0] text-[#0F172A]" },
              { label: "Queue Management", path: "/receptionist/queue-management", bg: "bg-white border border-[#E2E8F0] text-[#0F172A]" },
            ].map((a) => (
              <button key={a.label} onClick={() => navigate(a.path)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-all cursor-pointer ${a.bg}`}>
                {a.label}
              </button>
            ))}
            <button onClick={() => navigate("/receptionist/admissions")} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-[#1E3A5F] text-white hover:opacity-90 transition-all cursor-pointer">
              <Bed size={14} />Admit Patient
            </button>
            <button onClick={() => navigate("/receptionist/rooms")} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-[#0EA5E9] text-white hover:opacity-90 transition-all cursor-pointer">
              <LayoutGrid size={14} />Room Board
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Live queue board */}
            <div className="xl:col-span-2 bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
                <h3 className="font-semibold text-[#0F172A]">Live Queue Board</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  <span className="text-xs text-[#10B981] font-medium">Live</span>
                </div>
              </div>
              {queue.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#64748B]">No patients in the queue today.</div>
              ) : (
                <div className="divide-y divide-[#F1F5F9]">
                  {queue.map((q) => (
                    <div key={q.id} className={`flex items-center gap-4 px-5 py-3.5 ${
                      q.status === "IN_ROOM" ? "bg-blue-50" : q.status === "CALLED" ? "bg-purple-50" : ""
                    }`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        q.status === "IN_ROOM" ? "bg-[#0EA5E9] text-white" :
                        q.status === "CALLED" ? "bg-purple-500 text-white" :
                        "bg-[#F0F4F8] text-[#64748B]"
                      }`}>
                        #{q.ticketNumber}
                      </div>
                      <div className="flex-1">
                        {(() => {
                          const details = getAppointmentDetailsForQueue(q.appointmentId);
                          return (
                            <>
                              <p className="font-medium text-[#0F172A] text-sm">{details.patientName}</p>
                              <p className="text-xs text-[#64748B]">Physician: Dr. {details.doctorName}</p>
                            </>
                          );
                        })()}
                      </div>
                      <span className="text-xs text-[#64748B]">Checked In: {new Date(q.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <Badge
                        variant={q.status === "IN_ROOM" ? "active" : q.status === "CALLED" ? "warning" : "pending"}
                        dot
                      >
                        {q.status === "CALLED" ? "Called" : q.status === "IN_ROOM" ? "In Room" : q.status}
                      </Badge>
                      {q.status === "IN_ROOM" ? (
                        <span className="text-xs font-semibold text-[#0EA5E9] bg-sky-50 px-2.5 py-1.5 rounded-lg border border-sky-100">
                          In Room
                        </span>
                      ) : q.status === "CALLED" ? (
                        <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1.5 rounded-lg border border-purple-100">
                          En Route
                        </span>
                      ) : q.status === "WAITING" ? (
                        <button
                          onClick={() => handleCall(q.id)}
                          className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#64748B] hover:bg-[#F8FAFC] cursor-pointer"
                        >
                          Call
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="space-y-5">
              {/* Today's schedule */}
              <div className="bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <div className="px-5 py-4 border-b border-[#E2E8F0]">
                  <h3 className="font-semibold text-[#0F172A]">Today's Schedule</h3>
                </div>
                {sortedTodayAppts.length === 0 ? (
                  <div className="p-6 text-center text-sm text-[#64748B]">No appointments today.</div>
                ) : (
                  <div className="divide-y divide-[#F1F5F9] max-h-[300px] overflow-y-auto">
                    {sortedTodayAppts.map((s) => {
                      const time = new Date(s.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      return (
                        <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                          <span className="text-sm font-bold text-[#0F172A] w-12 shrink-0">{time}</span>
                          <div>
                            <p className="text-sm font-medium text-[#0F172A]">{s.patientName || "Patient"}</p>
                            <p className="text-xs text-[#64748B]">{s.type} · Dr. {s.doctorName}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Active Admissions */}
              <div className="bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center gap-2">
                  <Bed size={16} className="text-[#F59E0B]" />
                  <h3 className="font-semibold text-[#0F172A]">Active Inpatients</h3>
                </div>
                {admissions.length === 0 ? (
                  <div className="p-6 text-center text-sm text-[#64748B]">No inpatient admissions.</div>
                ) : (
                  <div className="divide-y divide-[#F1F5F9] max-h-[300px] overflow-y-auto">
                    {admissions.map((d) => (
                      <div key={d.id} className="flex items-center gap-3 px-5 py-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#0F172A]">Patient #{d.patientId}</p>
                          <p className="text-xs text-[#64748B]">Room {d.room?.roomNumber || "—"} · Bed {d.bedNumber ?? "—"}</p>
                        </div>
                        <button onClick={() => navigate("/receptionist/admissions")} className="px-3 py-1.5 rounded-lg bg-[#F59E0B] text-white text-xs font-semibold hover:opacity-90 cursor-pointer">Manage</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}