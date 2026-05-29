package com.careconnect.patientservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Stores patient-specific profile data.
 * userId references auth-service users.id (no FK constraint — cross-DB).
 * blood_type is stored as a plain String because the SQL ENUM uses 'A+', 'A-'
 * which cannot be represented directly as Java enum names with @Enumerated(STRING).
 * The BloodType enum is used only in DTOs for input validation.
 * No created_at / updated_at — not present in the SQL schema.
 */
@Entity
@Table(name = "patient_profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "blood_type", length = 5)
    private String bloodType;  // raw SQL ENUM value: 'A+', 'B-', etc.

    @Column(name = "national_id", unique = true, length = 50)
    private String nationalId;

    @Column(name = "insurance_provider", length = 100)
    private String insuranceProvider;

    @Column(name = "insurance_number", length = 80)
    private String insuranceNumber;

    @Column(name = "emergency_contact_name", length = 120)
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone", length = 20)
    private String emergencyContactPhone;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Allergy> allergies = new ArrayList<>();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ChronicCondition> chronicConditions = new ArrayList<>();
}
