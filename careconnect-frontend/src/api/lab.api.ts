import { api } from "./axios";

// ── Types ─────────────────────────────────────────────────────────
export interface LabTestTypeResponse {
  id: number;
  name: string;
  category?: string;
  sampleType?: string;
  description?: string;
}

export interface LabRequestResponse {
  id: number;
  patientId: number;
  patientName?: string;
  doctorId: number;
  doctorName?: string;
  consultationId?: number;
  testTypeId: number;
  testTypeName: string;
  requestedAt: string;
  priority: string; // NORMAL | URGENT | CRITICAL
  status: string;   // REQUESTED | SAMPLE_RECEIVED | PROCESSING | COMPLETED | CANCELLED
}

export interface LabRequestCreateRequest {
  consultationId: number;
  patientId: number;
  doctorId: number;
  testTypeId: number;
  priority?: "NORMAL" | "URGENT" | "CRITICAL";
}

export interface LabResultResponse {
  id: number;
  labRequestId: number;
  testedAt: string;
  resultData: string;
  interpretation?: string;
}

// ── API ───────────────────────────────────────────────────────────
export const labApi = {
  // Test Types
  getAllTestTypes: () =>
    api.get<LabTestTypeResponse[]>("/api/lab/test-types"),

  // Lab Requests
  createLabRequest: (body: LabRequestCreateRequest) =>
    api.post<LabRequestResponse>("/api/lab/requests", body),

  getLabRequestsByPatient: (patientId: number) =>
    api.get<LabRequestResponse[]>(`/api/lab/requests/patient/${patientId}`),

  getLabRequestsByConsultation: (consultationId: number) =>
    api.get<LabRequestResponse[]>(`/api/lab/requests/consultation/${consultationId}`),

  getLabRequestsByDoctor: (doctorId: number) =>
    api.get<LabRequestResponse[]>(`/api/lab/requests/doctor/${doctorId}`),

  // Results
  getResultByLabRequestId: (labRequestId: number) =>
    api.get<LabResultResponse>(`/api/lab/results/request/${labRequestId}`),
};

