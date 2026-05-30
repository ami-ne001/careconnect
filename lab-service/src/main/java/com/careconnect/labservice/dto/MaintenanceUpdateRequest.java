package com.careconnect.labservice.dto;

import com.careconnect.labservice.enums.MaintenanceStatus;
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
public class MaintenanceUpdateRequest {
    @NotBlank(message = "Resolution details are required")
    private String resolution;

    @NotNull(message = "Status is required")
    private MaintenanceStatus status;
}
