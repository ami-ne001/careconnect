package com.careconnect.clinicalservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperatingRoomOverviewResponse {
    private OperatingRoomStatsResponse stats;
    private List<OperatingRoomCardResponse> rooms;
    private WeekScheduleResponse weekSchedule;
}
