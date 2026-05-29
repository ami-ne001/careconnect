package com.careconnect.appointmentservice.dto;

import com.careconnect.appointmentservice.enums.AppointmentType;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentUpdateRequest {

    @NotNull(message = "Scheduled time is required")
    private LocalDateTime scheduledAt;

    @NotNull(message = "Duration is required")
    private Integer durationMinutes;

    @NotNull(message = "Appointment type is required")
    private AppointmentType type;

    private String room;
    private String notes;
}
