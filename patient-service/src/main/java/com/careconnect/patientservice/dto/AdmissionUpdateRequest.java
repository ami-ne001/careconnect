package com.careconnect.patientservice.dto;

import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdmissionUpdateRequest {
    private Long roomId;
    private Integer bedNumber;
    private LocalDate expectedDischargeDate;
    private String admissionReason;
    private String diagnosis;
    private Long admittingDoctorId;
}
