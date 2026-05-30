package com.careconnect.labservice.service;

import com.careconnect.labservice.client.AuthServiceClient;
import com.careconnect.labservice.client.ClinicalServiceClient;
import com.careconnect.labservice.client.PatientServiceClient;
import com.careconnect.labservice.dto.ConsultationSummaryResponse;
import com.careconnect.labservice.dto.LabRequestCreateRequest;
import com.careconnect.labservice.dto.LabRequestResponse;
import com.careconnect.labservice.dto.PatientSummaryResponse;
import com.careconnect.labservice.dto.UserSummaryResponse;
import com.careconnect.labservice.entity.LabRequest;
import com.careconnect.labservice.entity.LabTestType;
import com.careconnect.labservice.enums.LabRequestStatus;
import com.careconnect.labservice.exception.BadRequestException;
import com.careconnect.labservice.exception.ResourceNotFoundException;
import com.careconnect.labservice.repository.LabRequestRepository;
import com.careconnect.labservice.repository.LabTestTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LabRequestService {

    private final LabRequestRepository labRequestRepository;
    private final LabTestTypeRepository testTypeRepository;
    private final AuthServiceClient authServiceClient;
    private final PatientServiceClient patientServiceClient;
    private final ClinicalServiceClient clinicalServiceClient;

    @Transactional
    public LabRequestResponse createLabRequest(LabRequestCreateRequest request) {
        log.info("Creating lab request for consultation ID: {}", request.getConsultationId());

        LabTestType testType = testTypeRepository.findById(request.getTestTypeId())
                .orElseThrow(() -> new BadRequestException("Test type not found with ID: " + request.getTestTypeId()));

        try {
            ConsultationSummaryResponse consultation = clinicalServiceClient.getConsultationSummary(request.getConsultationId());
            if (consultation == null) throw new BadRequestException("Consultation not found");
        } catch (Exception e) {
            throw new BadRequestException("Failed to verify consultation: " + e.getMessage());
        }

        try {
            PatientSummaryResponse patient = patientServiceClient.getPatientSummary(request.getPatientId());
            if (patient == null) throw new BadRequestException("Patient not found");
        } catch (Exception e) {
            throw new BadRequestException("Failed to verify patient: " + e.getMessage());
        }

        try {
            UserSummaryResponse doctor = authServiceClient.getUserSummary(request.getDoctorId());
            if (doctor == null || !"DOCTOR".equals(doctor.getRole())) {
                throw new BadRequestException("Doctor not found or invalid role");
            }
        } catch (Exception e) {
            throw new BadRequestException("Failed to verify doctor: " + e.getMessage());
        }

        LabRequest labRequest = LabRequest.builder()
                .consultationId(request.getConsultationId())
                .patientId(request.getPatientId())
                .doctorId(request.getDoctorId())
                .testType(testType)
                .priority(request.getPriority() != null ? request.getPriority() : com.careconnect.labservice.enums.LabRequestPriority.NORMAL)
                .status(LabRequestStatus.REQUESTED)
                .build();

        return mapToResponse(labRequestRepository.save(labRequest));
    }

    @Transactional(readOnly = true)
    public LabRequestResponse getLabRequestById(Long id) {
        LabRequest labRequest = labRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lab request not found with ID: " + id));
        return mapToResponse(labRequest);
    }

    @Transactional(readOnly = true)
    public List<LabRequestResponse> getLabRequestsByPatient(Long patientId) {
        return labRequestRepository.findByPatientId(patientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LabRequestResponse> getLabRequestsByDoctor(Long doctorId) {
        return labRequestRepository.findByDoctorId(doctorId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LabRequestResponse> getLabRequestsByConsultation(Long consultationId) {
        return labRequestRepository.findByConsultationId(consultationId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public LabRequestResponse updateStatus(Long id, LabRequestStatus status) {
        LabRequest labRequest = labRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lab request not found with ID: " + id));

        // Note: Additional state machine validation can be added here
        labRequest.setStatus(status);
        return mapToResponse(labRequestRepository.save(labRequest));
    }

    private LabRequestResponse mapToResponse(LabRequest entity) {
        return LabRequestResponse.builder()
                .id(entity.getId())
                .consultationId(entity.getConsultationId())
                .patientId(entity.getPatientId())
                .doctorId(entity.getDoctorId())
                .testTypeId(entity.getTestType().getId())
                .testTypeName(entity.getTestType().getName())
                .priority(entity.getPriority())
                .status(entity.getStatus())
                .requestedAt(entity.getRequestedAt())
                .build();
    }
}
