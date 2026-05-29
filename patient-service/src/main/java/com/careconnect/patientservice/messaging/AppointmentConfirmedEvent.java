package com.careconnect.patientservice.messaging;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentConfirmedEvent {
    private Long appointmentId;
    private Long patientId;
    private Long doctorId;
    private LocalDateTime scheduledAt;
}
