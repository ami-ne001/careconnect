package com.careconnect.clinicalservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperatingRoomStatsResponse {
    private long total;
    private long inUse;
    private long available;
    private long cleaning;
}
