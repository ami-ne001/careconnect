package com.careconnect.labservice.dto;

import com.careconnect.labservice.enums.LabRequestStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabRequestStatusUpdateRequest {
    @NotNull(message = "Status is required")
    private LabRequestStatus status;
}
