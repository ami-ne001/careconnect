package com.careconnect.clinicalservice.messaging;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SurgeryBilledEvent {
    private Long surgeryId;
    private Long patientId;
    private Long admissionId;
    private String surgeryType;
    private BigDecimal price;
}
