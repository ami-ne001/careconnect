package com.careconnect.clinicalservice.service;

import com.careconnect.clinicalservice.client.AuthServiceClient;
import com.careconnect.clinicalservice.dto.DoctorProfileResponse;
import com.careconnect.clinicalservice.dto.DoctorProfileUpdateRequest;
import com.careconnect.clinicalservice.dto.UserSummaryResponse;
import com.careconnect.clinicalservice.entity.DoctorProfile;
import com.careconnect.clinicalservice.exception.ResourceNotFoundException;
import com.careconnect.clinicalservice.repository.DoctorProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DoctorProfileService {

    private final DoctorProfileRepository doctorProfileRepository;
    private final AuthServiceClient authServiceClient;

    @Transactional(readOnly = true)
    public DoctorProfileResponse getProfileByUserId(Long userId) {
        DoctorProfile profile = doctorProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    // Call auth-service via Feign to verify if the user exists and is a DOCTOR
                    try {
                        UserSummaryResponse userSummary = authServiceClient.getUserSummary(userId);
                        if ("DOCTOR".equalsIgnoreCase(userSummary.getRole())) {
                            // If they are a doctor but have no profile record, initialize a blank one
                            DoctorProfile newProfile = DoctorProfile.builder()
                                    .userId(userId)
                                    .isSurgeon(false)
                                    .specialty("General Practice")
                                    .yearsExperience(0)
                                    .bio("")
                                    .build();
                            return doctorProfileRepository.save(newProfile);
                        }
                    } catch (Exception e) {
                        log.error("Failed to verify user from auth-service: {}", userId, e);
                    }
                    throw new ResourceNotFoundException("Doctor profile not found for userId: " + userId);
                });

        return mapToResponse(profile);
    }

    @Transactional
    public DoctorProfileResponse createOrUpdateProfile(Long userId, DoctorProfileUpdateRequest request) {
        // Verify user is DOCTOR
        UserSummaryResponse userSummary = authServiceClient.getUserSummary(userId);
        if (!"DOCTOR".equalsIgnoreCase(userSummary.getRole())) {
            throw new IllegalArgumentException("User with ID " + userId + " is not registered as a doctor");
        }

        DoctorProfile profile = doctorProfileRepository.findByUserId(userId)
                .orElse(DoctorProfile.builder().userId(userId).build());

        if (request.getIsSurgeon() != null) {
            profile.setIsSurgeon(request.getIsSurgeon());
        }
        if (request.getSpecialty() != null) {
            profile.setSpecialty(request.getSpecialty());
        }
        if (request.getLicenseNumber() != null) {
            profile.setLicenseNumber(request.getLicenseNumber());
        }
        if (request.getYearsExperience() != null) {
            profile.setYearsExperience(request.getYearsExperience());
        }
        if (request.getBio() != null) {
            profile.setBio(request.getBio());
        }

        DoctorProfile saved = doctorProfileRepository.save(profile);
        return mapToResponse(saved);
    }

    private DoctorProfileResponse mapToResponse(DoctorProfile profile) {
        return DoctorProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUserId())
                .isSurgeon(profile.getIsSurgeon())
                .specialty(profile.getSpecialty())
                .licenseNumber(profile.getLicenseNumber())
                .yearsExperience(profile.getYearsExperience())
                .bio(profile.getBio())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}
