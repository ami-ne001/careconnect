package com.careconnect.labservice.entity;

import com.careconnect.labservice.enums.LabRequestPriority;
import com.careconnect.labservice.enums.LabRequestStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "lab_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "consultation_id", nullable = false)
    private Long consultationId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_type_id", nullable = false)
    private LabTestType testType;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    @Builder.Default
    private LabRequestPriority priority = LabRequestPriority.NORMAL;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private LabRequestStatus status = LabRequestStatus.REQUESTED;

    @Column(name = "requested_at", nullable = false, insertable = false, updatable = false, columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime requestedAt;
}
