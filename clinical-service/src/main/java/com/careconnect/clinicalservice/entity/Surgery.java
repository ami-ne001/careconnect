package com.careconnect.clinicalservice.entity;

import com.careconnect.clinicalservice.enums.SurgeryOutcome;
import com.careconnect.clinicalservice.enums.SurgeryPriority;
import com.careconnect.clinicalservice.enums.SurgeryStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "surgeries")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Surgery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "lead_surgeon_id", nullable = false)
    private Long leadSurgeonId;

    @Column(name = "assisting_surgeon_id")
    private Long assistingSurgeonId;

    @Column(name = "assisting_nurse_id")
    private Long assistingNurseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operating_room_id", nullable = false)
    private OperatingRoom operatingRoom;

    @Column(name = "admission_id")
    private Long admissionId;

    @Column(name = "surgery_type", nullable = false, length = 150)
    private String surgeryType;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    @Builder.Default
    private SurgeryPriority priority = SurgeryPriority.ELECTIVE;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private SurgeryStatus status = SurgeryStatus.SCHEDULED;

    @Column(name = "scheduled_at", nullable = false)
    private LocalDateTime scheduledAt;

    @Column(name = "estimated_duration", nullable = false)
    @Builder.Default
    private Integer estimatedDuration = 60;

    @Column(name = "actual_start_at")
    private LocalDateTime actualStartAt;

    @Column(name = "actual_end_at")
    private LocalDateTime actualEndAt;

    @Column(name = "pre_op_notes", columnDefinition = "TEXT")
    private String preOpNotes;

    @Column(name = "post_op_notes", columnDefinition = "TEXT")
    private String postOpNotes;

    @Enumerated(EnumType.STRING)
    @Column(name = "outcome")
    private SurgeryOutcome outcome;

    @Column(name = "special_equipment", length = 255)
    private String specialEquipment;

    @Column(name = "created_at", nullable = false, updatable = false, insertable = false, columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false, insertable = false, columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    private LocalDateTime updatedAt;
}
