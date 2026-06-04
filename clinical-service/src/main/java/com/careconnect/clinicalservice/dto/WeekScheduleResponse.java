package com.careconnect.clinicalservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeekScheduleResponse {
    private LocalDate weekStart;
    private LocalDate weekEnd;
    private List<String> dayLabels;
    private List<WeekScheduleRowResponse> rows;
}
