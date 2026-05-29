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
public class SurgeryScheduledEvent {
    private Long surgeryId;
    private Long patientId;
    private Long leadSurgeonId;
    private Long operatingRoomId;
    private LocalDateTime scheduledTime;
    private String priority;
}
