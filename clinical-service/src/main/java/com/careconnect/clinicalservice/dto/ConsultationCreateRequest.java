package com.careconnect.clinicalservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationCreateRequest {
    @NotNull(message = "Appointment ID is required")
    private Long appointmentId;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    private String symptoms;
    private String diagnosis;
    private String clinicalNotes;
}
