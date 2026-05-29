package com.careconnect.patientservice.dto;

import com.careconnect.patientservice.enums.AdmissionStatus;
import com.careconnect.patientservice.enums.ConditionOnDischarge;
import com.careconnect.patientservice.enums.DischargeStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdmissionResponse {
    private Long id;
    private Long patientId;
    private Long admittingDoctorId;
    private RoomResponse room;
    private Integer bedNumber;
    private LocalDateTime admissionDate;
    private LocalDate expectedDischargeDate;
    private LocalDateTime actualDischargeDate;
    private String admissionReason;
    private String diagnosis;
    private AdmissionStatus status;
    private DischargeStatus dischargeStatus;
    private ConditionOnDischarge conditionOnDischarge;
    private String dischargeNotes;
    private String followUpInstructions;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
