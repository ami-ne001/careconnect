package com.careconnect.clinicalservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperatingRoomSurgerySummaryResponse {
    private Long surgeryId;
    private String surgeryType;
    private String patientName;
    private String surgeonName;
    private LocalDateTime scheduledAt;
    private LocalDateTime actualStartAt;
    private LocalDateTime actualEndAt;
    private LocalDateTime estimatedEndAt;
    private Integer progressPercent;
}
