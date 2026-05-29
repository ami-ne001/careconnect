package com.careconnect.patientservice.messaging;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientDischargedEvent {
    private Long patientId;
    private Long admissionId;
    private LocalDateTime dischargedAt;
    private String dischargeStatus;
}
