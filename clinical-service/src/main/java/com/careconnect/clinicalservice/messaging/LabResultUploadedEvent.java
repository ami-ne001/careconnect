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
    private Long labResultId;
    private Long labRequestId;
    private Long patientId;
    private Long doctorId;
    private String testType;
    private Long technicianId;
}
