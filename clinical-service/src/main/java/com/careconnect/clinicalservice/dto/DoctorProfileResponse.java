package com.careconnect.clinicalservice.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorProfileResponse {
    private Long id;
    private Long userId;
    private Boolean isSurgeon;
    private String specialty;
    private String licenseNumber;
    private Integer yearsExperience;
    private String bio;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
