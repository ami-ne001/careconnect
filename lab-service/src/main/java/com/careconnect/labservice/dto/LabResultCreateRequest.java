package com.careconnect.labservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabResultCreateRequest {
    @NotNull(message = "Lab Request ID is required")
    private Long labRequestId;

    @NotNull(message = "Technician ID is required")
    private Long technicianId;

    @NotBlank(message = "Result data is required")
    private String resultData;

    private String interpretation;
}
