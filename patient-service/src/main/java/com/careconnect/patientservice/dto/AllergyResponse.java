package com.careconnect.patientservice.dto;

import com.careconnect.patientservice.enums.AllergySeverity;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AllergyResponse {
    private Long id;
    private String allergen;
    private AllergySeverity severity;
    private String notes;
    private LocalDateTime recordedAt;
}
