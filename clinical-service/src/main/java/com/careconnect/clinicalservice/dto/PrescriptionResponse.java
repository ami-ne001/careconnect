package com.careconnect.clinicalservice.dto;

import com.careconnect.clinicalservice.enums.PrescriptionStatus;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionResponse {
    private Long id;
    private Long consultationId;
    private Long patientId;
    private Long doctorId;
    private LocalDateTime issuedAt;
    private String notes;
    private PrescriptionStatus status;
    private List<PrescriptionItemDto> items;
}
