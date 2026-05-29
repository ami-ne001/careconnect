package com.careconnect.appointmentservice.dto;

import com.careconnect.appointmentservice.enums.QueueStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QueueStatusUpdateRequest {
    @NotNull(message = "Status is required")
    private QueueStatus status;
}
