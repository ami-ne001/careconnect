package com.careconnect.clinicalservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionItemDto {
    private Long id;

    @NotNull(message = "Medication name is required")
    private String medication;

    @NotNull(message = "Dosage is required")
    private String dosage;

    @NotNull(message = "Frequency is required")
    private String frequency;

    @NotNull(message = "Duration in days is required")
    private Integer durationDays;

    @NotNull(message = "Quantity is required")
    private Integer quantity;

    private String instructions;
}
