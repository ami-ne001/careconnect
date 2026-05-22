package com.careconnect.clinicalservice.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorProfileUpdateRequest {
    private Boolean isSurgeon;
    private String specialty;
    private String licenseNumber;
    private Integer yearsExperience;
    private String bio;
}
