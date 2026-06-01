import { api } from "./axios";

export interface ConsultationResponse {
  id: number;
  patientId: number;
  patientName?: string;
  doctorId: number;
  doctorName?: string;
  consultationDate: string;
  symptoms: string;
  diagnosis: string;
  notes?: string;
  status: string;
}

export interface PrescriptionItemResponse {
  id: number;
  medicationName: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  instructions?: string;
}

export interface PrescriptionResponse {
  id: number;
  patientId: number;
  patientName?: string;
  doctorId: number;
  doctorName?: string;
  consultationId?: number;
  prescribedDate: string;
  status: string;
  items: PrescriptionItemResponse[];
}

export interface VitalsResponse {
  id: number;
  patientId: number;
  recordedAt: string;
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  oxygenSaturation: number;
  weight?: number;
  height?: number;
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

export const clinicalApi = {
  getConsultationsByPatient: (patientId: number) =>
    api.get<ConsultationResponse[]>(`/api/clinical/consultations/patient/${patientId}`),

  getPrescriptionsByPatient: (patientId: number) =>
    api.get<PrescriptionResponse[]>(`/api/clinical/prescriptions/patient/${patientId}`),

  getVitalsByPatient: (patientId: number) =>
    api.get<VitalsResponse[]>(`/api/clinical/vitals/patient/${patientId}`),

  getLatestVitalsByPatient: (patientId: number) =>
    api.get<VitalsResponse>(`/api/clinical/vitals/patient/${patientId}/latest`),

  getDocumentsByPatient: (patientId: number) =>
    api.get<MedicalDocumentResponse[]>(`/api/documents/patient/${patientId}`),
};
