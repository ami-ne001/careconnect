package com.careconnect.clinicalservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "prescription_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;

    @Column(name = "medication", nullable = false, length = 150)
    private String medication;

    @Column(name = "dosage", nullable = false, length = 80)
    private String dosage;

    @Column(name = "frequency", nullable = false, length = 80)
    private String frequency;

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "instructions", columnDefinition = "TEXT")
    private String instructions;
}
