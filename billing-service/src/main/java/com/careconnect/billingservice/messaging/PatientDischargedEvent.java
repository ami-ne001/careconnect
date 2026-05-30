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
public class PatientDischargedEvent {
    private Long admissionId;
    private Long patientId;
    private Long roomId;
    private String roomNumber;
    private Long nights;
    private BigDecimal pricePerNight;
}
