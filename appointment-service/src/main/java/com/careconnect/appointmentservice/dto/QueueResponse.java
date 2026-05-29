package com.careconnect.appointmentservice.dto;

import com.careconnect.appointmentservice.enums.QueueStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QueueResponse {
    private Long id;
    private Long appointmentId;
    private Integer ticketNumber;
    private LocalDateTime checkedInAt;
    private LocalDateTime calledAt;
    private QueueStatus status;
}
