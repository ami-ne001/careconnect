package com.careconnect.clinicalservice.dto;

import com.careconnect.clinicalservice.enums.SurgeryOutcome;
import com.careconnect.clinicalservice.enums.SurgeryPriority;
import com.careconnect.clinicalservice.enums.SurgeryStatus;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SurgeryUpdateRequest {
    private Long assistingSurgeonId;
    private Long assistingNurseId;
    private Long operatingRoomId;
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
}
