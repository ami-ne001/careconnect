package com.careconnect.patientservice.service;

import com.careconnect.patientservice.dto.*;
import com.careconnect.patientservice.entity.Allergy;
import com.careconnect.patientservice.entity.ChronicCondition;
import com.careconnect.patientservice.entity.PatientProfile;
import com.careconnect.patientservice.exception.BadRequestException;
import com.careconnect.patientservice.exception.ResourceNotFoundException;
import com.careconnect.patientservice.feign.AuthServiceClient;
import com.careconnect.patientservice.repository.AllergyRepository;
import com.careconnect.patientservice.repository.ChronicConditionRepository;
import com.careconnect.patientservice.repository.PatientProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PatientProfileService {

    private final PatientProfileRepository patientProfileRepository;
    private final AllergyRepository allergyRepository;
    private final ChronicConditionRepository chronicConditionRepository;
    private final AuthServiceClient authServiceClient;

    @Transactional
    public PatientProfileResponse createPatientProfile(PatientProfileCreateRequest request) {
        if (patientProfileRepository.findByUserId(request.getUserId()).isPresent()) {
            throw new BadRequestException("Patient profile already exists for user ID: " + request.getUserId());
        }

        // Try calling auth-service to make sure the user exists and has correct info (optional safeguard but highly recommended)
        try {
            authServiceClient.getUserSummary(request.getUserId());
        } catch (Exception e) {
            log.warn("Could not verify user existence in auth-service for ID {}: {}", request.getUserId(), e.getMessage());
        }

        PatientProfile profile = PatientProfile.builder()
                .userId(request.getUserId())
                .bloodType(request.getBloodType())
                .nationalId(request.getNationalId())
                .insuranceProvider(request.getInsuranceProvider())
                .insuranceNumber(request.getInsuranceNumber())
                .emergencyContactName(request.getEmergencyContactName())
                .emergencyContactPhone(request.getEmergencyContactPhone())
                .allergies(new ArrayList<>())
                .chronicConditions(new ArrayList<>())
                .build();

        if (request.getAllergies() != null) {
            for (AllergyRequest allergyReq : request.getAllergies()) {
                Allergy allergy = Allergy.builder()
                        .patient(profile)
                        .allergen(allergyReq.getAllergen())
                        .severity(allergyReq.getSeverity())
                        .notes(allergyReq.getNotes())
                        .build();
                profile.getAllergies().add(allergy);
            }
        }

        if (request.getChronicConditions() != null) {
            for (ChronicConditionRequest condReq : request.getChronicConditions()) {
                ChronicCondition condition = ChronicCondition.builder()
                        .patient(profile)
                        .conditionName(condReq.getConditionName())
                        .diagnosed(condReq.getDiagnosed())
                        .notes(condReq.getNotes())
                        .build();
                profile.getChronicConditions().add(condition);
            }
        }

        return mapToResponse(patientProfileRepository.save(profile));
    }

    public Page<PatientProfileResponse> getAllPatientProfiles(Pageable pageable) {
        return patientProfileRepository.findAll(pageable).map(this::mapToResponse);
    }

    public PatientProfileResponse getPatientProfileById(Long id) {
        PatientProfile profile = patientProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found with id: " + id));
        return mapToResponse(profile);
    }

    public PatientProfileResponse getPatientProfileByUserId(Long userId) {
        PatientProfile profile = patientProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for user ID: " + userId));
        return mapToResponse(profile);
    }

    @Transactional
    public PatientProfileResponse updatePatientProfile(Long id, PatientProfileUpdateRequest request) {
        PatientProfile profile = patientProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found with id: " + id));

        if (request.getBloodType() != null) {
            profile.setBloodType(request.getBloodType());
        }
        if (request.getNationalId() != null) {
            profile.setNationalId(request.getNationalId());
        }
        if (request.getInsuranceProvider() != null) {
            profile.setInsuranceProvider(request.getInsuranceProvider());
        }
        if (request.getInsuranceNumber() != null) {
            profile.setInsuranceNumber(request.getInsuranceNumber());
        }
        if (request.getEmergencyContactName() != null) {
            profile.setEmergencyContactName(request.getEmergencyContactName());
        }
        if (request.getEmergencyContactPhone() != null) {
            profile.setEmergencyContactPhone(request.getEmergencyContactPhone());
        }

        return mapToResponse(patientProfileRepository.save(profile));
    }

    @Transactional
    public AllergyResponse addAllergy(Long id, AllergyRequest request) {
        PatientProfile profile = patientProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found with id: " + id));

        Allergy allergy = Allergy.builder()
                .patient(profile)
                .allergen(request.getAllergen())
                .severity(request.getSeverity())
                .notes(request.getNotes())
                .build();

        Allergy saved = allergyRepository.save(allergy);
        profile.getAllergies().add(saved);
        return mapAllergyToResponse(saved);
    }

    @Transactional
    public void removeAllergy(Long id, Long allergyId) {
        PatientProfile profile = patientProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found with id: " + id));

        Allergy allergy = allergyRepository.findById(allergyId)
                .orElseThrow(() -> new ResourceNotFoundException("Allergy not found with id: " + allergyId));

        if (!allergy.getPatient().getId().equals(profile.getId())) {
            throw new BadRequestException("Allergy does not belong to this patient profile");
        }

        profile.getAllergies().remove(allergy);
        allergyRepository.delete(allergy);
    }

    @Transactional
    public ChronicConditionResponse addChronicCondition(Long id, ChronicConditionRequest request) {
        PatientProfile profile = patientProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found with id: " + id));

        ChronicCondition condition = ChronicCondition.builder()
                .patient(profile)
                .conditionName(request.getConditionName())
                .diagnosed(request.getDiagnosed())
                .notes(request.getNotes())
                .build();

        ChronicCondition saved = chronicConditionRepository.save(condition);
        profile.getChronicConditions().add(saved);
        return mapConditionToResponse(saved);
    }

    @Transactional
    public void removeChronicCondition(Long id, Long conditionId) {
        PatientProfile profile = patientProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found with id: " + id));

        ChronicCondition condition = chronicConditionRepository.findById(conditionId)
                .orElseThrow(() -> new ResourceNotFoundException("Chronic condition not found with id: " + conditionId));

        if (!condition.getPatient().getId().equals(profile.getId())) {
            throw new BadRequestException("Chronic condition does not belong to this patient profile");
        }

        profile.getChronicConditions().remove(condition);
        chronicConditionRepository.delete(condition);
    }

    // Used by internal endpoints
    public PatientSummaryResponse getPatientSummaryById(Long id) {
        PatientProfile profile = patientProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found with id: " + id));
        return getPatientSummary(profile);
    }

    public PatientSummaryResponse getPatientSummaryByUserId(Long userId) {
        PatientProfile profile = patientProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for user ID: " + userId));
        return getPatientSummary(profile);
    }

    private PatientSummaryResponse getPatientSummary(PatientProfile profile) {
        String firstName = "";
        String lastName = "";
        try {
            UserSummaryResponse userSummary = authServiceClient.getUserSummary(profile.getUserId());
            if (userSummary != null) {
                firstName = userSummary.getFirstName();
                lastName = userSummary.getLastName();
            }
        } catch (Exception e) {
            log.error("Failed to fetch user summary from auth-service for user ID: {}", profile.getUserId(), e);
        }

        return PatientSummaryResponse.builder()
                .id(profile.getId())
                .userId(profile.getUserId())
                .firstName(firstName)
                .lastName(lastName)
                .bloodType(profile.getBloodType())
                .insuranceProvider(profile.getInsuranceProvider())
                .insuranceNumber(profile.getInsuranceNumber())
                .build();
    }

    private PatientProfileResponse mapToResponse(PatientProfile profile) {
        List<AllergyResponse> allergies = profile.getAllergies().stream()
                .map(this::mapAllergyToResponse)
                .collect(Collectors.toList());

        List<ChronicConditionResponse> conditions = profile.getChronicConditions().stream()
                .map(this::mapConditionToResponse)
                .collect(Collectors.toList());

        return PatientProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUserId())
                .bloodType(profile.getBloodType())
                .nationalId(profile.getNationalId())
                .insuranceProvider(profile.getInsuranceProvider())
                .insuranceNumber(profile.getInsuranceNumber())
                .emergencyContactName(profile.getEmergencyContactName())
                .emergencyContactPhone(profile.getEmergencyContactPhone())
                .allergies(allergies)
                .chronicConditions(conditions)
                .build();
    }

    private AllergyResponse mapAllergyToResponse(Allergy allergy) {
        return AllergyResponse.builder()
                .id(allergy.getId())
                .allergen(allergy.getAllergen())
                .severity(allergy.getSeverity())
                .notes(allergy.getNotes())
                .recordedAt(allergy.getRecordedAt())
                .build();
    }

    private ChronicConditionResponse mapConditionToResponse(ChronicCondition condition) {
        return ChronicConditionResponse.builder()
                .id(condition.getId())
                .conditionName(condition.getConditionName())
                .diagnosed(condition.getDiagnosed())
                .notes(condition.getNotes())
                .build();
    }
}
