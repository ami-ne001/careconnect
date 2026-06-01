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
  type: string;
  status: string;
  wardId: number;
  wardName?: string;
}

export interface AdmissionCreateRequest {
  patientId: number;
  roomId: number;
  admissionDate: string;
  reason: string;
  expectedDischargeDate?: string;
}

export interface AdmissionResponse {
  id: number;
  patientId: number;
  patientName?: string;
  roomId: number;
  roomNumber?: string;
  wardName?: string;
  admissionDate: string;
  dischargeDate?: string;
  reason: string;
  expectedDischargeDate?: string;
  status: string;
}

export interface DischargeRequest {
  dischargeDate: string;
  dischargeNotes?: string;
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

  // Admissions
  admitPatient: (body: AdmissionCreateRequest) =>
    api.post<AdmissionResponse>("/api/admissions", body),

  getActiveAdmissions: () => api.get<AdmissionResponse[]>("/api/admissions/active"),

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
