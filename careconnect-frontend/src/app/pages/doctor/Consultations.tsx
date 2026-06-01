import { useState, useEffect, useRef } from "react";
import { Stethoscope, FlaskConical, Pill, CheckCircle, RefreshCw, Plus, X, ChevronDown } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { appointmentApi, receptionistApi } from "@/api";
import { clinicalApi } from "@/api/clinical.api";
import { useAuth } from "@/store/useAuth";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";
import type { AppointmentResponse, QueueResponse } from "@/api/appointment.api";
import type {
  ConsultationResponse,
  VitalsCreateRequest,
  PrescriptionItemDto,
} from "@/api/clinical.api";

const SYMPTOM_CHIPS = [
  "Headache", "Fatigue", "Chest Pain", "Shortness of Breath",
  "Dizziness", "Nausea", "Fever", "Cough", "Back Pain", "Joint Pain",
  "Abdominal Pain", "Sore Throat", "Vomiting", "Palpitations",
];

export function DoctorConsultations() {
  const { userId } = useAuth();

  // ── Queue state ────────────────────────────────────────────────
  const [queue, setQueue] = useState<QueueResponse[]>([]);
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [patients, setPatients] = useState<Record<number, string>>({});
  const [loadingQueue, setLoadingQueue] = useState(true);

  // ── Active selection ───────────────────────────────────────────
  const [activeQueue, setActiveQueue] = useState<QueueResponse | null>(null);
  const [activeAppt, setActiveAppt] = useState<AppointmentResponse | null>(null);
  const [consultation, setConsultation] = useState<ConsultationResponse | null>(null);
  const [startingConsultation, setStartingConsultation] = useState(false);

  // ── Consultation form ─────────────────────────────────────────
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState(false);

  // ── Vitals form ───────────────────────────────────────────────
  const [showVitals, setShowVitals] = useState(false);
  const [vitals, setVitals] = useState<{
    bpSystolic: string; bpDiastolic: string; heartRate: string;
    temperature: string; oxygenSat: string; weightKg: string;
  }>({ bpSystolic: "", bpDiastolic: "", heartRate: "", temperature: "", oxygenSat: "", weightKg: "" });
  const [savingVitals, setSavingVitals] = useState(false);

  // ── Prescription form ─────────────────────────────────────────
  const [showRx, setShowRx] = useState(false);
  const [rxItems, setRxItems] = useState<PrescriptionItemDto[]>([
    { medication: "", dosage: "", frequency: "", durationDays: 7, quantity: 1, instructions: "" },
  ]);
  const [rxNotes, setRxNotes] = useState("");
  const [savingRx, setSavingRx] = useState(false);

  // ── Load today's queue ────────────────────────────────────────
  const loadQueue = () => {
    setLoadingQueue(true);
    Promise.all([
      appointmentApi.getTodayQueue(),
      appointmentApi.getAppointmentsByDoctor(userId!),
    ])
      .then(([{ data: q }, { data: appts }]) => {
        // Only show queue entries that belong to this doctor
        const myApptIds = new Set((appts || []).map((a) => a.id));
        const myQueue = (q || []).filter(
          (qe) => myApptIds.has(qe.appointmentId) && qe.status !== "COMPLETED"
        );
        setQueue(myQueue);
        setAppointments(appts || []);
      })
      .catch((err) => toast.error(getApiErrorMessage(err, "Failed to load queue.")))
      .finally(() => setLoadingQueue(false));

    // Load patient names through patient profiles endpoint (accessible to DOCTOR)
    receptionistApi.getPatientsList(0, 1000)
      .then(({ data }) => {
        const map: Record<number, string> = {};
        (data.content || []).forEach((p) => {
          if (p.userId) {
            map[p.userId] = `${p.firstName || ""} ${p.lastName || ""}`.trim() || `Patient #${p.userId}`;
          }
        });
        setPatients(map);
      })
      .catch((err) => {
        console.warn("Failed to fetch patients:", err);
      });
  };

  const getPatientName = (patientId: number) =>
    patients[patientId] ?? `Patient #${patientId}`;

  useEffect(() => {
    if (userId) loadQueue();
  }, [userId]);

  // ── Select a queue entry ───────────────────────────────────────
  const selectQueueEntry = async (qe: QueueResponse) => {
    setActiveQueue(qe);
    setConsultation(null);
    setSymptoms([]);
    setDiagnosis("");
    setClinicalNotes("");
    setShowVitals(false);
    setShowRx(false);

    const appt = appointments.find((a) => a.id === qe.appointmentId) || null;
    setActiveAppt(appt);

    // Check if consultation already exists for this appointment
    if (appt) {
      try {
        const { data: consults } = await clinicalApi.getConsultationsByPatient(appt.patientId);
        const existing = consults.find((c) => c.appointmentId === appt.id && c.status === "OPEN");
        if (existing) {
          setConsultation(existing);
          setSymptoms(existing.symptoms ? existing.symptoms.split(", ") : []);
          setDiagnosis(existing.diagnosis || "");
          setClinicalNotes(existing.clinicalNotes || "");
        }
      } catch {
        // No existing consultation — that's fine
      }
    }
  };

  // ── Start consultation ─────────────────────────────────────────
  const startConsultation = async () => {
    if (!activeAppt || !userId) return;
    setStartingConsultation(true);
    try {
      // Update appointment to IN_PROGRESS
      await appointmentApi.updateAppointmentStatus(activeAppt.id, "IN_PROGRESS");

      // Create consultation record
      const { data } = await clinicalApi.createConsultation({
        appointmentId: activeAppt.id,
        patientId: activeAppt.patientId,
        doctorId: userId,
      });
      setConsultation(data);
      toast.success("Consultation started.");
      loadQueue();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to start consultation."));
    } finally {
      setStartingConsultation(false);
    }
  };

  // ── Auto-save consultation notes ───────────────────────────────
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleSave = (s: string[], d: string, n: string) => {
    if (!consultation) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const { data } = await clinicalApi.updateConsultation(consultation.id, {
          symptoms: s.join(", "),
          diagnosis: d,
          clinicalNotes: n,
        });
        setConsultation(data);
      } catch {
        // Silent fail on auto-save
      }
    }, 1200);
  };

  const handleSymptomsChange = (newSymptoms: string[]) => {
    setSymptoms(newSymptoms);
    scheduleSave(newSymptoms, diagnosis, clinicalNotes);
  };

  const handleDiagnosisChange = (val: string) => {
    setDiagnosis(val);
    scheduleSave(symptoms, val, clinicalNotes);
  };

  const handleNotesChange = (val: string) => {
    setClinicalNotes(val);
    scheduleSave(symptoms, diagnosis, val);
  };

  // ── Save & Close consultation ──────────────────────────────────
  const closeConsultation = async () => {
    if (!consultation || !activeAppt || !userId) return;

    // Validate prescription if any medication is typed
    const hasMedication = rxItems.some((it) => it.medication.trim());
    if (hasMedication) {
      const valid = rxItems.every(
        (it) => it.medication.trim() && it.dosage.trim() && it.frequency.trim()
      );
      if (!valid) {
        toast.error("Please fill in medication name, dosage, and frequency for all prescribed items.");
        return;
      }
    }

    setClosing(true);
    try {
      // 1. Save Vitals if any values are entered
      const hasVitals = Object.values(vitals).some((v) => v.trim() !== "");
      if (hasVitals) {
        const req: VitalsCreateRequest = {
          patientId: activeAppt.patientId,
          consultationId: consultation.id,
          bpSystolic: vitals.bpSystolic ? parseInt(vitals.bpSystolic) : undefined,
          bpDiastolic: vitals.bpDiastolic ? parseInt(vitals.bpDiastolic) : undefined,
          heartRate: vitals.heartRate ? parseInt(vitals.heartRate) : undefined,
          temperature: vitals.temperature ? parseFloat(vitals.temperature) : undefined,
          oxygenSat: vitals.oxygenSat ? parseFloat(vitals.oxygenSat) : undefined,
          weightKg: vitals.weightKg ? parseFloat(vitals.weightKg) : undefined,
        };
        await clinicalApi.recordVitals(req);
      }

      // 2. Save Prescription if medications are specified
      if (hasMedication) {
        await clinicalApi.createPrescription({
          consultationId: consultation.id,
          patientId: activeAppt.patientId,
          notes: rxNotes,
          items: rxItems.map((it) => ({
            ...it,
            quantity: it.quantity || 1, // ensure quantity is specified
          })),
        });
      }

      // 3. Update Consultation (symptoms, diagnosis, clinical notes, and close it)
      await clinicalApi.updateConsultation(consultation.id, {
        symptoms: symptoms.join(", "),
        diagnosis,
        clinicalNotes,
        status: "CLOSED",
      });

      // 4. Update appointment status to completed
      await appointmentApi.updateAppointmentStatus(activeAppt.id, "COMPLETED");

      toast.success("Consultation saved and marked as completed successfully.");

      // Reset workspace
      setActiveQueue(null);
      setActiveAppt(null);
      setConsultation(null);
      setVitals({ bpSystolic: "", bpDiastolic: "", heartRate: "", temperature: "", oxygenSat: "", weightKg: "" });
      setRxItems([{ medication: "", dosage: "", frequency: "", durationDays: 7, quantity: 1, instructions: "" }]);
      setRxNotes("");
      loadQueue();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to complete consultation."));
    } finally {
      setClosing(false);
    }
  };

  const toggleSymptom = (s: string) => {
    const next = symptoms.includes(s)
      ? symptoms.filter((x) => x !== s)
      : [...symptoms, s];
    handleSymptomsChange(next);
  };

  const addCustomSymptom = () => {
    if (!customSymptom.trim()) return;
    handleSymptomsChange([...symptoms, customSymptom.trim()]);
    setCustomSymptom("");
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader title="Consultations" subtitle="Today's active consultation workspace" />

      <div className="flex gap-5" style={{ minHeight: 600 }}>
        {/* ── Left: Queue ───────────────────────────────────────── */}
        <div className="w-72 shrink-0 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-[#64748B]">
              Today's Queue
            </h3>
            <button
              onClick={loadQueue}
              className="text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              title="Refresh queue"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {loadingQueue ? (
            <div className="flex items-center justify-center py-10">
              <span className="animate-spin rounded-full h-6 w-6 border-3 border-[#1E3A5F] border-t-transparent" />
            </div>
          ) : queue.length === 0 ? (
            <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] text-center text-sm text-[#94A3B8]">
              No patients in queue right now.
            </div>
          ) : (
            queue.map((qe) => {
              const appt = appointments.find((a) => a.id === qe.appointmentId);
              const isActive = activeQueue?.id === qe.id;
              return (
                <button
                  key={qe.id}
                  onClick={() => selectQueueEntry(qe)}
                  className={`w-full text-left bg-white rounded-xl p-4 border-2 cursor-pointer transition-all ${
                    isActive
                      ? "border-[#0EA5E9] shadow-md"
                      : "border-[#E2E8F0] hover:border-[#0EA5E9]/40"
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-9 h-9 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {appt ? getPatientName(appt.patientId).split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0F172A] truncate">
                        {appt ? getPatientName(appt.patientId) : "—"}
                      </p>
                      <p className="text-xs text-[#64748B] truncate">
                        {appt ? String(appt.type).replace(/_/g, " ") : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#F59E0B] font-medium">
                      Ticket #{qe.ticketNumber}
                    </span>
                    {isActive ? (
                      <Badge variant="active" dot>Active</Badge>
                    ) : (
                      <Badge variant="pending" dot>{qe.status}</Badge>
                    )}
                  </div>
                  {appt?.room && (
                    <p className="text-xs text-[#94A3B8] mt-1">Room: {appt.room}</p>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* ── Right: Workspace ──────────────────────────────────── */}
        <div
          className="flex-1 bg-white rounded-xl border border-[#E2E8F0] flex flex-col overflow-hidden"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
        >
          {!activeAppt ? (
            // Empty state
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10 gap-3">
              <div className="w-16 h-16 rounded-2xl bg-[#F0F9FF] flex items-center justify-center">
                <Stethoscope size={28} className="text-[#0EA5E9]" />
              </div>
              <h3 className="font-bold text-[#0F172A]">No patient selected</h3>
              <p className="text-sm text-[#64748B] max-w-xs">
                Select a patient from the queue on the left to begin a consultation.
              </p>
            </div>
          ) : (
            <>
              {/* ── Patient info bar ─────────────────────────────── */}
              <div className="px-5 py-3.5 bg-[#1E3A5F] text-white flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#0EA5E9] flex items-center justify-center text-white text-sm font-bold">
                    {getPatientName(activeAppt.patientId).split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{getPatientName(activeAppt.patientId)}</p>
                    <p className="text-white/60 text-xs">
                      {String(activeAppt.type).replace(/_/g, " ")} ·{" "}
                      {new Date(activeAppt.scheduledAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {activeAppt.room ? ` · ${activeAppt.room}` : ""}
                    </p>
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  {consultation && (
                    <span className="text-xs text-white/50">
                      Consultation #{consultation.id}
                    </span>
                  )}
                  {consultation ? (
                    <Badge variant="active" dot>OPEN</Badge>
                  ) : (
                    <Badge variant="pending" dot>Not started</Badge>
                  )}
                </div>
              </div>

              {/* ── Start button (if no consultation yet) ──────── */}
              {!consultation && (
                <div className="flex items-center justify-center py-8 border-b border-[#E2E8F0]">
                  <button
                    onClick={startConsultation}
                    disabled={startingConsultation}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0EA5E9] text-white font-bold text-sm hover:opacity-90 disabled:opacity-60 cursor-pointer transition-colors"
                  >
                    {startingConsultation ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <Stethoscope size={16} />
                    )}
                    Start Consultation
                  </button>
                </div>
              )}

              {/* ── Consultation workspace ──────────────────────── */}
              {consultation && (
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                  {/* Symptoms */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-3">
                      Symptoms
                    </h4>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {SYMPTOM_CHIPS.map((s) => (
                        <button
                          key={s}
                          onClick={() => toggleSymptom(s)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                            symptoms.includes(s)
                              ? "bg-[#0EA5E9] text-white"
                              : "bg-[#F0F4F8] text-[#64748B] hover:bg-[#E2E8F0]"
                          }`}
                        >
                          {symptoms.includes(s) && <span className="mr-1">✓</span>}
                          {s}
                        </button>
                      ))}
                    </div>
                    {/* Custom symptom */}
                    <div className="flex gap-2">
                      <input
                        value={customSymptom}
                        onChange={(e) => setCustomSymptom(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addCustomSymptom()}
                        placeholder="Add custom symptom…"
                        className="flex-1 h-9 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                      />
                      <button
                        onClick={addCustomSymptom}
                        className="px-3 h-9 rounded-lg bg-[#1E3A5F] text-white text-xs font-semibold cursor-pointer hover:opacity-90"
                      >
                        Add
                      </button>
                    </div>
                    {/* Selected custom symptoms */}
                    {symptoms.filter((s) => !SYMPTOM_CHIPS.includes(s)).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {symptoms
                          .filter((s) => !SYMPTOM_CHIPS.includes(s))
                          .map((s) => (
                            <span
                              key={s}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-[#1E3A5F] text-white"
                            >
                              {s}
                              <button
                                onClick={() => handleSymptomsChange(symptoms.filter((x) => x !== s))}
                                className="cursor-pointer"
                              >
                                <X size={10} />
                              </button>
                            </span>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Diagnosis */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-3">
                      Diagnosis / ICD-10
                    </h4>
                    <input
                      value={diagnosis}
                      onChange={(e) => handleDiagnosisChange(e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-[#E2E8F0] text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                      placeholder="e.g. E11.9 — Type 2 Diabetes Mellitus"
                    />
                  </div>

                  {/* Clinical Notes */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-3">
                      Clinical Notes
                    </h4>
                    <textarea
                      value={clinicalNotes}
                      onChange={(e) => handleNotesChange(e.target.value)}
                      rows={5}
                      className="w-full px-3 py-3 rounded-lg border border-[#E2E8F0] text-sm text-[#0F172A] resize-none focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                      placeholder="Observations, findings, plan of care…"
                    />
                    <p className="text-xs text-[#94A3B8] mt-1">Auto-saved as you type.</p>
                  </div>

                  {/* ── Vitals Panel ──────────────────────────── */}
                  <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
                    <button
                      onClick={() => setShowVitals(!showVitals)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-[#F8FAFC] text-sm font-semibold text-[#0F172A] cursor-pointer hover:bg-[#F0F4F8] transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <FlaskConical size={16} className="text-[#0EA5E9]" />
                        Record Vitals
                      </span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${showVitals ? "rotate-180" : ""}`}
                      />
                    </button>
                    {showVitals && (
                      <div className="p-4 space-y-3">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {[
                            { label: "BP Systolic", key: "bpSystolic", ph: "e.g. 120" },
                            { label: "BP Diastolic", key: "bpDiastolic", ph: "e.g. 80" },
                            { label: "Heart Rate (bpm)", key: "heartRate", ph: "e.g. 72" },
                            { label: "Temp (°C)", key: "temperature", ph: "e.g. 37.0" },
                            { label: "O₂ Sat (%)", key: "oxygenSat", ph: "e.g. 98" },
                            { label: "Weight (kg)", key: "weightKg", ph: "e.g. 75" },
                          ].map((f) => (
                            <div key={f.key}>
                              <label className="block text-xs text-[#64748B] mb-1">{f.label}</label>
                              <input
                                value={vitals[f.key as keyof typeof vitals]}
                                onChange={(e) =>
                                  setVitals((prev) => ({ ...prev, [f.key]: e.target.value }))
                                }
                                placeholder={f.ph}
                                className="w-full h-9 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                              />
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-[#94A3B8] italic">Vitals will be saved when you complete the consultation.</p>
                      </div>
                    )}
                  </div>

                  {/* ── Prescription Panel ────────────────────── */}
                  <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
                    <button
                      onClick={() => setShowRx(!showRx)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-[#F8FAFC] text-sm font-semibold text-[#0F172A] cursor-pointer hover:bg-[#F0F4F8] transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Pill size={16} className="text-[#10B981]" />
                        Write Prescription
                      </span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${showRx ? "rotate-180" : ""}`}
                      />
                    </button>
                    {showRx && (
                      <div className="p-4 space-y-3">
                        {rxItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="relative border border-[#E2E8F0] rounded-xl p-3 space-y-2"
                          >
                            {rxItems.length > 1 && (
                              <button
                                onClick={() => setRxItems((prev) => prev.filter((_, i) => i !== idx))}
                                className="absolute top-2 right-2 text-[#94A3B8] hover:text-red-500 cursor-pointer"
                              >
                                <X size={14} />
                              </button>
                            )}
                            <p className="text-xs font-semibold text-[#64748B]">
                              Medication {idx + 1}
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                value={item.medication}
                                onChange={(e) =>
                                  setRxItems((prev) =>
                                    prev.map((it, i) =>
                                      i === idx ? { ...it, medication: e.target.value } : it
                                    )
                                  )
                                }
                                placeholder="Medication name *"
                                className="col-span-2 h-9 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                              />
                              <input
                                value={item.dosage}
                                onChange={(e) =>
                                  setRxItems((prev) =>
                                    prev.map((it, i) =>
                                      i === idx ? { ...it, dosage: e.target.value } : it
                                    )
                                  )
                                }
                                placeholder="Dosage *"
                                className="h-9 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                              />
                              <input
                                value={item.frequency}
                                onChange={(e) =>
                                  setRxItems((prev) =>
                                    prev.map((it, i) =>
                                      i === idx ? { ...it, frequency: e.target.value } : it
                                    )
                                  )
                                }
                                placeholder="Frequency *"
                                className="h-9 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                              />
                              <input
                                type="number"
                                value={item.durationDays}
                                onChange={(e) =>
                                  setRxItems((prev) =>
                                    prev.map((it, i) =>
                                      i === idx
                                        ? { ...it, durationDays: parseInt(e.target.value) || 1 }
                                        : it
                                    )
                                  )
                                }
                                placeholder="Duration (days)"
                                min={1}
                                className="h-9 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                              />
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  setRxItems((prev) =>
                                    prev.map((it, i) =>
                                      i === idx
                                        ? { ...it, quantity: parseInt(e.target.value) || 1 }
                                        : it
                                    )
                                  )
                                }
                                placeholder="Quantity *"
                                min={1}
                                className="h-9 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                              />
                              <input
                                value={item.instructions || ""}
                                onChange={(e) =>
                                  setRxItems((prev) =>
                                    prev.map((it, i) =>
                                      i === idx ? { ...it, instructions: e.target.value } : it
                                    )
                                  )
                                }
                                placeholder="Instructions (optional)"
                                className="col-span-2 h-9 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                              />
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() =>
                            setRxItems((prev) => [
                              ...prev,
                              { medication: "", dosage: "", frequency: "", durationDays: 7, quantity: 1 },
                            ])
                          }
                          className="flex items-center gap-1 text-xs text-[#0EA5E9] font-semibold cursor-pointer hover:opacity-80"
                        >
                          <Plus size={13} /> Add another medication
                        </button>
                        <input
                          value={rxNotes}
                          onChange={(e) => setRxNotes(e.target.value)}
                          placeholder="Prescription notes (optional)"
                          className="w-full h-9 px-3 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                        />
                        <p className="text-xs text-[#94A3B8] italic">Prescription will be submitted when you complete the consultation.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Bottom actions ───────────────────────────── */}
              {consultation && (
                <div className="px-5 py-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex flex-wrap gap-3 items-center">
                  <p className="text-xs text-[#94A3B8] flex-1">
                    Started{" "}
                    {new Date(consultation.startedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <button
                    onClick={closeConsultation}
                    disabled={closing}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#EF4444] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 cursor-pointer transition-colors"
                  >
                    {closing ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <CheckCircle size={14} />
                    )}
                    Close Consultation
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
