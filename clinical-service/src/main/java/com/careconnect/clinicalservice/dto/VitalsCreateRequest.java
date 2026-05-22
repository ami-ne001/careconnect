package com.careconnect.clinicalservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VitalsCreateRequest {
    @NotNull(message = "Patient ID is required")
    private Long patientId;

    private Long consultationId;
    private Long admissionId;
    private Long surgeryId;

    private Integer bpSystolic;
    private Integer bpDiastolic;
    private Integer heartRate;
    private BigDecimal temperature;
    private BigDecimal oxygenSat;
    private BigDecimal weightKg;
    private BigDecimal heightCm;
    private String notes;
}
