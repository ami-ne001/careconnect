package com.careconnect.clinicalservice.messaging;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientAdmittedEvent {
    private Long patientId;
    private Long admissionId;
    private String roomNumber;
    private String wardName;
}
