package com.careconnect.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffDepartmentMetricResponse {

    private String departmentName;
    private long activeCount;
    private long totalCount;
    private int activeRate;
}
