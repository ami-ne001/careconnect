package com.careconnect.patientservice.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientSummaryResponse {
    private Long id;
    private Long userId;
    private String firstName;
    private String lastName;
    private String bloodType;
    private String insuranceProvider;
    private String insuranceNumber;
}
