package com.careconnect.patientservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdmissionCreateRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Admitting Doctor ID is required")
    private Long admittingDoctorId;

    @NotNull(message = "Room ID is required")
    private Long roomId;

    @NotNull(message = "Bed Number is required")
    private Integer bedNumber;

    private LocalDate expectedDischargeDate;
    private String admissionReason;
    private String diagnosis;
}
