import { api } from "./axios";
import type {
  PatientProfileResponse,
  PatientProfileUpdateRequest,
  AllergyRequest,
  AllergyResponse,
  ChronicConditionRequest,
  ChronicConditionResponse
} from "../types/patient.types";

export const patientApi = {
  getProfileByUserId: (userId: number) =>
    api.get<PatientProfileResponse>(`/api/patients/user/${userId}`),

  getProfileById: (id: number) =>
    api.get<PatientProfileResponse>(`/api/patients/${id}`),

  updateProfile: (id: number, body: PatientProfileUpdateRequest) =>
    api.put<PatientProfileResponse>(`/api/patients/${id}`, body),

  addAllergy: (id: number, body: AllergyRequest) =>
    api.post<AllergyResponse>(`/api/patients/${id}/allergies`, body),

  removeAllergy: (id: number, allergyId: number) =>
    api.delete<void>(`/api/patients/${id}/allergies/${allergyId}`),

  addChronicCondition: (id: number, body: ChronicConditionRequest) =>
    api.post<ChronicConditionResponse>(`/api/patients/${id}/conditions`, body),

  removeChronicCondition: (id: number, conditionId: number) =>
    api.delete<void>(`/api/patients/${id}/conditions/${conditionId}`),
};
