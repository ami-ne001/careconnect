package com.careconnect.clinicalservice.dto;

import com.careconnect.clinicalservice.enums.ConsultationStatus;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationResponse {
    private Long id;
    private Long appointmentId;
    private Long patientId;
    private Long doctorId;
    private String symptoms;
    private String diagnosis;
    private String clinicalNotes;
    private ConsultationStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime closedAt;
}
