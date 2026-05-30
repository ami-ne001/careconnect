package com.careconnect.labservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabResultResponse {
    private Long id;
    private Long labRequestId;
    private Long technicianId;
    private String resultData;
    private String interpretation;
    private LocalDateTime uploadedAt;
}
