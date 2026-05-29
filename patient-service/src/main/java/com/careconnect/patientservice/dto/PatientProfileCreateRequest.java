package com.careconnect.patientservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientProfileCreateRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    private String bloodType;
    private String nationalId;
    private String insuranceProvider;
    private String insuranceNumber;
    private String emergencyContactName;
    private String emergencyContactPhone;

    private List<AllergyRequest> allergies;
    private List<ChronicConditionRequest> chronicConditions;
}
