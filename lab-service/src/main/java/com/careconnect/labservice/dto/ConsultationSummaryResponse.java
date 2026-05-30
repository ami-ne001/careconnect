package com.careconnect.labservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
