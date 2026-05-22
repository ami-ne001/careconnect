package com.careconnect.clinicalservice.dto;

import com.careconnect.clinicalservice.enums.ConsultationStatus;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationUpdateRequest {
    private String symptoms;
    private String diagnosis;
    private String clinicalNotes;
    private ConsultationStatus status;
}
