package com.careconnect.patientservice.dto;

import com.careconnect.patientservice.enums.AllergySeverity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AllergyRequest {

    @NotBlank(message = "Allergen name is required")
    private String allergen;

    @NotNull(message = "Severity is required")
    private AllergySeverity severity;

    private String notes;
}
