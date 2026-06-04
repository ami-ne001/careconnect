package com.careconnect.clinicalservice.dto;

import com.careconnect.clinicalservice.enums.OperatingRoomStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperatingRoomCardResponse {
    private Long id;
    private String name;
    private OperatingRoomStatus status;
    private String uiStatus;
    private OperatingRoomSurgerySummaryResponse lastSurgery;
    private OperatingRoomSurgerySummaryResponse nextSurgery;
    private List<OperatingRoomSurgerySummaryResponse> upcoming;
    private OperatingRoomSurgerySummaryResponse current;
    private LocalDateTime estReady;
}
