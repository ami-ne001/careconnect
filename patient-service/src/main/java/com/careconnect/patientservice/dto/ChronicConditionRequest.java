package com.careconnect.patientservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChronicConditionRequest {

    @NotBlank(message = "Condition name is required")
    private String conditionName;

    private LocalDate diagnosed;
    private String notes;
}
