import { useState, useEffect } from "react";
import { Plus, X, Calendar as CalendarIcon, MapPin } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { appointmentApi, adminApi, patientApi } from "@/api";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";
import { useAuth } from "@/store/useAuth";
import type { AppointmentResponse } from "@/api/appointment.api";
import type { AdminUser, Department } from "@/types";

const steps = ["Choose Specialty", "Choose Doctor", "Choose Date", "Choose Time", "Confirm"];

export function PatientAppointments() {
  const { userId } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [showBook, setShowBook] = useState(false);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);

  // Dynamic slots state
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Lists for booking
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<AdminUser[]>([]);
  const [patientProfileId, setPatientProfileId] = useState<number | null>(null);

  // Selection states
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<AdminUser | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const getDoctorName = (doctorId: number) => {
    const doc = doctors.find((d) => d.id === doctorId);
    return doc ? `${doc.firstName} ${doc.lastName}` : "Physician";
  };

  const loadAppointments = () => {
    setLoading(true);
    appointmentApi.getMyAppointments()
      .then(({ data }) => {
        setAppointments(data);
      })
      .catch((err) => {
        toast.error(getApiErrorMessage(err, "Failed to load appointments."));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!userId) return;
    loadAppointments();

    // Fetch patient profile to get the medical patientId (rather than userId)
    patientApi.getProfileByUserId(userId)
      .then(({ data }) => {
        setPatientProfileId(data.id);
      })
      .catch((err) => {
        console.error("Failed to load patient profile ID", err);
      });

    // Pre-fetch specialties and doctors for booking flow
    Promise.all([
      adminApi.getDepartments(),
      adminApi.getUsers("DOCTOR"),
    ])
      .then(([{ data: depts }, { data: docs }]) => {
        setDepartments(depts || []);
        setDoctors(docs || []);
      })
      .catch((err) => {
        console.error("Failed to load specialty or doctor lists", err);
      });
  }, [userId]);

  // Fetch dynamic available slots
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
          setAvailableSlots(["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"]);
        })
        .finally(() => setLoadingSlots(false));
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDoctor, selectedDate]);

  const handleCancel = async (id: number) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await appointmentApi.cancelAppointment(id);
      toast.success("Appointment cancelled successfully.");
      loadAppointments();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to cancel appointment."));
    }
  };

  const handleBook = async () => {
    if (!userId || !selectedDoctor || !selectedDate || !selectedTime) {
      toast.error("Please fill in all booking fields.");
      return;
    }

    try {
      const scheduledAt = `${selectedDate}T${selectedTime}:00`;
      await appointmentApi.createAppointment({
        patientId: userId,
        doctorId: selectedDoctor.id,
        scheduledAt,
        durationMinutes: 30,
        type: "CONSULTATION",
        notes: notes.trim() || undefined,
        room: selectedDoctor.departmentName ? `${selectedDoctor.departmentName} Wing` : "General Clinic",
      });

      toast.success("Appointment booked successfully!");
      setShowBook(false);
      // Reset state
      setSelectedSpecialty("");
      setSelectedDoctor(null);
      setSelectedDate("");
      setSelectedTime("");
      setNotes("");
      setStep(0);
      loadAppointments();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to book appointment."));
    }
  };

  // Filter lists
  const filteredDoctors = doctors.filter(doc => 
    !selectedSpecialty || doc.departmentName === selectedSpecialty
  );

  const getDoctorInitials = (doc: AdminUser) => {
    return `${doc.firstName[0] || ""}${doc.lastName[0] || ""}`.toUpperCase();
  };

  // Filter appointments
  const upcoming = appointments.filter((a) =>
    ["SCHEDULED", "PENDING_APPROVAL", "CHECKED_IN", "IN_PROGRESS"].includes(a.status)
  );
  
  const past = appointments.filter((a) =>
    ["COMPLETED", "CANCELLED"].includes(a.status)
  );

  return (
    <div>
      <PageHeader
        title="My Appointments"
        subtitle="View and manage your appointments"
        actions={
          <button
            onClick={() => {
              if (!patientProfileId) {
                toast.error("You need a medical profile on file to book appointments. Please contact reception.");
                return;
              }
              setShowBook(true);
              setStep(0);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1E3A5F] text-white text-sm font-medium hover:opacity-90 cursor-pointer"
          >
            <Plus size={15} />Book New Appointment
          </button>
        }
      />

      <div className="flex gap-1 bg-white rounded-xl p-1.5 border border-[#E2E8F0] mb-5 w-fit" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        {["Upcoming", "Past"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === t ? "bg-[#1E3A5F] text-white" : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="animate-spin rounded-full h-8 w-8 border-4 border-[#1E3A5F] border-t-transparent" />
          <span className="text-sm text-[#64748B]">Loading appointments…</span>
        </div>
      ) : activeTab === "Upcoming" ? (
        upcoming.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center text-[#64748B]">
            No upcoming appointments scheduled.
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {upcoming.map((a) => {
              const dt = new Date(a.scheduledAt);
              const formattedDate = dt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
              const formattedTime = dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
              const docName = getDoctorName(a.doctorId);
              const initials = docName
                ? docName.split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase().slice(0, 2)
                : "DR";

              return (
                <div
                  key={a.id}
                  className={`bg-white rounded-xl border-2 p-5 border-[#E2E8F0]`}
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#1E3A5F] flex items-center justify-center text-white font-bold">
                        {initials}
                      </div>
                      <div>
                        <p className="font-bold text-[#0F172A]">Dr. {docName}</p>
                        <p className="text-xs text-[#64748B]">{a.room || "General Practice"}</p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        a.status === "SCHEDULED" || a.status === "IN_PROGRESS" ? "active"
                        : a.status === "PENDING_APPROVAL" ? "pending"
                        : "completed"
                      }
                    >
                      {a.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-[#64748B]">
                      <CalendarIcon size={14} className="text-[#0EA5E9]" />
                      <span className="font-medium text-[#0F172A]">{formattedDate}</span>
                      <span>at</span>
                      <span className="font-bold text-[#0EA5E9]">{formattedTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#64748B]">
                      <MapPin size={14} className="text-[#0EA5E9]" />
                      <span>{a.room || "Clinic"}</span>
                      <span>·</span>
                      <span>{a.type.replace("_", " ")}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {a.status === "PENDING_APPROVAL" ? (
                      <div className="flex-1 flex items-center gap-2 h-9 px-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium">
                        ⏳ Awaiting receptionist approval
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCancel(a.id)}
                        className="flex-1 h-9 rounded-xl bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 cursor-pointer transition-colors"
                      >
                        Cancel Appointment
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : past.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center text-[#64748B]">
          No past appointments on record.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  {["Date", "Doctor", "Visit Type", "Room / wing", "Status", "Notes"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wider text-[#64748B] font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {past.map((p) => {
                  const dt = new Date(p.scheduledAt);
                  const formattedDate = dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                  const formattedTime = dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

                  return (
                    <tr key={p.id} className="border-b border-[#F1F5F9] hover:bg-[#FAFBFC]">
                      <td className="px-5 py-3.5 text-[#64748B]">
                        {formattedDate} - {formattedTime}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-[#0F172A]">
                        Dr. {getDoctorName(p.doctorId)}
                      </td>
                      <td className="px-5 py-3.5 text-[#64748B]">
                        {p.type.replace("_", " ")}
                      </td>
                      <td className="px-5 py-3.5 text-[#64748B]">
                        {p.room || "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={p.status === "COMPLETED" ? "active" : "inactive"}>
                          {p.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-[#64748B] max-w-xs truncate">
                        {p.notes || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Book Modal */}
      {showBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-[#0F172A]">Book Appointment</h3>
                <p className="text-xs text-[#64748B]">Step {step + 1} of {steps.length}: {steps[step]}</p>
              </div>
              <button className="cursor-pointer" onClick={() => setShowBook(false)}>
                <X size={18} className="text-[#64748B]" />
              </button>
            </div>
            <div className="flex gap-1 mb-5">
              {steps.map((_, i) => (
                <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i <= step ? "bg-[#0EA5E9]" : "bg-[#E2E8F0]"}`} />
              ))}
            </div>
            <div className="min-h-[220px] flex flex-col justify-between">
              <div>
                {step === 0 && (
                  <div className="space-y-4">
                    <p className="text-xs text-[#64748B] font-medium">Select a department for your consultation:</p>
                    <div className="grid grid-cols-2 gap-3">
                      {departments.map((dept) => (
                        <button
                          key={dept.id}
                          onClick={() => {
                            setSelectedSpecialty(dept.name);
                            setStep(1);
                          }}
                          className="p-4 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#0F172A] hover:border-[#0EA5E9] hover:bg-[#EFF6FF] transition-all text-center cursor-pointer"
                        >
                          {dept.name}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setSelectedSpecialty("");
                          setStep(1);
                        }}
                        className="p-4 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#0F172A] hover:border-[#0EA5E9] hover:bg-[#EFF6FF] transition-all text-center cursor-pointer col-span-2"
                      >
                        All Departments
                      </button>
                    </div>
                  </div>
                )}
                {step === 1 && (
                  <div className="space-y-3">
                    <p className="text-xs text-[#64748B] font-medium">Select a physician:</p>
                    {filteredDoctors.length === 0 ? (
                      <p className="text-sm text-[#94A3B8] italic text-center py-4">No doctors found in this department.</p>
                    ) : (
                      <div className="max-h-[250px] overflow-y-auto space-y-2">
                        {filteredDoctors.map((doc) => (
                          <button
                            key={doc.id}
                            onClick={() => {
                              setSelectedDoctor(doc);
                              setStep(2);
                            }}
                            className="w-full p-3 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] hover:border-[#0EA5E9] hover:bg-[#EFF6FF] text-left transition-all cursor-pointer flex items-center gap-3"
                          >
                            <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#0EA5E9] flex items-center justify-center font-semibold text-xs">
                              {getDoctorInitials(doc)}
                            </div>
                            <div>
                              <p className="font-semibold text-xs">Dr. {doc.firstName} {doc.lastName}</p>
                              <p className="text-[10px] text-[#64748B]">{doc.departmentName || "General Wing"}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {step === 2 && (
                  <div className="space-y-3">
                    <p className="text-xs text-[#64748B] font-medium">Select date for consultation:</p>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setStep(3);
                      }}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                    />
                  </div>
                )}
                {step === 3 && (
                  <div className="space-y-3">
                    <p className="text-xs text-[#64748B] font-medium">Select available slot on {selectedDate}:</p>
                    
                    {loadingSlots ? (
                      <div className="flex justify-center items-center py-6 text-[#64748B] text-xs gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-[#1E3A5F] border-t-transparent" />
                        Checking doctor availability…
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <p className="text-xs text-red-500 italic text-center py-4 bg-red-50 rounded-xl border border-red-100">
                        No available slots found for this date.
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 max-h-[180px] overflow-y-auto p-1 border border-[#E2E8F0] rounded-xl">
                        {availableSlots.map((t) => (
                          <button
                            key={t}
                            onClick={() => {
                              setSelectedTime(t);
                              setStep(4);
                            }}
                            className={`p-3 rounded-xl border text-center text-xs font-semibold cursor-pointer transition-all ${
                              selectedTime === t
                                ? "bg-[#0EA5E9] border-[#0EA5E9] text-white"
                                : "border-[#E2E8F0] hover:border-[#0EA5E9] hover:bg-[#EFF6FF]"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {step === 4 && (
                  <div className="space-y-4">
                    <div className="bg-[#F8FAFC] rounded-xl p-4 space-y-2.5 text-xs border border-[#E2E8F0]">
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Physician:</span>
                        <span className="font-semibold text-[#0F172A]">Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Department:</span>
                        <span className="font-semibold text-[#0F172A]">{selectedDoctor?.departmentName || "General Care"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Date:</span>
                        <span className="font-semibold text-[#0F172A]">{selectedDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Time Slot:</span>
                        <span className="font-semibold text-[#0EA5E9]">{selectedTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Duration:</span>
                        <span className="font-semibold text-[#0F172A]">30 Minutes</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                        Chief Complaint / Notes (Optional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Why are you booking this appointment?"
                        className="w-full h-20 p-3 rounded-lg border border-[#E2E8F0] text-xs focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] resize-none"
                      />
                    </div>
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                      <span className="mt-0.5">⏳</span>
                      <p>Your request will be sent to the receptionist for approval. You'll see it as <strong>Pending Approval</strong> until confirmed.</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                {step > 0 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="flex-1 h-10 rounded-lg border border-[#E2E8F0] text-xs font-semibold text-[#64748B] hover:bg-[#F8FAFC] cursor-pointer"
                  >
                    ← Back
                  </button>
                )}
                {step === 4 && (
                  <button
                    onClick={handleBook}
                    className="flex-1 h-10 rounded-lg bg-[#1E3A5F] text-white text-xs font-bold hover:opacity-90 cursor-pointer transition-colors"
                  >
                    Send Request
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
