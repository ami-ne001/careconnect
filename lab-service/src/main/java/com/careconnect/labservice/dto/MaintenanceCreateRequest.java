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
public class MaintenanceCreateRequest {
    @NotNull(message = "Equipment ID is required")
    private Long equipmentId;

    @NotNull(message = "Reported By (User ID) is required")
    private Long reportedBy;

    @NotBlank(message = "Issue description is required")
    private String issue;
}
