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

export interface LabResultCreateRequest {
  labRequestId: number;
  technicianId: number;
  resultData: string;
  interpretation?: string;
}

export interface ReferenceRangeCreateRequest {
  componentName: string;
  minNormal: number;
  maxNormal: number;
  unit: string;
  targetGender?: string;
  minAge?: number;
  maxAge?: number;
}

export interface ReferenceRangeResponse {
  id: number;
  testTypeId: number;
  componentName: string;
  minNormal: number;
  maxNormal: number;
  unit: string;
  targetGender?: string;
  minAge?: number;
  maxAge?: number;
}

export interface EquipmentResponse {
  id: number;
  name: string;
  type: string;
  status: "ACTIVE" | "MAINTENANCE" | "BROKEN" | "RETIRED";
  lastCalibrationDate?: string;
  nextCalibrationDate?: string;
  notes?: string;
}

export interface MaintenanceResponse {
  id: number;
  equipmentId: number;
  issueDescription: string;
  reportedBy: number;
  reportedAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED";
}

export interface MaintenanceCreateRequest {
  issueDescription: string;
}

export interface LabTestTypeCreateRequest {
  name: string;
  category?: string;
  sampleType?: string;
  description?: string;
}

// ── API ───────────────────────────────────────────────────────────
export const labApi = {
  // Test Types
  getAllTestTypes: () =>
    api.get<LabTestTypeResponse[]>("/api/lab/test-types"),
  
  createTestType: (body: LabTestTypeCreateRequest) =>
    api.post<LabTestTypeResponse>("/api/lab/test-types", body),

  getReferenceRanges: (testTypeId: number) =>
    api.get<ReferenceRangeResponse[]>(`/api/lab/test-types/${testTypeId}/reference-ranges`),
    
  addReferenceRange: (testTypeId: number, body: ReferenceRangeCreateRequest) =>
    api.post<ReferenceRangeResponse>(`/api/lab/test-types/${testTypeId}/reference-ranges`, body),

  // Equipment
  getAllEquipment: () =>
    api.get<EquipmentResponse[]>("/api/lab/equipment"),

  updateEquipmentStatus: (id: number, status: string) =>
    api.patch<EquipmentResponse>(`/api/lab/equipment/${id}/status`, { status }),

  // Maintenance
  getMaintenanceHistory: (equipmentId: number) =>
    api.get<MaintenanceResponse[]>(`/api/lab/equipment/${equipmentId}/maintenance`),

  reportMaintenance: (equipmentId: number, body: MaintenanceCreateRequest) =>
    api.post<MaintenanceResponse>(`/api/lab/equipment/${equipmentId}/maintenance`, body),

  // Lab Requests
  getAllLabRequests: () =>
    api.get<LabRequestResponse[]>("/api/lab/requests"),

  createLabRequest: (body: LabRequestCreateRequest) =>
    api.post<LabRequestResponse>("/api/lab/requests", body),

  getLabRequestsByPatient: (patientId: number) =>
    api.get<LabRequestResponse[]>(`/api/lab/requests/patient/${patientId}`),

  getLabRequestsByConsultation: (consultationId: number) =>
    api.get<LabRequestResponse[]>(`/api/lab/requests/consultation/${consultationId}`),

  getLabRequestsByDoctor: (doctorId: number) =>
    api.get<LabRequestResponse[]>(`/api/lab/requests/doctor/${doctorId}`),

  // Results
  uploadResult: (body: LabResultCreateRequest) =>
    api.post<LabResultResponse>("/api/lab/results", body),

  getResultByLabRequestId: (labRequestId: number) =>
    api.get<LabResultResponse>(`/api/lab/results/request/${labRequestId}`),

  updateLabRequestStatus: (labRequestId: number, status: string) =>
    api.patch<LabRequestResponse>(`/api/lab/requests/${labRequestId}/status`, { status }),
};

