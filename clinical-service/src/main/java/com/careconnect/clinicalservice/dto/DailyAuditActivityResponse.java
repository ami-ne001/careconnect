package com.careconnect.clinicalservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyAuditActivityResponse {
    /** Example: "Jun 02" (frontend-friendly) */
    private String day;
    private long logins;
}

