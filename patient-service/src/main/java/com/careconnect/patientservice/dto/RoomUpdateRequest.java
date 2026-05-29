package com.careconnect.patientservice.dto;

import com.careconnect.patientservice.enums.RoomStatus;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomUpdateRequest {
    private String roomNumber;
    private Integer bedCount;
    private RoomStatus status;
    private String notes;
}
