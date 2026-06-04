package com.careconnect.clinicalservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeekScheduleBlockResponse {
    private int dayIndex;
    private int startHour;
    private int spanHours;
    private String label;
    private String orName;
    private String colorKey;
}
