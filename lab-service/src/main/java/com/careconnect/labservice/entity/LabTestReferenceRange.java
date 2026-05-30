package com.careconnect.labservice.entity;

import com.careconnect.labservice.enums.Gender;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "lab_test_reference_ranges")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabTestReferenceRange {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_type_id", nullable = false)
    private LabTestType testType;

    @Column(name = "component", nullable = false, length = 100)
    private String component;

    @Column(name = "unit", length = 30)
    private String unit;

    @Column(name = "min_value", precision = 10, scale = 2)
    private BigDecimal minValue;

    @Column(name = "max_value", precision = 10, scale = 2)
    private BigDecimal maxValue;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender")
    @Builder.Default
    private Gender gender = Gender.BOTH;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
