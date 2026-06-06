import { useState, useEffect, useRef } from "react";
import { Stethoscope, FlaskConical, Pill, CheckCircle, RefreshCw, Plus, X, ChevronDown, TestTube, AlertTriangle, BedDouble, Scissors, UserCheck, ClipboardList } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { appointmentApi, receptionistApi } from "@/api";
import { adminApi } from "@/api/admin.api";
import { clinicalApi } from "@/api/clinical.api";
import { labApi } from "@/api/lab.api";
import { billingApi } from "@/api/billing.api";
import { useAuth } from "@/store/useAuth";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";
import type { AppointmentResponse, QueueResponse } from "@/api/appointment.api";
import type { RoomResponse, WardResponse, AdmissionCreateRequest } from "@/api/receptionist.api";
import type { AdminUser } from "@/types";
import type {
  ConsultationResponse,
  VitalsCreateRequest,
  PrescriptionItemDto,
  SurgeryCreateRequest,
  CareTaskCreateRequest,
  OperatingRoomResponse,
} from "@/api/clinical.api";
import type { LabTestTypeResponse, LabRequestResponse } from "@/api/lab.api";

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

  // ── Lab Tests ─────────────────────────────────────────────────
  const [showLab, setShowLab] = useState(false);
  const [testTypes, setTestTypes] = useState<LabTestTypeResponse[]>([]);
  const [labRequests, setLabRequests] = useState<LabRequestResponse[]>([]);
  const [selectedTestTypeId, setSelectedTestTypeId] = useState<number | "">("");
  const [labPriority, setLabPriority] = useState<"NORMAL" | "URGENT" | "CRITICAL">("NORMAL");
  const [submittingLab, setSubmittingLab] = useState(false);

  // ── Admit Patient ─────────────────────────────────────────────
  const [showAdmit, setShowAdmit] = useState(false);
  const [wards, setWards] = useState<WardResponse[]>([]);
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [admitForm, setAdmitForm] = useState({ roomId: "", bedNumber: "1", admissionReason: "", diagnosis: "" });
  const [submittingAdmit, setSubmittingAdmit] = useState(false);
  const [admitDone, setAdmitDone] = useState(false);

  // ── Schedule Surgery ──────────────────────────────────────────
  const [showSurgery, setShowSurgery] = useState(false);
  const [operatingRooms, setOperatingRooms] = useState<OperatingRoomResponse[]>([]);
  const [surgeryForm, setSurgeryForm] = useState({
    surgeryType: "", operatingRoomId: "", scheduledAt: "", estimatedDuration: "60",
    priority: "ELECTIVE", preOpNotes: "",
  });
  const [submittingSurgery, setSubmittingSurgery] = useState(false);
  const [surgeryDone, setSurgeryDone] = useState(false);

  // ── Assign Nurse / Care Tasks ─────────────────────────────────
  const [showCare, setShowCare] = useState(false);
  const [nurses, setNurses] = useState<AdminUser[]>([]);
  const [selectedNurseId, setSelectedNurseId] = useState<number | "">("");
  const [careTasks, setCareTasks] = useState<{ title: string; description: string; priority: string }[]>([]);
  const [submittingCare, setSubmittingCare] = useState(false);
  const [careTasksDone, setCareTasksDone] = useState<{ title: string; nurseId: number }[]>([]);

  // ── Load lab test types once ──────────────────────────────────
  useEffect(() => {
    labApi.getAllTestTypes()
      .then(({ data }) => setTestTypes(data || []))
      .catch(() => { /* silent */ });
  }, []);

  // ── Load wards / rooms / operating rooms / nurses once ────────
  useEffect(() => {
    receptionistApi.getWards().then(({ data }) => setWards(data || [])).catch(() => {});
    receptionistApi.getAvailableRooms().then(({ data }) => setRooms(data || [])).catch(() => {});
    clinicalApi.getOperatingRooms().then(({ data }) => setOperatingRooms(data || [])).catch(() => {});
    adminApi.getUsers("NURSE" as any).then(({ data }) => setNurses((data || []).filter(n => n.isActive))).catch(() => {});
  }, []);

  // ── Load existing lab requests for a consultation ─────────────
  const loadLabRequests = (consultationId: number) => {
    labApi.getLabRequestsByConsultation(consultationId)
      .then(({ data }) => setLabRequests(data || []))
      .catch(() => { /* silent */ });
  };

  // ── Submit a single lab request ───────────────────────────────
  const submitLabRequest = async () => {
    if (!consultation || !activeAppt || !userId) return;
    if (!selectedTestTypeId) {
      toast.error("Please select a test type.");
      return;
    }
    setSubmittingLab(true);
    try {
      const { data } = await labApi.createLabRequest({
        consultationId: consultation.id,
        patientId: activeAppt.patientId,
        doctorId: userId,
        testTypeId: Number(selectedTestTypeId),
        priority: labPriority,
      });
      setLabRequests((prev) => [...prev, data]);

      // ── Bill the lab test fee ───────────────────────────────────────
      const testTypeName = testTypes.find((t) => t.id === Number(selectedTestTypeId))?.name ?? "Lab Test";
      try {
        const { data: patientInvoices } = await billingApi.getInvoicesByPatient(activeAppt.patientId);
        const openInvoice = patientInvoices.find(
          (inv) =>
            inv.consultationId === consultation.id &&
            inv.status !== "PAID" &&
            inv.status !== "CANCELLED"
        );
        if (openInvoice) {
          await billingApi.addItemToInvoice(openInvoice.id, {
            description: `Lab Test: ${testTypeName}`,
            quantity: 1,
            unitPrice: 35,
          });
        } else {
          const { data: newInv } = await billingApi.createInvoice({
            patientId: activeAppt.patientId,
            consultationId: consultation.id,
            notes: `Lab charges for consultation #${consultation.id}`,
          });
          await billingApi.addItemToInvoice(newInv.id, {
            description: `Lab Test: ${testTypeName}`,
            quantity: 1,
            unitPrice: 35,
          });
        }
      } catch (billingErr) {
        console.warn("Lab billing charge failed (non-fatal):", billingErr);
      }
      // ───────────────────────────────────────────────────────────────

      setSelectedTestTypeId("");
      setLabPriority("NORMAL");
      toast.success("Lab test requested successfully.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to submit lab request."));
    } finally {
      setSubmittingLab(false);
    }
  };

  // ── Admit patient handler ─────────────────────────────────────
  const submitAdmission = async () => {
    if (!activeAppt || !userId || !admitForm.roomId) {
      toast.error("Please select a room.");
      return;
    }
    setSubmittingAdmit(true);
    try {
      const body: AdmissionCreateRequest = {
        patientId: activeAppt.patientId,
        userId: activeAppt.patientId,
        admittingDoctorId: userId,
        roomId: Number(admitForm.roomId),
        bedNumber: Number(admitForm.bedNumber) || 1,
        admissionReason: admitForm.admissionReason || undefined,
        diagnosis: admitForm.diagnosis || diagnosis || undefined,
      };
      const { data: admissionData } = await receptionistApi.admitPatient(body);

      // ── Bill the admission upfront ──────────────────────────────────
      try {
        const { data: newInv } = await billingApi.createInvoice({
          patientId: activeAppt.patientId,
          admissionId: admissionData.id,
          notes: `Admission #${admissionData.id} — ${admitForm.admissionReason || "Hospital Admission"}`,
        });
        await billingApi.addItemToInvoice(newInv.id, {
          description: "Hospital Admission — Room Reservation",
          quantity: 1,
          unitPrice: 150,
        });
      } catch (billingErr) {
        console.warn("Admission billing charge failed (non-fatal):", billingErr);
      }
      // ───────────────────────────────────────────────────────────────

      toast.success("Patient admitted successfully.");
      setAdmitDone(true);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to admit patient."));
    } finally {
      setSubmittingAdmit(false);
    }
  };

  // ── Schedule surgery handler ──────────────────────────────────
  const submitSurgery = async () => {
    if (!activeAppt || !userId) return;
    if (!surgeryForm.surgeryType || !surgeryForm.operatingRoomId || !surgeryForm.scheduledAt) {
      toast.error("Please fill in surgery type, operating room, and scheduled time.");
      return;
    }
    setSubmittingSurgery(true);
    try {
      const body: SurgeryCreateRequest = {
        patientId: activeAppt.patientId,
        leadSurgeonId: userId,
        operatingRoomId: Number(surgeryForm.operatingRoomId),
        surgeryType: surgeryForm.surgeryType,
        priority: surgeryForm.priority,
        scheduledAt: surgeryForm.scheduledAt,
        estimatedDuration: Number(surgeryForm.estimatedDuration) || 60,
      };
      await clinicalApi.createSurgery(body);
      toast.success("Surgery scheduled successfully.");
      setSurgeryDone(true);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to schedule surgery."));
    } finally {
      setSubmittingSurgery(false);
    }
  };

  // ── Submit care tasks handler ─────────────────────────────────
  const submitCareTasks = async () => {
    if (!activeAppt || !selectedNurseId) {
      toast.error("Please select a nurse.");
      return;
    }
    const validTasks = careTasks.filter(t => t.title.trim());
    if (validTasks.length === 0) {
      toast.error("Please add at least one task.");
      return;
    }
    setSubmittingCare(true);
    try {
      for (const task of validTasks) {
        const body: CareTaskCreateRequest = {
          patientId: activeAppt.patientId,
          assignedTo: Number(selectedNurseId),
          title: task.title,
          description: task.description || undefined,
          priority: task.priority || "NORMAL",
        };
        await clinicalApi.createCareTask(body);
        setCareTasksDone(prev => [...prev, { title: task.title, nurseId: Number(selectedNurseId) }]);
      }
      setCareTasks([]);
      toast.success(`${validTasks.length} care task(s) assigned successfully.`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to create care tasks."));
    } finally {
      setSubmittingCare(false);
    }
  };

  // ── Load today's queue ────────────────────────────────────────
  const loadQueue = () => {
    setLoadingQueue(true);
    Promise.all([
      appointmentApi.getTodayQueue(),
      appointmentApi.getAppointmentsByDoctor(userId!),
    ])
      .then(([{ data: q }, { data: appts }]) => {
        const validAppts = (appts || []).filter((a) => a.status !== "COMPLETED");
        const validApptIds = new Set(validAppts.map((a) => a.id));
        const myQueue = (q || []).filter(
          (qe) => validApptIds.has(qe.appointmentId) && (qe.status === "CALLED" || qe.status === "IN_ROOM")
        );
        setQueue(myQueue);
        setAppointments(validAppts);
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

  // ── Unified Selection & Consultation Start ────────────────────
  const handleStartConsultation = async (qe: QueueResponse) => {
    setActiveQueue(qe);
    setSymptoms([]);
    setDiagnosis("");
    setClinicalNotes("");
    setShowVitals(false);
    setShowRx(false);
    setShowLab(false);
    setShowAdmit(false);
    setShowSurgery(false);
    setShowCare(false);
    setAdmitDone(false);
    setSurgeryDone(false);
    setCareTasksDone([]);

    const appt = appointments.find((a) => a.id === qe.appointmentId) || null;
    setActiveAppt(appt);

    if (!appt || !userId) return;
    setStartingConsultation(true);
    try {
      // 1. Check if consultation already exists for this appointment
      let existingConsult: ConsultationResponse | null = null;
      try {
        const { data: consults } = await clinicalApi.getConsultationsByPatient(appt.patientId);
        const existing = consults.find((c) => c.appointmentId === appt.id && c.status === "OPEN");
        if (existing) {
          existingConsult = existing;
        }
      } catch {
        // No existing consultation
      }

      if (existingConsult) {
        setConsultation(existingConsult);
        setSymptoms(existingConsult.symptoms ? existingConsult.symptoms.split(", ") : []);
        setDiagnosis(existingConsult.diagnosis || "");
        setClinicalNotes(existingConsult.clinicalNotes || "");
        loadLabRequests(existingConsult.id);
        toast.success("Loaded active consultation.");
      } else {
        // 2. Update appointment to IN_PROGRESS
        await appointmentApi.updateAppointmentStatus(appt.id, "IN_PROGRESS");

        // 3. Create consultation record
        const { data } = await clinicalApi.createConsultation({
          appointmentId: appt.id,
          patientId: appt.patientId,
          doctorId: userId,
        });
        setConsultation(data);
        loadLabRequests(data.id);
        toast.success("Consultation started successfully.");
      }
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
    const validItems = rxItems.filter((it) => it.medication.trim() !== "");
    if (validItems.length > 0) {
      const isValid = validItems.every(
        (it) => it.dosage.trim() && it.frequency.trim()
      );
      if (!isValid) {
        toast.error("Please fill in dosage and frequency for all prescribed medications.");
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
      if (validItems.length > 0) {
        await clinicalApi.createPrescription({
          consultationId: consultation.id,
          patientId: activeAppt.patientId,
          notes: rxNotes,
          items: validItems.map((it) => ({
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
      setLabRequests([]);
      setSelectedTestTypeId("");
      setLabPriority("NORMAL");
      setAdmitDone(false);
      setSurgeryDone(false);
      setCareTasksDone([]);
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
      <PageHeader
        title="Consultations"
        subtitle={consultation ? "Active Consultation Workspace" : "Today's Outstanding Patient Queue"}
      />

      {!consultation ? (
        // ── Today's Queue Grid View ──
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-[#1E3A5F] flex items-center gap-2">
              Patients Waiting
              <span className="text-xs bg-[#E0F2FE] text-[#0369A1] px-2.5 py-1 rounded-full font-semibold">
                {queue.length} Remaining
              </span>
            </h3>
            <button
              onClick={loadQueue}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] hover:border-[#0EA5E9] text-xs font-semibold text-[#64748B] hover:text-[#0EA5E9] bg-white cursor-pointer transition-all"
            >
              <RefreshCw size={12} className={loadingQueue ? "animate-spin" : ""} />
              Refresh Queue
            </button>
          </div>

          {loadingQueue ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-[#E2E8F0]">
              <span className="animate-spin rounded-full h-8 w-8 border-3 border-[#0EA5E9] border-t-transparent mb-3" />
              <p className="text-sm text-[#64748B]">Loading today's queue list...</p>
            </div>
          ) : queue.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-[#E2E8F0] text-center max-w-lg mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-full bg-[#F0FDF4] flex items-center justify-center mx-auto mb-4 text-[#10B981] text-2xl">
                ✓
              </div>
              <h3 className="font-bold text-[#0F172A] text-lg mb-1">Queue Completed!</h3>
              <p className="text-sm text-[#64748B]">
                All patients in today's queue have been seen. You have no outstanding consultations.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
              {queue.map((qe) => {
                const appt = appointments.find((a) => a.id === qe.appointmentId);
                const init = appt ? getPatientName(appt.patientId).split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "?";
                return (
                  <div
                    key={qe.id}
                    className="bg-white rounded-2xl p-5 border border-[#E2E8F0] hover:border-[#0EA5E9]/50 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-[#F59E0B] tracking-wider uppercase bg-[#FEF3C7] px-2.5 py-1 rounded-full">
                          Ticket #{qe.ticketNumber}
                        </span>
                        <Badge variant="pending" dot>{qe.status}</Badge>
                      </div>

                      <div className="flex items-center gap-3.5 mb-4">
                        <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] text-[#0EA5E9] flex items-center justify-center text-sm font-bold shrink-0">
                          {init}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-[#0F172A] text-base truncate">
                            {appt ? getPatientName(appt.patientId) : "—"}
                          </h4>
                          <p className="text-xs text-[#64748B] flex items-center gap-1.5 mt-0.5">
                            <span className="font-semibold text-[#0EA5E9]">
                              {appt ? String(appt.type).replace(/_/g, " ") : "—"}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-[#F1F5F9] pt-3.5 space-y-2 mb-5 text-xs text-[#64748B]">
                        {appt?.room && (
                          <div className="flex justify-between">
                            <span>Room Assignment:</span>
                            <span className="font-semibold text-[#0F172A]">{appt.room}</span>
                          </div>
                        )}
                        {appt?.scheduledAt && (
                          <div className="flex justify-between">
                            <span>Appointment Time:</span>
                            <span className="font-semibold text-[#0F172A]">
                              {new Date(appt.scheduledAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartConsultation(qe)}
                      disabled={startingConsultation}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0EA5E9] text-white font-bold text-sm hover:bg-[#0284C7] disabled:opacity-60 cursor-pointer transition-colors shadow-sm"
                    >
                      <Stethoscope size={15} />
                      Start Consultation
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        // ── Active Consultation Workspace View ──
        <div
          className="bg-white rounded-2xl border border-[#E2E8F0] flex flex-col overflow-hidden shadow-md animate-fadeIn"
          style={{ minHeight: 650 }}
        >
          {/* Patient info bar */}
          <div className="px-6 py-4 bg-[#1E3A5F] text-white flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setConsultation(null);
                  setActiveAppt(null);
                  setActiveQueue(null);
                }}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors mr-1 font-bold"
                title="Return to patient queue"
              >
                ←
              </button>
              <div className="w-10 h-10 rounded-full bg-[#0EA5E9] flex items-center justify-center text-white text-base font-bold shrink-0 shadow-inner">
                {activeAppt ? getPatientName(activeAppt.patientId).split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "?"}
              </div>
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  {activeAppt ? getPatientName(activeAppt.patientId) : "—"}
                </h3>
                <p className="text-white/70 text-xs">
                  {activeAppt ? String(activeAppt.type).replace(/_/g, " ") : ""} ·{" "}
                  {activeAppt ? new Date(activeAppt.scheduledAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }) : ""}
                  {activeAppt?.room ? ` · Room ${activeAppt.room}` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <span className="text-xs text-white/50 bg-white/5 px-2.5 py-1 rounded-md font-mono">
                Session ID: #{consultation.id}
              </span>
              <Badge variant="active" dot>Active consultation</Badge>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Symptoms */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">
                Symptoms
              </h4>
              <div className="flex flex-wrap gap-2 mb-3">
                {SYMPTOM_CHIPS.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleSymptom(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      symptoms.includes(s)
                        ? "bg-[#0EA5E9] text-white"
                        : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
                    }`}
                  >
                    {symptoms.includes(s) && <span className="mr-1">✓</span>}
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={customSymptom}
                  onChange={(e) => setCustomSymptom(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomSymptom()}
                  placeholder="Add custom symptom…"
                  className="flex-1 h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                />
                <button
                  onClick={addCustomSymptom}
                  className="px-4 h-10 rounded-xl bg-[#1E3A5F] text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity"
                >
                  Add
                </button>
              </div>
              {symptoms.filter((s) => !SYMPTOM_CHIPS.includes(s)).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {symptoms
                    .filter((s) => !SYMPTOM_CHIPS.includes(s))
                    .map((s) => (
                      <span
                        key={s}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#1E3A5F] text-white shadow-sm"
                      >
                        {s}
                        <button
                          onClick={() => handleSymptomsChange(symptoms.filter((x) => x !== s))}
                          className="cursor-pointer hover:text-[#EF4444] transition-colors"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                </div>
              )}
            </div>

            {/* Diagnosis */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">
                Diagnosis / ICD-10
              </h4>
              <input
                value={diagnosis}
                onChange={(e) => handleDiagnosisChange(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] font-medium"
                placeholder="e.g. E11.9 — Type 2 Diabetes Mellitus"
              />
            </div>

            {/* Clinical Notes */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">
                Clinical Notes
              </h4>
              <textarea
                value={clinicalNotes}
                onChange={(e) => handleNotesChange(e.target.value)}
                rows={5}
                className="w-full px-3.5 py-3 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] resize-none focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                placeholder="Observations, findings, plan of care…"
              />
              <p className="text-xs text-[#94A3B8] mt-1.5 italic">✓ Auto-saved as you type.</p>
            </div>

            {/* Vitals Panel */}
            <div className="border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => setShowVitals(!showVitals)}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-[#F8FAFC] text-sm font-bold text-[#0F172A] cursor-pointer hover:bg-[#F1F5F9] transition-colors"
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
                <div className="p-5 bg-white border-t border-[#E2E8F0] space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { label: "BP Systolic (mmHg)", key: "bpSystolic", ph: "e.g. 120" },
                      { label: "BP Diastolic (mmHg)", key: "bpDiastolic", ph: "e.g. 80" },
                      { label: "Heart Rate (bpm)", key: "heartRate", ph: "e.g. 72" },
                      { label: "Temp (°C)", key: "temperature", ph: "e.g. 37.0" },
                      { label: "O₂ Sat (%)", key: "oxygenSat", ph: "e.g. 98" },
                      { label: "Weight (kg)", key: "weightKg", ph: "e.g. 75" },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="block text-xs font-semibold text-[#64748B] mb-1">{f.label}</label>
                        <input
                          value={vitals[f.key as keyof typeof vitals]}
                          onChange={(e) =>
                            setVitals((prev) => ({ ...prev, [f.key]: e.target.value }))
                          }
                          placeholder={f.ph}
                          className="w-full h-10 px-3 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-[#94A3B8] italic">Vitals will be saved automatically when you complete the consultation.</p>
                </div>
              )}
            </div>

            {/* Lab Tests Panel */}
            <div className="border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => setShowLab(!showLab)}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-[#F8FAFC] text-sm font-bold text-[#0F172A] cursor-pointer hover:bg-[#F1F5F9] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <TestTube size={16} className="text-[#8B5CF6]" />
                  Request Lab Tests
                  {labRequests.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-[#8B5CF6] text-white text-[10px] font-bold">
                      {labRequests.length}
                    </span>
                  )}
                </span>
                <ChevronDown size={16} className={`transition-transform ${showLab ? "rotate-180" : ""}`} />
              </button>
              {showLab && (
                <div className="p-5 bg-white border-t border-[#E2E8F0] space-y-4">
                  {/* New request form */}
                  <div className="bg-[#FAFCFF] border border-[#E2E8F0] rounded-xl p-4 space-y-3">
                    <p className="text-xs font-bold text-[#1E3A5F] uppercase tracking-wider">Add Lab Test</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <select
                        value={selectedTestTypeId}
                        onChange={(e) => setSelectedTestTypeId(e.target.value === "" ? "" : Number(e.target.value))}
                        className="col-span-2 h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] bg-white"
                      >
                        <option value="">Select test type…</option>
                        {testTypes.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}{t.category ? ` — ${t.category}` : ""}
                          </option>
                        ))}
                      </select>
                      <div className="col-span-2">
                        <p className="text-xs font-semibold text-[#64748B] mb-1.5">Priority</p>
                        <div className="flex gap-2">
                          {(["NORMAL", "URGENT", "CRITICAL"] as const).map((p) => (
                            <button
                              key={p}
                              onClick={() => setLabPriority(p)}
                              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                labPriority === p
                                  ? p === "CRITICAL"
                                    ? "bg-red-600 text-white border-red-600"
                                    : p === "URGENT"
                                    ? "bg-orange-500 text-white border-orange-500"
                                    : "bg-[#8B5CF6] text-white border-[#8B5CF6]"
                                  : "bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#8B5CF6]"
                              }`}
                            >
                              {p === "CRITICAL" && <AlertTriangle size={11} className="inline mr-1" />}
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={submitLabRequest}
                      disabled={submittingLab || !selectedTestTypeId}
                      className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-[#8B5CF6] text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer transition-opacity"
                    >
                      {submittingLab ? <RefreshCw size={13} className="animate-spin" /> : <Plus size={13} />}
                      Send to Lab
                    </button>
                  </div>

                  {/* Existing requests list */}
                  {labRequests.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Requested This Session</p>
                      {labRequests.map((req) => {
                        const testType = testTypes.find((t) => t.id === req.testTypeId);
                        const priorityColor =
                          req.priority === "CRITICAL" ? "text-red-600 bg-red-50 border-red-200" :
                          req.priority === "URGENT" ? "text-orange-600 bg-orange-50 border-orange-200" :
                          "text-[#8B5CF6] bg-purple-50 border-purple-200";
                        const statusColor =
                          req.status === "COMPLETED" ? "text-[#10B981]" :
                          req.status === "CANCELLED" ? "text-red-500" :
                          req.status === "PROCESSING" ? "text-[#F59E0B]" :
                          "text-[#64748B]";
                        return (
                          <div
                            key={req.id}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#E2E8F0] bg-[#FAFCFF]"
                          >
                            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                              <TestTube size={15} className="text-[#8B5CF6]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-[#0F172A] truncate">
                                {req.testTypeName || testType?.name || `Test #${req.testTypeId}`}
                              </p>
                              <p className={`text-[10px] font-medium mt-0.5 ${statusColor}`}>
                                {req.status.replace(/_/g, " ")}
                              </p>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityColor}`}>
                              {req.priority}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <p className="text-xs text-[#94A3B8] italic font-medium">
                    Lab requests are sent immediately to the lab department.
                  </p>
                </div>
              )}
            </div>

            {/* Prescription Panel */}
            <div className="border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => setShowRx(!showRx)}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-[#F8FAFC] text-sm font-bold text-[#0F172A] cursor-pointer hover:bg-[#F1F5F9] transition-colors"
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
                <div className="p-5 bg-white border-t border-[#E2E8F0] space-y-4">
                  {rxItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="relative border border-[#E2E8F0] rounded-xl p-4 space-y-3 shadow-inner bg-[#FAFCFF]"
                    >
                      {rxItems.length > 1 && (
                        <button
                          onClick={() => setRxItems((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-3 right-3 text-[#94A3B8] hover:text-[#EF4444] cursor-pointer transition-colors"
                        >
                          <X size={15} />
                        </button>
                      )}
                      <p className="text-xs font-bold text-[#1E3A5F] uppercase tracking-wider">
                        Medication {idx + 1}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
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
                          className="col-span-2 h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] font-medium"
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
                          className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
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
                          className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
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
                          className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
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
                          className="h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
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
                          className="col-span-2 h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
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
                    className="flex items-center gap-1.5 text-xs text-[#0EA5E9] font-bold cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <Plus size={14} /> Add another medication
                  </button>
                  <input
                    value={rxNotes}
                    onChange={(e) => setRxNotes(e.target.value)}
                    placeholder="Prescription notes (optional)"
                    className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                  />
                  <p className="text-xs text-[#94A3B8] italic font-medium">Prescription will be submitted when you complete the consultation.</p>
                </div>
              )}
            </div>

            {/* ════════════════════════════════════════════════════════════ */}
            {/* ────────────── ADMIT PATIENT TO WARD ──────────────────── */}
            {/* ════════════════════════════════════════════════════════════ */}
            <div className="border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => setShowAdmit(!showAdmit)}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-[#F8FAFC] text-sm font-bold text-[#0F172A] cursor-pointer hover:bg-[#F1F5F9] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <BedDouble size={16} className="text-[#F59E0B]" />
                  Admit Patient to Ward
                  {admitDone && (
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-[#10B981] text-white text-[10px] font-bold">
                      ✓ Admitted
                    </span>
                  )}
                </span>
                <ChevronDown size={16} className={`transition-transform ${showAdmit ? "rotate-180" : ""}`} />
              </button>
              {showAdmit && (
                <div className="p-5 bg-white border-t border-[#E2E8F0] space-y-4">
                  {admitDone ? (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0]">
                      <CheckCircle size={20} className="text-[#10B981]" />
                      <p className="text-sm font-semibold text-[#166534]">
                        Patient has been admitted successfully. The receptionist can view this admission.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-4 space-y-3">
                      <p className="text-xs font-bold text-[#92400E] uppercase tracking-wider">Admission Details</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="block text-xs font-semibold text-[#64748B] mb-1">Room</label>
                          <select
                            value={admitForm.roomId}
                            onChange={(e) => setAdmitForm(f => ({ ...f, roomId: e.target.value }))}
                            className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] bg-white"
                          >
                            <option value="">Select available room…</option>
                            {rooms.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.roomNumber} — {r.wardName || `Ward #${r.wardId}`} ({r.bedCount} bed{r.bedCount > 1 ? "s" : ""})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#64748B] mb-1">Bed Number</label>
                          <input
                            type="number"
                            value={admitForm.bedNumber}
                            onChange={(e) => setAdmitForm(f => ({ ...f, bedNumber: e.target.value }))}
                            min={1}
                            className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#64748B] mb-1">Admission Reason</label>
                          <input
                            value={admitForm.admissionReason}
                            onChange={(e) => setAdmitForm(f => ({ ...f, admissionReason: e.target.value }))}
                            placeholder="e.g. Post-operative observation"
                            className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-semibold text-[#64748B] mb-1">Diagnosis (optional, auto-filled from above)</label>
                          <input
                            value={admitForm.diagnosis || diagnosis}
                            onChange={(e) => setAdmitForm(f => ({ ...f, diagnosis: e.target.value }))}
                            placeholder="Will use consultation diagnosis if left empty"
                            className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                          />
                        </div>
                      </div>
                      <button
                        onClick={submitAdmission}
                        disabled={submittingAdmit || !admitForm.roomId}
                        className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-[#F59E0B] text-white text-xs font-bold hover:bg-[#D97706] disabled:opacity-50 cursor-pointer transition-colors"
                      >
                        {submittingAdmit ? <RefreshCw size={13} className="animate-spin" /> : <BedDouble size={13} />}
                        Admit Patient
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ════════════════════════════════════════════════════════════ */}
            {/* ────────────── SCHEDULE SURGERY ───────────────────────── */}
            {/* ════════════════════════════════════════════════════════════ */}
            <div className="border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => setShowSurgery(!showSurgery)}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-[#F8FAFC] text-sm font-bold text-[#0F172A] cursor-pointer hover:bg-[#F1F5F9] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Scissors size={16} className="text-[#EF4444]" />
                  Schedule Surgery
                  {surgeryDone && (
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-[#10B981] text-white text-[10px] font-bold">
                      ✓ Scheduled
                    </span>
                  )}
                </span>
                <ChevronDown size={16} className={`transition-transform ${showSurgery ? "rotate-180" : ""}`} />
              </button>
              {showSurgery && (
                <div className="p-5 bg-white border-t border-[#E2E8F0] space-y-4">
                  {surgeryDone ? (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0]">
                      <CheckCircle size={20} className="text-[#10B981]" />
                      <p className="text-sm font-semibold text-[#166534]">
                        Surgery has been scheduled. It will appear on the Operating Rooms dashboard.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-4 space-y-3">
                      <p className="text-xs font-bold text-[#991B1B] uppercase tracking-wider">Surgery Details</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="block text-xs font-semibold text-[#64748B] mb-1">Surgery Type *</label>
                          <input
                            value={surgeryForm.surgeryType}
                            onChange={(e) => setSurgeryForm(f => ({ ...f, surgeryType: e.target.value }))}
                            placeholder="e.g. Appendectomy, Knee Replacement"
                            className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#EF4444]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#64748B] mb-1">Operating Room *</label>
                          <select
                            value={surgeryForm.operatingRoomId}
                            onChange={(e) => setSurgeryForm(f => ({ ...f, operatingRoomId: e.target.value }))}
                            className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#EF4444] bg-white"
                          >
                            <option value="">Select OR…</option>
                            {operatingRooms.filter(or => or.status === "AVAILABLE").map((or) => (
                              <option key={or.id} value={or.id}>{or.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#64748B] mb-1">Scheduled Date & Time *</label>
                          <input
                            type="datetime-local"
                            value={surgeryForm.scheduledAt}
                            onChange={(e) => setSurgeryForm(f => ({ ...f, scheduledAt: e.target.value }))}
                            className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#EF4444]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#64748B] mb-1">Estimated Duration (min)</label>
                          <input
                            type="number"
                            value={surgeryForm.estimatedDuration}
                            onChange={(e) => setSurgeryForm(f => ({ ...f, estimatedDuration: e.target.value }))}
                            min={15}
                            className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#EF4444]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#64748B] mb-1">Priority</label>
                          <select
                            value={surgeryForm.priority}
                            onChange={(e) => setSurgeryForm(f => ({ ...f, priority: e.target.value }))}
                            className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#EF4444] bg-white"
                          >
                            <option value="ELECTIVE">Elective</option>
                            <option value="URGENT">Urgent</option>
                            <option value="EMERGENCY">Emergency</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-semibold text-[#64748B] mb-1">Pre-Op Notes</label>
                          <textarea
                            value={surgeryForm.preOpNotes}
                            onChange={(e) => setSurgeryForm(f => ({ ...f, preOpNotes: e.target.value }))}
                            rows={2}
                            placeholder="Pre-operative instructions, allergies to note…"
                            className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#EF4444]"
                          />
                        </div>
                      </div>
                      <button
                        onClick={submitSurgery}
                        disabled={submittingSurgery || !surgeryForm.surgeryType || !surgeryForm.operatingRoomId || !surgeryForm.scheduledAt}
                        className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-[#EF4444] text-white text-xs font-bold hover:bg-[#DC2626] disabled:opacity-50 cursor-pointer transition-colors"
                      >
                        {submittingSurgery ? <RefreshCw size={13} className="animate-spin" /> : <Scissors size={13} />}
                        Schedule Surgery
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ════════════════════════════════════════════════════════════ */}
            {/* ────────── ASSIGN NURSE & CREATE CARE TASKS ───────────── */}
            {/* ════════════════════════════════════════════════════════════ */}
            <div className="border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => setShowCare(!showCare)}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-[#F8FAFC] text-sm font-bold text-[#0F172A] cursor-pointer hover:bg-[#F1F5F9] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <UserCheck size={16} className="text-[#0D9488]" />
                  Assign Nurse & Care Tasks
                  {careTasksDone.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-[#10B981] text-white text-[10px] font-bold">
                      {careTasksDone.length} assigned
                    </span>
                  )}
                </span>
                <ChevronDown size={16} className={`transition-transform ${showCare ? "rotate-180" : ""}`} />
              </button>
              {showCare && (
                <div className="p-5 bg-white border-t border-[#E2E8F0] space-y-4">
                  <div className="bg-[#F0FDFA] border border-[#99F6E4] rounded-xl p-4 space-y-3">
                    <p className="text-xs font-bold text-[#134E4A] uppercase tracking-wider">Nurse Assignment</p>
                    <div>
                      <label className="block text-xs font-semibold text-[#64748B] mb-1">Select Nurse *</label>
                      <select
                        value={selectedNurseId}
                        onChange={(e) => setSelectedNurseId(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488] bg-white"
                      >
                        <option value="">Select a nurse…</option>
                        {nurses.map((n) => (
                          <option key={n.id} value={n.id}>
                            {n.firstName} {n.lastName}{n.departmentName ? ` — ${n.departmentName}` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-[#134E4A] uppercase tracking-wider">Care Tasks</p>
                        <button
                          onClick={() => setCareTasks(prev => [...prev, { title: "", description: "", priority: "NORMAL" }])}
                          className="flex items-center gap-1 text-xs text-[#0D9488] font-bold cursor-pointer hover:opacity-80"
                        >
                          <Plus size={13} /> Add Task
                        </button>
                      </div>

                      {careTasks.length === 0 && (
                        <div className="bg-white border border-dashed border-[#E2E8F0] rounded-xl p-4 text-center">
                          <p className="text-xs text-[#94A3B8]">Click "Add Task" to create nursing care tasks for this patient.</p>
                        </div>
                      )}

                      {careTasks.map((task, idx) => (
                        <div key={idx} className="bg-white border border-[#E2E8F0] rounded-xl p-3 space-y-2 relative">
                          <button
                            onClick={() => setCareTasks(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute top-2.5 right-2.5 text-[#94A3B8] hover:text-[#EF4444] cursor-pointer transition-colors"
                          >
                            <X size={13} />
                          </button>
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                            <input
                              value={task.title}
                              onChange={(e) => {
                                const updated = [...careTasks];
                                updated[idx] = { ...updated[idx], title: e.target.value };
                                setCareTasks(updated);
                              }}
                              placeholder="Task title *  e.g. Monitor BP every 2h"
                              className="sm:col-span-2 h-9 px-3 rounded-lg border border-[#E2E8F0] text-xs focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                            />
                            <input
                              value={task.description}
                              onChange={(e) => {
                                const updated = [...careTasks];
                                updated[idx] = { ...updated[idx], description: e.target.value };
                                setCareTasks(updated);
                              }}
                              placeholder="Description (optional)"
                              className="h-9 px-3 rounded-lg border border-[#E2E8F0] text-xs focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                            />
                            <select
                              value={task.priority}
                              onChange={(e) => {
                                const updated = [...careTasks];
                                updated[idx] = { ...updated[idx], priority: e.target.value };
                                setCareTasks(updated);
                              }}
                              className="h-9 px-2 rounded-lg border border-[#E2E8F0] text-xs focus:outline-none focus:ring-2 focus:ring-[#0D9488] bg-white"
                            >
                              <option value="LOW">Low</option>
                              <option value="NORMAL">Normal</option>
                              <option value="HIGH">High</option>
                              <option value="URGENT">Urgent</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>

                    {careTasks.length > 0 && (
                      <button
                        onClick={submitCareTasks}
                        disabled={submittingCare || !selectedNurseId || !careTasks.some(t => t.title.trim())}
                        className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-[#0D9488] text-white text-xs font-bold hover:bg-[#0F766E] disabled:opacity-50 cursor-pointer transition-colors"
                      >
                        {submittingCare ? <RefreshCw size={13} className="animate-spin" /> : <ClipboardList size={13} />}
                        Assign {careTasks.filter(t => t.title.trim()).length} Task(s) to Nurse
                      </button>
                    )}
                  </div>

                  {/* Show already-assigned tasks */}
                  {careTasksDone.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Assigned This Session</p>
                      {careTasksDone.map((t, i) => {
                        const nurse = nurses.find(n => n.id === t.nurseId);
                        return (
                          <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#E2E8F0] bg-[#F0FDFA]">
                            <div className="w-8 h-8 rounded-lg bg-[#CCFBF1] flex items-center justify-center shrink-0">
                              <ClipboardList size={15} className="text-[#0D9488]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-[#0F172A] truncate">{t.title}</p>
                              <p className="text-[10px] font-medium text-[#0D9488] mt-0.5">
                                Assigned to {nurse ? `${nurse.firstName} ${nurse.lastName}` : `Nurse #${t.nurseId}`}
                              </p>
                            </div>
                            <CheckCircle size={16} className="text-[#10B981]" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom actions */}
          <div className="px-6 py-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex flex-wrap gap-4 items-center justify-between">
            <p className="text-xs font-semibold text-[#64748B]">
              Started{" "}
              {new Date(consultation.startedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setConsultation(null);
                  setActiveAppt(null);
                  setActiveQueue(null);
                }}
                className="px-5 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-bold text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer transition-colors"
              >
                Suspend Session
              </button>
              <button
                onClick={closeConsultation}
                disabled={closing}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#EF4444] text-white text-sm font-bold hover:bg-[#DC2626] disabled:opacity-60 cursor-pointer transition-colors shadow-sm"
              >
                {closing ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <CheckCircle size={14} />
                )}
                Complete Consultation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
