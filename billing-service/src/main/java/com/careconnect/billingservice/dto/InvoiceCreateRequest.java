package com.careconnect.billingservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceCreateRequest {
    @NotNull(message = "Patient ID is required")
    private Long patientId;

    private Long consultationId;
    private Long admissionId;
    private Long surgeryId;
    private LocalDate dueDate;
    private String notes;
}
