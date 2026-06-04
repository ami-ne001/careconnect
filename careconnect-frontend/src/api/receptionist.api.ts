import { api } from "./axios";
import type { PatientProfileResponse } from "../types/patient.types";

export interface WardResponse {
  id: number;
  name: string;
  capacity: number;
  genderRestriction?: string;
}

export interface RoomResponse {
  id: number;
  roomNumber: string;
  bedCount: number;
  status: string;
  notes?: string;
  wardId: number;
  wardName?: string;
}

export interface AdmissionCreateRequest {
  patientId: number;
  admittingDoctorId: number;
  roomId: number;
  bedNumber: number;
  expectedDischargeDate?: string;
  admissionReason?: string;
  diagnosis?: string;
}

export interface AdmissionResponse {
  id: number;
  patientId: number;
  admittingDoctorId: number;
  room: RoomResponse;
  bedNumber: number;
  admissionDate: string;
  expectedDischargeDate?: string;
  actualDischargeDate?: string;
  admissionReason?: string;
  diagnosis?: string;
  status: string;
  dischargeStatus?: string;
  conditionOnDischarge?: string;
  dischargeNotes?: string;
  followUpInstructions?: string;
}

export interface DepartmentAdmissionSlice {
  departmentName: string;
  count: number;
}

export interface AdmissionsByDepartmentReport {
  startDate: string;
  endDate: string;
  totalAdmissions: number;
  slices: DepartmentAdmissionSlice[];
}

export interface DischargeRequest {
  dischargeStatus: "RECOVERED" | "AGAINST_MEDICAL_ADVICE" | "TRANSFERRED" | "DECEASED";
  conditionOnDischarge: "STABLE" | "IMPROVED" | "UNCHANGED" | "CRITICAL";
  dischargeNotes?: string;
  followUpInstructions?: string;
}

export interface PatientProfileCreateRequest {
  userId: number;
  bloodType?: string;
  nationalId?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export const receptionistApi = {
  // Wards
  getWards: () => api.get<WardResponse[]>("/api/wards"),

  // Rooms
  getRooms: () => api.get<RoomResponse[]>("/api/rooms"),
  getAvailableRooms: () => api.get<RoomResponse[]>("/api/rooms/available"),
  updateRoomStatus: (id: number, status: string) => 
    api.put<RoomResponse>(`/api/rooms/${id}/status?status=${status}`, {}),

  // Admissions
  admitPatient: (body: AdmissionCreateRequest) =>
    api.post<AdmissionResponse>("/api/admissions", body),

  getActiveAdmissions: () => api.get<AdmissionResponse[]>("/api/admissions/active"),

  getAdmissionsByDepartment: (params?: { startDate?: string; endDate?: string }) =>
    api.get<AdmissionsByDepartmentReport>("/api/admissions/analytics/by-department", { params }),

  dischargePatient: (id: number, body: DischargeRequest) =>
    api.post<AdmissionResponse>(`/api/admissions/${id}/discharge`, body),

  // Patient profiles list & registration
  getPatientsList: (page = 0, size = 20) =>
    api.get<{ content: PatientProfileResponse[]; totalElements: number }>(
      `/api/patients?page=${page}&size=${size}`
    ),

  createPatientProfile: (body: PatientProfileCreateRequest) =>
    api.post<PatientProfileResponse>("/api/patients", body),
};
