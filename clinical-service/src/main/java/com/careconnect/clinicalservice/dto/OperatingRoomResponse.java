package com.careconnect.clinicalservice.dto;

import com.careconnect.clinicalservice.enums.OperatingRoomStatus;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperatingRoomResponse {
    private Long id;
    private String name;
    private OperatingRoomStatus status;
    private LocalDateTime lastUsedAt;
    private String notes;
}
