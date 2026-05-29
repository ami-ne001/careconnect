package com.careconnect.patientservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * Chronic condition for a patient.
 * Column names: condition_name, diagnosed (LocalDate), notes.
 * No created_at — not in SQL schema.
 */
@Entity
@Table(name = "chronic_conditions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChronicCondition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private PatientProfile patient;

    @Column(name = "condition_name", nullable = false, length = 150)
    private String conditionName;

    @Column
    private LocalDate diagnosed;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
