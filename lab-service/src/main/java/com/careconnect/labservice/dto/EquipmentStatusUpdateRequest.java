package com.careconnect.labservice.dto;

import com.careconnect.labservice.enums.EquipmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentStatusUpdateRequest {
    @NotNull(message = "Status is required")
    private EquipmentStatus status;
}
