package com.careconnect.billingservice.messaging;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationClosedEvent {
    private Long consultationId;
    private Long patientId;
    private Long doctorId;
    private String diagnosis;
    private BigDecimal consultationFee;
}
