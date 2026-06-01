import { useState, useEffect } from "react";
import { Search, UserCheck } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { appointmentApi, adminApi } from "@/api";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";
import type { AppointmentResponse, QueueResponse } from "@/api/appointment.api";
import type { AdminUser } from "@/types";

export function CheckIn() {
  const [search, setSearch] = useState("");
  const [allAppointments, setAllAppointments] = useState<AppointmentResponse[]>([]);
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [todayQueue, setTodayQueue] = useState<QueueResponse[]>([]);
  const [patients, setPatients] = useState<AdminUser[]>([]);
  const [doctors, setDoctors] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection states for check-in
  const [selectedAppt, setSelectedAppt] = useState<AppointmentResponse | null>(null);
  const [checkedInTicket, setCheckedInTicket] = useState<QueueResponse | null>(null);

  const getPatientName = (patientId: number) => {
    const p = patients.find((pat) => pat.id === patientId);
    return p ? `${p.firstName} ${p.lastName}` : `Patient #${patientId}`;
  };

  const getDoctorName = (doctorId: number) => {
    const d = doctors.find((doc) => doc.id === doctorId);
    return d ? `${d.firstName} ${d.lastName}` : `Physician #${doctorId}`;
  };

  const getAppointmentDetailsForQueue = (appointmentId: number) => {
    const appt = allAppointments.find((a) => a.id === appointmentId);
    if (!appt) return { patientName: "Patient", doctorName: "Physician" };
    return {
      patientName: getPatientName(appt.patientId),
      doctorName: getDoctorName(appt.doctorId)
    };
  };

  const loadData = () => {
    setLoading(true);
    Promise.all([
      appointmentApi.getAllAppointments(0, 1000),
      appointmentApi.getTodayQueue(),
      adminApi.getUsers("PATIENT"),
      adminApi.getUsers("DOCTOR")
    ])
      .then(([{ data: apptsPage }, { data: queue }, { data: patientsList }, { data: docs }]) => {
        const allAppts = apptsPage.content || [];
        setAllAppointments(allAppts);
        setPatients(patientsList || []);
        setDoctors(docs || []);
        setTodayQueue(queue || []);

        // Filter for scheduled or confirmed appointments today
        const todayStr = new Date().toDateString();
        const todayScheduled = allAppts.filter(
          (a) => new Date(a.scheduledAt).toDateString() === todayStr && ["SCHEDULED", "CONFIRMED"].includes(a.status)
        );
        setAppointments(todayScheduled);
      })
      .catch((err) => {
        toast.error(getApiErrorMessage(err, "Failed to load check-in data."));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    if (!value.trim()) {
      setSelectedAppt(null);
      setCheckedInTicket(null);
      return;
    }
    // Keep selectedAppt in sync but don't auto-select — user picks from the filtered list
    if (selectedAppt && !getPatientName(selectedAppt.patientId).toLowerCase().includes(value.toLowerCase())) {
      setSelectedAppt(null);
      setCheckedInTicket(null);
    }
  };

  // Derived: today's scheduled appointments filtered by search
  const filteredTodayAppointments = appointments.filter((a) => {
    if (!search.trim()) return true;
    return getPatientName(a.patientId).toLowerCase().includes(search.toLowerCase());
  });

  const processCheckIn = async () => {
    if (!selectedAppt) return;
    try {
      const { data: ticket } = await appointmentApi.checkIn(selectedAppt.id);
      
      // Update appointment status to CHECKED_IN
      await appointmentApi.updateAppointmentStatus(selectedAppt.id, "CHECKED_IN");

      setCheckedInTicket(ticket);
      toast.success("Check-in successful! Ticket generated.");
      
      // Reload lists
      loadData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Check-in failed. Please try again."));
    }
  };

  return (
    <div>
      <PageHeader title="Patient Check-In" subtitle="Search and check in patients for their appointments" />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <span className="animate-spin rounded-full h-8 w-8 border-4 border-[#1E3A5F] border-t-transparent" />
          <span className="text-sm text-[#64748B]">Loading patient list…</span>
        </div>
      ) : (
        <>
          {/* Search */}
          <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] mb-6" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h3 className="font-semibold text-[#0F172A] mb-4">Today's Scheduled Patients</h3>
            <div className="flex gap-3">
              <div className="flex items-center gap-2 bg-[#F0F4F8] rounded-lg px-4 py-2.5 flex-1">
                <Search size={18} className="text-[#64748B] shrink-0" />
                <input
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Filter by patient name..."
                  className="bg-transparent flex-1 text-sm outline-none text-[#0F172A] placeholder:text-[#94A3B8]"
                />
              </div>
              {search && (
                <button
                  onClick={() => handleSearch("")}
                  className="px-4 py-2.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#64748B] hover:bg-[#F8FAFC] cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          {/* Today's Scheduled Appointments Grid */}
          <div className="mb-6">
            {filteredTodayAppointments.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center text-[#64748B] text-sm">
                {search.trim() ? `No appointments found matching "${search}".` : "No scheduled appointments for today."}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredTodayAppointments.map((appt) => {
                  const isSelected = selectedAppt?.id === appt.id;
                  const alreadyCheckedIn = todayQueue.some((q) => q.appointmentId === appt.id);
                  return (
                    <button
                      key={appt.id}
                      onClick={() => {
                        if (alreadyCheckedIn) return;
                        setSelectedAppt(isSelected ? null : appt);
                        setCheckedInTicket(null);
                      }}
                      disabled={alreadyCheckedIn}
                      className={`text-left w-full rounded-xl border-2 p-4 transition-all ${
                        alreadyCheckedIn
                          ? "border-[#10B981] bg-emerald-50 opacity-70 cursor-default"
                          : isSelected
                          ? "border-[#0EA5E9] bg-[#F0F9FF] shadow-md cursor-pointer"
                          : "border-[#E2E8F0] bg-white hover:border-[#0EA5E9]/50 hover:shadow-sm cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-[#1E3A5F] flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {getPatientName(appt.patientId).slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[#0F172A] text-sm truncate">{getPatientName(appt.patientId)}</p>
                          <p className="text-xs text-[#64748B] truncate">Dr. {getDoctorName(appt.doctorId)}</p>
                        </div>
                        {alreadyCheckedIn ? (
                          <Badge variant="completed" dot>Checked In</Badge>
                        ) : (
                          <Badge variant={appt.status === "CONFIRMED" ? "active" : "pending"} dot>{appt.status}</Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-[#64748B]">
                        <span>{new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>{appt.type.replace(/_/g, " ")}</span>
                        <span className="font-medium text-[#0F172A]">{appt.room || "No room"}</span>
                      </div>
                      {isSelected && !alreadyCheckedIn && (
                        <p className="text-xs text-[#0EA5E9] font-semibold mt-2">Click \"Check In\" below ↓</p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Patient Card Result (Check-In Action) */}
          {selectedAppt && !checkedInTicket && (
            <div className="bg-white rounded-xl border-2 border-[#0EA5E9] p-6 mb-6" style={{ boxShadow: "0 4px 16px rgba(14,165,233,0.15)" }}>
              <div className="flex flex-wrap items-start gap-5">
                <div className="w-16 h-16 rounded-2xl bg-[#1E3A5F] flex items-center justify-center text-white text-xl font-bold shrink-0">
                  {getPatientName(selectedAppt.patientId).slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#0F172A] text-lg">{getPatientName(selectedAppt.patientId)}</h3>
                  <p className="text-xs text-[#64748B]">Patient User ID: #{selectedAppt.patientId}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="pending" dot>{selectedAppt.status}</Badge>
                  </div>
                </div>
                <div className="bg-[#F8FAFC] rounded-xl p-4 text-xs space-y-2 border border-[#E2E8F0]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#64748B]">Scheduled At:</span>
                    <span className="font-semibold text-[#0F172A]">
                      {new Date(selectedAppt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#64748B]">Doctor:</span>
                    <span className="font-medium text-[#0F172A]">Dr. {getDoctorName(selectedAppt.doctorId)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#64748B]">Type:</span>
                    <span className="font-medium text-[#0F172A]">{selectedAppt.type.replace("_", " ")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#64748B]">Room:</span>
                    <span className="font-semibold text-[#0EA5E9]">{selectedAppt.room || "—"}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={processCheckIn}
                className="w-full h-12 mt-5 rounded-xl bg-[#10B981] text-white font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserCheck size={18} />
                Check In {getPatientName(selectedAppt.patientId)}
              </button>
            </div>
          )}

          {/* Success Box */}
          {checkedInTicket && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#10B981] flex items-center justify-center mx-auto mb-3">
                <UserCheck size={20} className="text-white" />
              </div>
              <h3 className="font-bold text-[#0F172A] text-base">Successfully Checked In!</h3>
              <p className="text-[#64748B] text-xs mt-1">Ticket Number has been generated successfully.</p>
              <div className="my-4 inline-block bg-white border-2 border-[#10B981] text-[#10B981] text-2xl font-black px-6 py-2 rounded-xl">
                TICKET #{checkedInTicket.ticketNumber}
              </div>
              <p className="text-[#64748B] text-xs">Estimated waiting list updated. Patient is in today's active queue.</p>
            </div>
          )}

          {/* Today's Check-ins */}
          <div className="bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div className="px-5 py-4 border-b border-[#E2E8F0]">
              <h3 className="font-semibold text-[#0F172A]">Today's Active Queue & Check-ins</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    {["Ticket #", "Checked In", "Patient Name", "Consultation Provider", "Queue Status"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {todayQueue.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-[#64748B]">No patients checked in today yet.</td>
                    </tr>
                  ) : (
                    todayQueue.map((c, i) => {
                      const dt = new Date(c.checkedInAt);
                      const formattedTime = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const details = getAppointmentDetailsForQueue(c.appointmentId);

                      return (
                        <tr key={c.id} className={`border-b border-[#F1F5F9] ${i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                          <td className="px-5 py-3.5 font-bold text-[#0EA5E9]">#{c.ticketNumber}</td>
                          <td className="px-5 py-3.5 font-semibold text-[#0F172A]">{formattedTime}</td>
                          <td className="px-5 py-3.5 font-semibold text-[#0F172A]">{details.patientName}</td>
                          <td className="px-5 py-3.5 text-[#64748B]">Dr. {details.doctorName}</td>
                          <td className="px-5 py-3.5">
                            <Badge variant={c.status === "CALLED" ? "active" : c.status === "COMPLETED" ? "completed" : "pending"} dot>
                              {c.status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
