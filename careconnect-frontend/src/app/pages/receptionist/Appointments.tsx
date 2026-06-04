import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { appointmentApi, adminApi } from "@/api";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";
import type { AppointmentResponse, DoctorAvailabilityResponse } from "@/api/appointment.api";
import type { AdminUser } from "@/types";

export function ReceptionistAppointments() {
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [patients, setPatients] = useState<AdminUser[]>([]);
  const [doctors, setDoctors] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Available Slots dynamic state
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [doctorAvailableDays, setDoctorAvailableDays] = useState<DoctorAvailabilityResponse[]>([]);

  // Filters
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState("All");

  // Booking Modal
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<AdminUser | null>(null);
  const [appointmentType, setAppointmentType] = useState("GENERAL_CHECKUP");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [room, setRoom] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const getPatientName = (patientId: number) => {
    const p = patients.find((pat) => pat.id === patientId);
    return p ? `${p.firstName} ${p.lastName}` : `Patient #${patientId}`;
  };

  const getDoctorName = (doctorId: number) => {
    const d = doctors.find((doc) => doc.id === doctorId);
    return d ? `${d.firstName} ${d.lastName}` : `Physician #${doctorId}`;
  };

  const loadData = () => {
    setLoading(true);
    Promise.all([
      appointmentApi.getAllAppointments(0, 100),
      adminApi.getUsers("PATIENT"),
      adminApi.getUsers("DOCTOR")
    ])
      .then(([{ data: apptsPage }, { data: patientsList }, { data: docs }]) => {
        setAppointments(apptsPage.content || []);
        setPatients(patientsList || []);
        setDoctors(docs || []);
      })
      .catch((err) => {
        console.error(err);
        toast.error(getApiErrorMessage(err, "Failed to load front desk records."));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch doctor's available days when doctor is selected
  useEffect(() => {
    if (selectedDoctor) {
      appointmentApi.getDoctorAvailability(selectedDoctor.id)
        .then(({ data }) => setDoctorAvailableDays(data || []))
        .catch(() => setDoctorAvailableDays([]));
    } else {
      setDoctorAvailableDays([]);
    }
  }, [selectedDoctor]);

  // Fetch available slots when doctor and date are selected
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      setLoadingSlots(true);
      appointmentApi.getAvailableSlots(selectedDoctor.id, selectedDate, 30)
        .then(({ data }) => {
          const slots = data.map((slot) => slot.startTime.substring(0, 5));
          setAvailableSlots(slots);
        })
        .catch((err) => {
          console.error("Failed to load available slots", err);
          setAvailableSlots([]);
          toast.error("Could not load available slots. The doctor may not have availability set for this day.");
        })
        .finally(() => setLoadingSlots(false));
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDoctor, selectedDate]);

  const handleBook = async () => {
    if (!selectedPatientId || !selectedDoctor || !selectedDate || !selectedTime) {
      toast.error("Please fill in all booking fields.");
      return;
    }
    setSubmitting(true);
    try {
      const scheduledAt = `${selectedDate}T${selectedTime}:00`;
      await appointmentApi.createAppointment({
        patientId: selectedPatientId,
        doctorId: selectedDoctor.id,
        scheduledAt,
        durationMinutes: 30,
        type: appointmentType,
        notes: notes.trim() || undefined,
        room: room.trim() || undefined,
      });

      toast.success("Appointment booked successfully!");
      setShowModal(false);
      // Reset form
      setSelectedPatientId(null);
      setSelectedDoctor(null);
      setAppointmentType("GENERAL_CHECKUP");
      setSelectedDate("");
      setSelectedTime("");
      setRoom("");
      setNotes("");
      setStep(1);
      loadData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to book appointment."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      await appointmentApi.cancelAppointment(id);
      toast.success("Appointment cancelled.");
      loadData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to cancel appointment."));
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await appointmentApi.updateAppointmentStatus(id, "SCHEDULED");
      toast.success("Appointment approved and scheduled.");
      loadData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to approve appointment."));
    }
  };

  const handleReject = async (id: number) => {
    if (!window.confirm("Reject this appointment request?")) return;
    try {
      await appointmentApi.cancelAppointment(id);
      toast.success("Appointment request rejected.");
      loadData();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to reject appointment."));
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ");
  };

  // Filtered Appointments
  const filteredAppointments = appointments.filter((a) => {
    if (selectedDoctorFilter === "All") return true;
    return getDoctorName(a.doctorId) === selectedDoctorFilter;
  });

  return (
    <div>
      <PageHeader
        title="Appointments"
        subtitle="View and manage all appointments"
        actions={
          <button
            onClick={() => {
              setShowModal(true);
              setStep(1);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium hover:opacity-90 cursor-pointer"
          >
            <Plus size={15} />New Appointment
          </button>
        }
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="animate-spin rounded-full h-8 w-8 border-4 border-[#1E3A5F] border-t-transparent" />
          <span className="text-sm text-[#64748B]">Loading scheduling records…</span>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex flex-wrap gap-3 items-center">
              <h3 className="font-semibold text-[#0F172A]">All Appointments</h3>
              <div className="flex gap-2 ml-auto overflow-x-auto">
                <button
                  onClick={() => setSelectedDoctorFilter("All")}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                    selectedDoctorFilter === "All"
                      ? "border-[#1E3A5F] bg-[#1E3A5F] text-white"
                      : "border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
                  }`}
                >
                  All Doctors
                </button>
                {doctors.map((d) => {
                  const docName = `${d.firstName} ${d.lastName}`;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDoctorFilter(docName)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                        selectedDoctorFilter === docName
                          ? "border-[#1E3A5F] bg-[#1E3A5F] text-white"
                          : "border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      Dr. {d.lastName}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    {["Date / Time", "Patient", "Doctor", "Room", "Type", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-[#64748B]">No appointments found.</td>
                    </tr>
                  ) : (
                    filteredAppointments.map((a, i) => {
                      const dt = new Date(a.scheduledAt);
                      const formattedDate = dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                      const formattedTime = dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

                      return (
                        <tr key={a.id} className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] ${i % 2 === 0 ? "" : "bg-[#FAFBFC]"}`}>
                          <td className="px-5 py-3.5 font-bold text-[#0F172A]">{formattedDate} - {formattedTime}</td>
                          <td className="px-5 py-3.5 font-semibold text-[#0F172A]">{getPatientName(a.patientId)}</td>
                          <td className="px-5 py-3.5 text-[#64748B]">Dr. {getDoctorName(a.doctorId)}</td>
                          <td className="px-5 py-3.5 text-[#64748B]">{a.room || "—"}</td>
                          <td className="px-5 py-3.5 text-[#64748B]">{a.type.replace("_", " ")}</td>
                          <td className="px-5 py-3.5">
                            <Badge
                              variant={
                                a.status === "COMPLETED" ? "completed"
                                : a.status === "CANCELLED" ? "inactive"
                                : a.status === "PENDING_APPROVAL" ? "pending"
                                : "active"
                              }
                              dot
                            >
                              {formatStatus(a.status)}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5">
                            {a.status === "PENDING_APPROVAL" ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleApprove(a.id)}
                                  className="px-3 py-1.5 rounded-lg bg-[#10B981] text-white text-xs font-semibold hover:bg-[#059669] cursor-pointer transition-colors"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(a.id)}
                                  className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : a.status !== "CANCELLED" && a.status !== "COMPLETED" ? (
                              <button
                                onClick={() => handleCancel(a.id)}
                                className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                              >
                                Cancel
                              </button>
                            ) : null}
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

      {/* New Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-[#0F172A]">New Appointment</h3>
                <p className="text-xs text-[#64748B]">Step {step} of 2</p>
              </div>
              <button className="cursor-pointer" onClick={() => setShowModal(false)}>
                <X size={18} className="text-[#64748B]" />
              </button>
            </div>
            <div className="flex gap-2 mb-5">
              {[1, 2].map((s) => (
                <div key={s} className={`flex-1 h-1.5 rounded-full ${step >= s ? "bg-[#0EA5E9]" : "bg-[#E2E8F0]"}`} />
              ))}
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Select Patient</label>
                  <select
                    value={selectedPatientId || ""}
                    onChange={(e) => setSelectedPatientId(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] bg-white"
                  >
                    <option value="">— Select Patient —</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName} (ID #{p.id} - {p.email || "—"})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Appointment Type</label>
                  <select
                    value={appointmentType}
                    onChange={(e) => setAppointmentType(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] bg-white"
                  >
                    <option value="GENERAL_CHECKUP">General Checkup</option>
                    <option value="FOLLOW_UP">Follow-up</option>
                    <option value="CONSULTATION">Consultation</option>
                    <option value="EMERGENCY">Emergency</option>
                    <option value="PROCEDURE">Procedure</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Assign Physician</label>
                  <select
                    value={selectedDoctor?.id || ""}
                    onChange={(e) => {
                      const doc = doctors.find((d) => d.id === Number(e.target.value));
                      setSelectedDoctor(doc || null);
                    }}
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] bg-white"
                  >
                    <option value="">— Select Doctor —</option>
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        Dr. {doc.firstName} {doc.lastName} ({doc.departmentName || "General Care"})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Consultation Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                  />
                  {selectedDoctor && doctorAvailableDays.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      <span className="text-xs text-[#94A3B8]">Available:</span>
                      {doctorAvailableDays.map((d) => (
                        <span key={d.id} className="text-xs bg-[#F0F9FF] text-[#0EA5E9] border border-[#BAE6FD] rounded px-1.5 py-0.5 font-semibold">
                          {d.dayOfWeek.charAt(0) + d.dayOfWeek.slice(1).toLowerCase()}
                        </span>
                      ))}
                    </div>
                  )}
                  {selectedDoctor && doctorAvailableDays.length === 0 && (
                    <p className="text-xs text-amber-500 mt-1.5">⚠ No availability set for this doctor yet.</p>
                  )}
                </div>
                <div className="flex gap-3 pt-3">
                  <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#64748B] cursor-pointer">Cancel</button>
                  <button
                    onClick={() => {
                      if (!selectedPatientId || !selectedDoctor || !selectedDate) {
                        toast.error("Please fill in patient, doctor, and date before moving to the next step.");
                        return;
                      }
                      setStep(2);
                    }}
                    className="flex-1 h-10 rounded-lg bg-[#1E3A5F] text-white text-xs font-bold cursor-pointer"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <p className="text-xs text-[#64748B] font-semibold uppercase tracking-wider mb-1.5">Select Time Slot — {selectedDate}</p>
                
                {loadingSlots ? (
                  <div className="flex justify-center items-center py-6 text-[#64748B] text-xs gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-[#1E3A5F] border-t-transparent" />
                    Checking doctor availability…
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-xs text-red-500 italic text-center py-4 bg-red-50 rounded-xl border border-red-100">
                    No available time slots found for this date.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-[180px] overflow-y-auto p-1 border border-[#E2E8F0] rounded-xl">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          selectedTime === slot
                            ? "border-[#0EA5E9] bg-[#EFF6FF] text-[#0EA5E9]"
                            : "border-[#E2E8F0] text-[#64748B] hover:border-[#0EA5E9]/50"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Room / Wing Assign</label>
                  <input
                    placeholder="e.g. Room 204"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Complaint Notes (Optional)</label>
                  <input
                    placeholder="Brief notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                  />
                </div>
                <div className="flex gap-3 pt-3">
                  <button onClick={() => setStep(1)} className="flex-1 h-10 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#64748B] cursor-pointer">← Back</button>
                  <button
                    onClick={handleBook}
                    disabled={submitting || !selectedTime}
                    className="flex-1 h-10 rounded-lg bg-[#1E3A5F] text-white text-xs font-bold cursor-pointer disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                  >
                    {submitting && <span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />}
                    Confirm Booking
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
