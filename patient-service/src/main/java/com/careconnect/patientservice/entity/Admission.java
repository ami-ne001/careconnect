package com.careconnect.patientservice.entity;

import com.careconnect.patientservice.enums.AdmissionStatus;
import com.careconnect.patientservice.enums.ConditionOnDischarge;
import com.careconnect.patientservice.enums.DischargeStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Inpatient admission record.
 *
 * Cross-DB references (plain Long, no FK constraint):
 *   - admittingDoctorId → auth-service users.id
 *   - createdBy         → auth-service users.id
 *
 * patientId → patient_profiles.id (same DB, but stored as plain Long
 * to keep the service layer consistent; FK enforced in SQL).
 */
@Entity
@Table(name = "admissions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Admission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "admitting_doctor_id", nullable = false)
    private Long admittingDoctorId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "bed_number", nullable = false)
    private Integer bedNumber;

    @Column(name = "admission_date", nullable = false, updatable = false)
    private LocalDateTime admissionDate;

    @Column(name = "expected_discharge_date")
    private LocalDate expectedDischargeDate;

    @Column(name = "actual_discharge_date")
    private LocalDateTime actualDischargeDate;

    @Column(name = "admission_reason", columnDefinition = "TEXT")
    private String admissionReason;

    @Column(name = "diagnosis", length = 255)
    private String diagnosis;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AdmissionStatus status = AdmissionStatus.ADMITTED;

    @Enumerated(EnumType.STRING)
    @Column(name = "discharge_status")
    private DischargeStatus dischargeStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "condition_on_discharge")
    private ConditionOnDischarge conditionOnDischarge;

    @Column(name = "discharge_notes", columnDefinition = "TEXT")
    private String dischargeNotes;

    @Column(name = "follow_up_instructions", columnDefinition = "TEXT")
    private String followUpInstructions;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.admissionDate = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
