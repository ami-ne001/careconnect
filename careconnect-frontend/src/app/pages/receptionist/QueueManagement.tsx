import { useState, useEffect } from "react";
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

  const serving = queue.find((q) => q.status === "CALLED");
  const waiting = queue.filter((q) => q.status === "WAITING");
  const served = queue.filter((q) => q.status === "COMPLETED").length;
  const noShows = queue.filter((q) => q.status === "NO_SHOW").length;

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
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 mb-6">
            {[
              { label: "Total Served Today", val: served, color: "text-[#10B981]" },
              { label: "Currently Waiting", val: waiting.length, color: "text-[#F59E0B]" },
              { label: "No Shows Today", val: noShows, color: "text-[#EF4444]" },
              { label: "Active Serving", val: serving ? "1" : "0", color: "text-[#0EA5E9]" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-4 border border-[#E2E8F0] text-center" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <p className="text-[10px] uppercase tracking-wider text-[#64748B] font-bold mb-1">{s.label}</p>
                <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="bg-[#1E3A5F] rounded-xl p-6 text-white" style={{ boxShadow: "0 4px 16px rgba(30,58,95,0.3)" }}>
              <p className="text-white/60 text-xs uppercase tracking-wider font-semibold mb-4">Now Calling / Serving</p>
              {serving ? (
                <>
                  <div className="text-center mb-5">
                    <div className="text-5xl font-black text-[#0EA5E9] mb-2">#{serving.ticketNumber}</div>
                    {(() => {
                      const details = getAppointmentDetailsForQueue(serving.appointmentId);
                      return (
                        <>
                          <p className="text-lg font-bold text-white">{details.patientName}</p>
                          <p className="text-white/60 text-xs mt-1">Consulting: Dr. {details.doctorName}</p>
                        </>
                      );
                    })()}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-white/10 rounded-xl p-3 text-center">
                      <p className="text-white/60 text-[10px]">Check-in Time</p>
                      <p className="text-white font-semibold text-xs mt-0.5">
                        {new Date(serving.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 text-center">
                      <p className="text-white/60 text-[10px]">Serving Status</p>
                      <p className="text-white font-semibold text-xs mt-0.5">{serving.status}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate(serving.id, "COMPLETED")}
                      className="flex-1 h-10 rounded-xl bg-[#10B981] text-white font-semibold text-xs hover:opacity-90 transition-all cursor-pointer"
                    >
                      Complete Visit
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(serving.id, "NO_SHOW")}
                      className="flex-1 h-10 rounded-xl bg-red-600 text-white font-semibold text-xs hover:opacity-90 transition-all cursor-pointer"
                    >
                      No Show
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-white/50 text-sm mb-4">No patients are currently being called.</p>
                  <button
                    onClick={callNextInWaiting}
                    className="w-full h-11 rounded-xl bg-[#0EA5E9] text-white font-bold text-xs hover:opacity-90 transition-all cursor-pointer"
                  >
                    📢 Call Next Waiting Patient
                  </button>
                </div>
              )}
            </div>

            <div className="xl:col-span-2 bg-white rounded-xl border border-[#E2E8F0]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
                <h3 className="font-semibold text-[#0F172A]">Waiting Queue ({waiting.length})</h3>
              </div>
              {waiting.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#64748B]">All checked-in patients have been served.</div>
              ) : (
                <div className="divide-y divide-[#F1F5F9] max-h-[400px] overflow-y-auto">
                  {waiting.map((q, i) => {
                    const details = getAppointmentDetailsForQueue(q.appointmentId);
                    return (
                      <div key={q.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#F8FAFC]">
                        <div className="w-8 h-8 rounded-full bg-[#F0F4F8] flex items-center justify-center text-xs font-bold text-[#1E3A5F] shrink-0">
                          #{i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-[#0F172A] text-xs">{details.patientName}</p>
                          <p className="text-[10px] text-[#64748B] mt-0.5">
                            Dr. {details.doctorName} · Check-in: {new Date(q.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-[#EA580C]">Ticket #{q.ticketNumber}</p>
                        </div>
                        <div className="flex gap-1.5 ml-2">
                          <button
                            onClick={() => handleCall(q.id)}
                            className="px-3 py-1.5 rounded-lg bg-[#0EA5E9] text-white text-xs font-semibold cursor-pointer hover:opacity-90"
                          >
                            Call
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(q.id, "NO_SHOW")}
                            className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            No Show
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
