package com.careconnect.labservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lab_test_types")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabTestType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, unique = true, length = 150)
    private String name;

    @Column(name = "category", length = 80)
    private String category;

    @Column(name = "sample_type", length = 60)
    private String sampleType;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}
