package com.careconnect.clinicalservice.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponse {
    private Long id;
    private Long patientId;
    private Long doctorId;
    private LocalDateTime scheduledAt;
    private Integer durationMinutes;
    private String type;
    private String room;
    private String status;
    private String notes;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
