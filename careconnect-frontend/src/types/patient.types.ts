export interface AllergyRequest {
  allergen: string;
  severity: string;
  reaction?: string;
}

export interface AllergyResponse {
  id: number;
  allergen: string;
  severity: string;
  reaction?: string;
}

export interface ChronicConditionRequest {
  conditionName: string;
  diagnosisDate?: string;
  notes?: string;
}

export interface ChronicConditionResponse {
  id: number;
  conditionName: string;
  diagnosisDate?: string;
  notes?: string;
}

/** Mirrors PatientProfileResponse.java exactly */
export interface PatientProfileResponse {
  id: number;
  userId: number;
  bloodType?: string;
  nationalId?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergies: AllergyResponse[];
  chronicConditions: ChronicConditionResponse[];
}

/** Mirrors PatientProfileUpdateRequest.java exactly */
export interface PatientProfileUpdateRequest {
  bloodType?: string;
  nationalId?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}
