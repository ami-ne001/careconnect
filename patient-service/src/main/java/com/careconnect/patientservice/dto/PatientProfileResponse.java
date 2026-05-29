package com.careconnect.patientservice.dto;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientProfileResponse {
    private Long id;
    private Long userId;
    private String bloodType;
    private String nationalId;
    private String insuranceProvider;
    private String insuranceNumber;
    private String emergencyContactName;
    private String emergencyContactPhone;

    private List<AllergyResponse> allergies;
    private List<ChronicConditionResponse> chronicConditions;
}
