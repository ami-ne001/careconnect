import { api } from "./axios";

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
  priority: string;
  status: string;
}

export interface LabResultResponse {
  id: number;
  labRequestId: number;
  testedAt: string;
  resultData: string;
  interpretation?: string;
}

export const labApi = {
  getLabRequestsByPatient: (patientId: number) =>
    api.get<LabRequestResponse[]>(`/api/lab/requests/patient/${patientId}`),

  getResultByLabRequestId: (labRequestId: number) =>
    api.get<LabResultResponse>(`/api/lab/results/request/${labRequestId}`),
};
