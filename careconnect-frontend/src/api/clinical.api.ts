import { api } from "./axios";

export interface CareTaskCreateRequest {
  patientId: number;
  assignedTo: number;
  surgeryId?: number;
  admissionId?: number;
  title: string;
  description?: string;
  priority?: string; // NORMAL | URGENT | CRITICAL
  dueAt?: string;
}

export interface CareTaskResponse {
  id: number;
  patientId: number;
  assignedTo: number;
  surgeryId?: number;
  admissionId?: number;
  title: string;
  description?: string;
  priority: string;
  status: string;
  dueAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SurgeryCreateRequest {
  patientId: number;
  leadSurgeonId: number;
  assistingSurgeonId?: number;
  assistingNurseId?: number;
  operatingRoomId: number;
  admissionId?: number;
  surgeryType: string;
  priority?: string;
  scheduledAt: string;
  estimatedDuration: number;
}

export interface SurgeryResponse {
  id: number;
  patientId: number;
  leadSurgeonId: number;
  assistingSurgeonId?: number;
  assistingNurseId?: number;
  operatingRoomId: number;
  operatingRoomName: string;
  admissionId?: number;
  surgeryType: string;
  priority: string;
  status: string;
  scheduledAt: string;
  estimatedDuration: number;
  actualStartAt?: string;
  actualEndAt?: string;
  preOpNotes?: string;
  postOpNotes?: string;
  outcome?: string;
  specialEquipment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditActivityResponse {
  id: number;
  userId: number | null;
  userName: string;
  role: string;
  action: string;
  module: string;
  description: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface DailyAuditActivityResponse {
  day: string;
  logins: number;
}

export interface AuditLogQueryParams {
  q?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export interface AuditLogPageResponse {
  items: AuditActivityResponse[];
  total: number;
  page: number;
  size: number;
}

// ── Operating rooms ───────────────────────────────────────────────
export interface OperatingRoomStatsResponse {
  total: number;
  inUse: number;
  available: number;
  cleaning: number;
}

export interface OperatingRoomSurgerySummaryResponse {
  surgeryId: number;
  surgeryType: string;
  patientName: string;
  surgeonName: string;
  scheduledAt: string;
  actualStartAt?: string | null;
  actualEndAt?: string | null;
  estimatedEndAt?: string | null;
  progressPercent?: number | null;
}

export interface OperatingRoomCardResponse {
  id: number;
  name: string;
  status: string;
  uiStatus: string;
  lastSurgery?: OperatingRoomSurgerySummaryResponse | null;
  nextSurgery?: OperatingRoomSurgerySummaryResponse | null;
  upcoming: OperatingRoomSurgerySummaryResponse[];
  current?: OperatingRoomSurgerySummaryResponse | null;
  estReady?: string | null;
}

export interface WeekScheduleBlockResponse {
  dayIndex: number;
  startHour: number;
  spanHours: number;
  label: string;
  orName: string;
  colorKey: string;
}

export interface WeekScheduleRowResponse {
  orName: string;
  blocks: WeekScheduleBlockResponse[];
}

export interface WeekScheduleResponse {
  weekStart: string;
  weekEnd: string;
  dayLabels: string[];
  rows: WeekScheduleRowResponse[];
}

export interface OperatingRoomOverviewResponse {
  stats: OperatingRoomStatsResponse;
  rooms: OperatingRoomCardResponse[];
  weekSchedule: WeekScheduleResponse;
}

export interface OperatingRoomResponse {
  id: number;
  name: string;
  status: string;
  lastUsedAt?: string | null;
  notes?: string | null;
}

// ── Consultation ──────────────────────────────────────────────────
export interface ConsultationResponse {
  id: number;
  appointmentId: number;
  patientId: number;
  doctorId: number;
  symptoms?: string;
  diagnosis?: string;
  clinicalNotes?: string;
  status: string; // OPEN | CLOSED | CANCELLED
  startedAt: string;
  closedAt?: string;
}

export interface ConsultationCreateRequest {
  appointmentId: number;
  patientId: number;
  doctorId: number;
  symptoms?: string;
  diagnosis?: string;
  clinicalNotes?: string;
}

export interface ConsultationUpdateRequest {
  symptoms?: string;
  diagnosis?: string;
  clinicalNotes?: string;
  status?: string; // "OPEN" | "CLOSED" | "CANCELLED"
}

// ── Vitals ────────────────────────────────────────────────────────
export interface VitalsResponse {
  id: number;
  patientId: number;
  consultationId?: number;
  admissionId?: number;
  surgeryId?: number;
  recordedBy?: number;
  bpSystolic?: number;
  bpDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  oxygenSat?: number;
  weightKg?: number;
  heightCm?: number;
  notes?: string;
  recordedAt: string;
}

export interface VitalsCreateRequest {
  patientId: number;
  consultationId?: number;
  bpSystolic?: number;
  bpDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  oxygenSat?: number;
  weightKg?: number;
  heightCm?: number;
  notes?: string;
}

// ── Prescription ──────────────────────────────────────────────────
export interface PrescriptionItemDto {
  medication: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  quantity: number;
  instructions?: string;
}

export interface PrescriptionResponse {
  id: number;
  patientId: number;
  doctorId: number;
  consultationId?: number;
  issuedAt: string;
  status: string;
  notes?: string;
  items: PrescriptionItemDto[];
}

export interface PrescriptionCreateRequest {
  consultationId: number;
  patientId: number;
  notes?: string;
  items: PrescriptionItemDto[];
}

// ── Doctor Profile ─────────────────────────────────────────────
export interface DoctorProfileResponse {
  id: number;
  userId: number;
  isSurgeon: boolean;
  specialty?: string;
  licenseNumber?: string;
  yearsExperience?: number;
  bio?: string;
}

export interface DoctorProfileUpdateRequest {
  isSurgeon?: boolean;
  specialty?: string;
  licenseNumber?: string;
  yearsExperience?: number;
  bio?: string;
}

export interface MedicalDocumentCreateRequest {
  patientId: number;
  documentType: string;
  title: string;
  fileUrl: string;
  notes?: string;
}

export interface MedicalDocumentResponse {
  id: number;
  patientId: number;
  documentType: string;
  title: string;
  fileUrl: string;
  uploadedAt: string;
  notes?: string;
}

// ── API ───────────────────────────────────────────────────────────
export const clinicalApi = {
  // Consultations
  createConsultation: (body: ConsultationCreateRequest) =>
    api.post<ConsultationResponse>("/api/clinical/consultations", body),

  getConsultation: (id: number) =>
    api.get<ConsultationResponse>(`/api/clinical/consultations/${id}`),

  updateConsultation: (id: number, body: ConsultationUpdateRequest) =>
    api.put<ConsultationResponse>(`/api/clinical/consultations/${id}`, body),

  getConsultationsByPatient: (patientId: number) =>
    api.get<ConsultationResponse[]>(`/api/clinical/consultations/patient/${patientId}`),

  getConsultationsByDoctor: (doctorId: number) =>
    api.get<ConsultationResponse[]>(`/api/clinical/consultations/doctor/${doctorId}`),

  // Vitals
  recordVitals: (body: VitalsCreateRequest) =>
    api.post<VitalsResponse>("/api/clinical/vitals", body),

  getVitalsByPatient: (patientId: number) =>
    api.get<VitalsResponse[]>(`/api/clinical/vitals/patient/${patientId}`),

  getLatestVitalsByPatient: (patientId: number) =>
    api.get<VitalsResponse>(`/api/clinical/vitals/patient/${patientId}/latest`),

  // Prescriptions
  createPrescription: (body: PrescriptionCreateRequest) =>
    api.post<PrescriptionResponse>("/api/clinical/prescriptions", body),

  getPrescriptionsByPatient: (patientId: number) =>
    api.get<PrescriptionResponse[]>(`/api/clinical/prescriptions/patient/${patientId}`),

  cancelPrescription: (id: number) =>
    api.put<PrescriptionResponse>(`/api/clinical/prescriptions/${id}/cancel`),

  // Documents
  uploadDocument: (body: MedicalDocumentCreateRequest) =>
    api.post<MedicalDocumentResponse>("/api/documents", body),

  getDocumentsByPatient: (patientId: number) =>
    api.get<MedicalDocumentResponse[]>(`/api/documents/patient/${patientId}`),

  // Audit logs
  getRecentActivity: () =>
    api.get<AuditActivityResponse[]>("/api/clinical/audit-logs/recent"),

  getDailyAuditActivity: () =>
    api.get<DailyAuditActivityResponse[]>("/api/clinical/audit-logs/daily"),

  getAuditLogs: (params?: AuditLogQueryParams) =>
    api.get<AuditLogPageResponse>("/api/clinical/audit-logs", { params }),

  getScheduledSurgeriesThisMonth: () =>
    api.get<number>("/api/clinical/surgeries/metrics/scheduled-this-month"),

  // Operating rooms
  getOperatingRoomsOverview: (weekStart?: string) =>
    api.get<OperatingRoomOverviewResponse>("/api/clinical/operating-rooms/overview", {
      params: weekStart ? { weekStart } : undefined,
    }),

  getOperatingRooms: () =>
    api.get<OperatingRoomResponse[]>("/api/clinical/operating-rooms"),

  createOperatingRoom: (name: string, notes?: string) =>
    api.post<OperatingRoomResponse>("/api/clinical/operating-rooms", { name, notes }),

  updateOperatingRoomStatus: (id: number, status: string, notes?: string) =>
    api.put<OperatingRoomResponse>(`/api/clinical/operating-rooms/${id}/status`, {
      status,
      notes: notes ?? "",
    }),

  // Care Tasks
  createCareTask: (body: CareTaskCreateRequest) =>
    api.post<CareTaskResponse>("/api/clinical/care-tasks", body),

  getCareTasksAssignedTo: (nurseId: number) =>
    api.get<CareTaskResponse[]>(`/api/clinical/care-tasks/nurse/${nurseId}`),

  updateCareTaskStatus: (id: number, status: string) =>
    api.put<CareTaskResponse>(`/api/clinical/care-tasks/${id}/status`, { status }),

  // Surgeries
  createSurgery: (body: SurgeryCreateRequest) =>
    api.post<SurgeryResponse>("/api/clinical/surgeries", body),

  getSurgeriesBySurgeon: (surgeonId: number) =>
    api.get<SurgeryResponse[]>(`/api/clinical/surgeries/surgeon/${surgeonId}`),

  updateSurgeryStatus: (id: number, status: string) =>
    api.put<SurgeryResponse>(`/api/clinical/surgeries/${id}`, { status }),

  // Doctor Profiles
  getDoctorProfile: (userId: number) =>
    api.get<DoctorProfileResponse>(`/api/clinical/doctors/${userId}`),

  updateDoctorProfile: (userId: number, body: DoctorProfileUpdateRequest) =>
    api.put<DoctorProfileResponse>(`/api/clinical/doctors/${userId}`, body),
};
