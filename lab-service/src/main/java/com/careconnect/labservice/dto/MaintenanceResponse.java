package com.careconnect.labservice.dto;

import com.careconnect.labservice.enums.MaintenanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceResponse {
    private Long id;
    private Long equipmentId;
    private Long reportedBy;
    private String issue;
    private String resolution;
    private MaintenanceStatus status;
    private LocalDateTime reportedAt;
    private LocalDateTime resolvedAt;
}
