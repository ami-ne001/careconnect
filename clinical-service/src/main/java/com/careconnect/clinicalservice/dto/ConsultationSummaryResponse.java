package com.careconnect.clinicalservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Lightweight consultation projection returned by internal service-to-service endpoints.
 * Used by lab-service, billing-service, etc. to verify consultation existence and ownership.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationSummaryResponse {
    private Long id;
    private Long patientId;
    private Long doctorId;
    private String status;
}
