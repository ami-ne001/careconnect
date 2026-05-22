package com.careconnect.clinicalservice.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VitalsResponse {
    private Long id;
    private Long patientId;
    private Long consultationId;
    private Long admissionId;
    private Long surgeryId;
    private Long recordedBy;
    private Integer bpSystolic;
    private Integer bpDiastolic;
    private Integer heartRate;
    private BigDecimal temperature;
    private BigDecimal oxygenSat;
    private BigDecimal weightKg;
    private BigDecimal heightCm;
    private String notes;
    private LocalDateTime recordedAt;
}
