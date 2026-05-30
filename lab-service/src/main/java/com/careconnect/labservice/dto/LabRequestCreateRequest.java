package com.careconnect.labservice.dto;

import com.careconnect.labservice.enums.LabRequestPriority;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabRequestCreateRequest {
    @NotNull(message = "Consultation ID is required")
    private Long consultationId;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    @NotNull(message = "Test Type ID is required")
    private Long testTypeId;

    private LabRequestPriority priority;
}
