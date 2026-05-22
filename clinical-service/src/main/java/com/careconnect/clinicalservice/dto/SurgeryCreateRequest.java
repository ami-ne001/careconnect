package com.careconnect.clinicalservice.dto;

import com.careconnect.clinicalservice.enums.SurgeryPriority;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SurgeryCreateRequest {
    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Lead surgeon ID is required")
    private Long leadSurgeonId;

    private Long assistingSurgeonId;
    private Long assistingNurseId;

    @NotNull(message = "Operating room ID is required")
    private Long operatingRoomId;

    private Long admissionId;

    @NotNull(message = "Surgery type is required")
    private String surgeryType;

    private SurgeryPriority priority;

    @NotNull(message = "Scheduled time is required")
    private LocalDateTime scheduledAt;

    private Integer estimatedDuration;
    private String preOpNotes;
    private String specialEquipment;
}
