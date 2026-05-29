package com.careconnect.appointmentservice.dto;

import com.careconnect.appointmentservice.enums.AppointmentStatus;
import com.careconnect.appointmentservice.enums.AppointmentType;
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
    private AppointmentType type;
    private String room;
    private AppointmentStatus status;
    private String notes;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
