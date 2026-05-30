package com.careconnect.labservice.dto;

import com.careconnect.labservice.enums.LabRequestPriority;
import com.careconnect.labservice.enums.LabRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabRequestResponse {
    private Long id;
    private Long consultationId;
    private Long patientId;
    private Long doctorId;
    private Long testTypeId;
    private String testTypeName;
    private LabRequestPriority priority;
    private LabRequestStatus status;
    private LocalDateTime requestedAt;
}
