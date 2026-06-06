import { useState, useEffect } from "react";
import { Users, UserCheck, Clock, Volume2, UserX, CheckCircle2, Megaphone, Check } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { appointmentApi, adminApi } from "@/api";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";
import type { QueueResponse, AppointmentResponse } from "@/api/appointment.api";
import type { AdminUser } from "@/types";

export function QueueManagement() {
  const [queue, setQueue] = useState<QueueResponse[]>([]);
  const [allAppointments, setAllAppointments] = useState<AppointmentResponse[]>([]);
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
    const appt = allAppointments.find((a) => a.id === appointmentId);
    if (!appt) return { patientName: "Patient", doctorName: "Physician" };
    return {
      patientName: getPatientName(appt.patientId),
      doctorName: getDoctorName(appt.doctorId)
    };
  };

  const loadQueue = () => {
    setLoading(true);
    Promise.all([
      appointmentApi.getTodayQueue(),
      appointmentApi.getAllAppointments(0, 1000),
      adminApi.getUsers("PATIENT"),
      adminApi.getUsers("DOCTOR")
    ])
      .then(([{ data: q }, { data: apptsPage }, { data: patientsList }, { data: docs }]) => {
        setQueue(q || []);
        setAllAppointments(apptsPage.content || []);
        setPatients(patientsList || []);
        setDoctors(docs || []);
      })
      .catch((err) => {
        console.error(err);
        toast.error(getApiErrorMessage(err, "Failed to load queue."));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleCall = async (id: number) => {
    try {
      await appointmentApi.callNext(id);
      toast.success("Patient called successfully.");
      loadQueue();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to call patient."));
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await appointmentApi.updateQueueStatus(id, status);
      toast.success(`Patient marked as ${status.replace("_", " ").toLowerCase()}.`);
      loadQueue();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to update queue status."));
    }
  };

  const callNextInWaiting = async () => {
    const nextWaiting = queue.find((q) => q.status === "WAITING");
    if (!nextWaiting) {
      toast.info("No patients currently waiting in line.");
      return;
    }
    await handleCall(nextWaiting.id);
  };

  const servingQueue = queue.filter((q) => q.status === "IN_ROOM");
  const called = queue.filter((q) => q.status === "CALLED");
  const waitingAndCalled = queue.filter((q) => q.status === "WAITING" || q.status === "CALLED");
  const served = queue.filter((q) => q.status === "DONE").length;

  return (
    <div>
      <PageHeader title="Queue Management" subtitle="Manage patient flow and waiting queue" />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="animate-spin rounded-full h-8 w-8 border-4 border-[#1E3A5F] border-t-transparent" />
          <span className="text-sm text-[#64748B]">Loading queue status…</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
            {[
              { label: "Total Served Today", val: served, color: "text-[#10B981]", bg: "bg-[#ECFDF5]", icon: <CheckCircle2 size={20} className="text-[#10B981]" /> },
              { label: "Currently Waiting", val: waitingAndCalled.filter(q => q.status === "WAITING").length, color: "text-[#F59E0B]", bg: "bg-[#FEF3C7]", icon: <Clock size={20} className="text-[#F59E0B]" /> },
              { label: "Called / En Route", val: called.length, color: "text-[#8B5CF6]", bg: "bg-[#F3E8FF]", icon: <Megaphone size={20} className="text-[#8B5CF6]" /> },
              { label: "Active in Room", val: servingQueue.length, color: "text-[#0EA5E9]", bg: "bg-[#E0F2FE]", icon: <UserCheck size={20} className="text-[#0EA5E9]" /> },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-5 border border-[#E2E8F0] flex items-center gap-4 transition-transform hover:-translate-y-1" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${s.bg}`}>
                  {s.icon}
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-[#64748B] font-bold mb-1">{s.label}</p>
                  <p className={`text-3xl font-black ${s.color}`}>{s.val}</p>
                </div>
              </div>
            ))}
          </div>



          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="bg-[#1E3A5F] rounded-2xl p-6 text-white flex flex-col" style={{ boxShadow: "0 8px 24px rgba(30,58,95,0.15)" }}>
              <div className="flex items-center gap-2 text-white/60 text-xs uppercase tracking-wider font-bold mb-5 pb-4 border-b border-white/10">
                <Users size={16} />
                <span>Currently in Consultation ({servingQueue.length})</span>
              </div>
              
              {servingQueue.length > 0 ? (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {servingQueue.map((serving) => {
                    const details = getAppointmentDetailsForQueue(serving.appointmentId);
                    return (
                      <div key={serving.id} className="bg-white/10 rounded-xl p-5 border border-white/10 relative overflow-hidden backdrop-blur-sm">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full -mr-4 -mt-4"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                          <div className="text-3xl font-black text-[#38BDF8]">#{serving.ticketNumber}</div>
                          <Badge variant="active" dot className="bg-[#38BDF8]/20 text-[#38BDF8] border-none shadow-none">IN ROOM</Badge>
                        </div>
                        <div className="mb-5 relative z-10">
                          <p className="text-lg font-bold text-white leading-tight">{details.patientName}</p>
                          <p className="text-white/60 text-xs mt-1 font-medium">Consulting: Dr. {details.doctorName}</p>
                        </div>
                        <div className="flex gap-2 relative z-10">
                          <button
                            onClick={() => handleStatusUpdate(serving.id, "DONE")}
                            className="flex-1 py-2.5 rounded-lg bg-[#10B981] text-white font-bold text-xs hover:bg-[#059669] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Check size={14} strokeWidth={3} /> Complete
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const appt = allAppointments.find((a) => a.id === serving.appointmentId);
                                if (appt) {
                                  await appointmentApi.updateAppointmentStatus(appt.id, "CANCELLED");
                                }
                                await handleStatusUpdate(serving.id, "DONE");
                                toast.success("Patient ticket removed from queue.");
                              } catch (err) {
                                toast.error("Failed to cancel patient appointment.");
                              }
                            }}
                            className="px-3.5 py-2.5 rounded-lg bg-red-500/10 text-red-300 hover:text-white hover:bg-red-500 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center"
                            title="No Show / Cancel"
                          >
                            <UserX size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 flex-1 flex flex-col justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-white/20">
                    <UserCheck size={32} />
                  </div>
                  <p className="text-white/50 text-sm mb-6 font-medium">No patients are currently in the consultation rooms.</p>
                  <button
                    onClick={callNextInWaiting}
                    className="w-full h-12 rounded-xl bg-[#0EA5E9] text-white font-bold text-sm hover:bg-[#0284C7] transition-colors cursor-pointer shadow-lg flex items-center justify-center gap-2"
                  >
                    <Volume2 size={16} /> Call Next Waiting Patient
                  </button>
                </div>
              )}
            </div>

            <div className="xl:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] flex flex-col" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
              <div className="px-6 py-5 border-b border-[#E2E8F0] flex items-center justify-between">
                <h3 className="font-bold text-[#0F172A] flex items-center gap-2">
                  <Clock size={18} className="text-[#64748B]" /> Waiting Queue
                  <span className="text-xs bg-[#F1F5F9] text-[#475569] px-2.5 py-1 rounded-full ml-2">{waitingAndCalled.length}</span>
                </h3>
              </div>
              {waitingAndCalled.length === 0 ? (
                <div className="p-12 flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-[#F8FAFC] rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 size={32} className="text-[#CBD5E1]" />
                  </div>
                  <p className="text-[#64748B] font-medium">All checked-in patients have been served.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#F1F5F9] max-h-[500px] overflow-y-auto">
                  {waitingAndCalled.map((q, i) => {
                    const details = getAppointmentDetailsForQueue(q.appointmentId);
                    const isCalled = q.status === "CALLED";
                    return (
                      <div key={q.id} className={`flex items-center gap-4 px-6 py-4 transition-colors group ${isCalled ? 'bg-purple-50/50 hover:bg-purple-50/80' : 'hover:bg-[#F8FAFC]'}`}>
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                          isCalled ? 'bg-purple-100 border-purple-200 text-purple-700' : 'bg-[#F1F5F9] border-[#E2E8F0] text-[#1E3A5F] group-hover:bg-white group-hover:border-[#CBD5E1]'
                        }`}>
                          #{i + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-bold text-[#0F172A] text-sm">{details.patientName}</p>
                            {isCalled && <Badge variant="active" dot className="bg-purple-100 text-purple-700 border-none shadow-none text-[9px] py-0 px-1.5 h-4">CALLED</Badge>}
                          </div>
                          <p className="text-[11px] font-medium text-[#64748B] flex items-center gap-1.5">
                            <span className="text-[#0EA5E9]">Dr. {details.doctorName}</span>
                            <span className="text-[#CBD5E1]">•</span>
                            <Clock size={10} className="text-[#94A3B8]"/>
                            Check-in: {new Date(q.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="text-right px-5 border-r border-[#E2E8F0] mr-2">
                          <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-0.5">Ticket</p>
                          <p className={`text-lg font-black ${isCalled ? 'text-purple-600' : 'text-[#EA580C]'}`}>#{q.ticketNumber}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          {isCalled ? (
                            <button
                              onClick={() => handleStatusUpdate(q.id, "IN_ROOM")}
                              className="w-32 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold cursor-pointer hover:bg-purple-700 shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <UserCheck size={14} /> Confirm in Room
                            </button>
                          ) : (
                            <button
                              onClick={() => handleCall(q.id)}
                              className="w-32 py-2 rounded-lg bg-[#0EA5E9] text-white text-xs font-bold cursor-pointer hover:bg-[#0284C7] shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <Volume2 size={14} /> Call Patient
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              try {
                                const appt = allAppointments.find((a) => a.id === q.appointmentId);
                                if (appt) {
                                  await appointmentApi.updateAppointmentStatus(appt.id, "CANCELLED");
                                }
                                await handleStatusUpdate(q.id, "DONE");
                                toast.success("Patient ticket removed from queue.");
                              } catch (err) {
                                toast.error("Failed to cancel patient appointment.");
                              }
                            }}
                            className="w-32 py-2 rounded-lg border border-[#E2E8F0] bg-white text-xs font-semibold text-red-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <UserX size={14} /> Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
