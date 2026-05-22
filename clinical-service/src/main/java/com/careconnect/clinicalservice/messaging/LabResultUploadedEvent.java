package com.careconnect.clinicalservice.messaging;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabResultUploadedEvent {
    private Long labRequestId;
    private Long labResultId;
    private Long patientId;
    private String testType;
}
