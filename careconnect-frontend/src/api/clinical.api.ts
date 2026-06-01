import { api } from "./axios";

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
  medicationName: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  instructions?: string;
}

export interface PrescriptionResponse {
  id: number;
  patientId: number;
  doctorId: number;
  consultationId?: number;
  prescribedDate: string;
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

// ── Misc ──────────────────────────────────────────────────────────
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
  getDocumentsByPatient: (patientId: number) =>
    api.get<MedicalDocumentResponse[]>(`/api/documents/patient/${patientId}`),
};
