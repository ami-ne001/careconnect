package com.careconnect.patientservice.dto;

import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChronicConditionResponse {
    private Long id;
    private String conditionName;
    private LocalDate diagnosed;
    private String notes;
}
