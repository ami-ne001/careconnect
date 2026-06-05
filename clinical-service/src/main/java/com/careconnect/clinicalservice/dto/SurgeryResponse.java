package com.careconnect.clinicalservice.dto;

import com.careconnect.clinicalservice.enums.SurgeryOutcome;
import com.careconnect.clinicalservice.enums.SurgeryPriority;
import com.careconnect.clinicalservice.enums.SurgeryStatus;
import lombok.*;
import lombok.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SurgeryResponse {
    private Long id;
    private Long patientId;
    private Long leadSurgeonId;
    private Long assistingSurgeonId;
    private Long assistingNurseId;
    private Long operatingRoomId;
    private String operatingRoomName;
    private Long admissionId;
    private String surgeryType;
    private SurgeryPriority priority;
    private SurgeryStatus status;
    private LocalDateTime scheduledAt;
    private Integer estimatedDuration;
    private LocalDateTime actualStartAt;
    private LocalDateTime actualEndAt;
    private String preOpNotes;
    private String postOpNotes;
    private SurgeryOutcome outcome;
    private String specialEquipment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private BigDecimal price;
}
