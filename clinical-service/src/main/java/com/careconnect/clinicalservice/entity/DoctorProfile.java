package com.careconnect.clinicalservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "doctor_profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "is_surgeon", nullable = false)
    private Boolean isSurgeon = false;

    @Column(name = "specialty", length = 100)
    private String specialty;

    @Column(name = "license_number", length = 60, unique = true)
    private String licenseNumber;

    @Column(name = "years_experience")
    private Integer yearsExperience;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "created_at", nullable = false, updatable = false, insertable = false, columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false, insertable = false, columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    private LocalDateTime updatedAt;
}
