package com.careconnect.clinicalservice.service;

import com.careconnect.clinicalservice.dto.VitalsCreateRequest;
import com.careconnect.clinicalservice.dto.VitalsResponse;
import com.careconnect.clinicalservice.entity.AuditLog;
import com.careconnect.clinicalservice.entity.Consultation;
import com.careconnect.clinicalservice.entity.Surgery;
import com.careconnect.clinicalservice.entity.Vital;
import com.careconnect.clinicalservice.enums.AuditAction;
import com.careconnect.clinicalservice.exception.ResourceNotFoundException;
import com.careconnect.clinicalservice.repository.AuditLogRepository;
import com.careconnect.clinicalservice.repository.ConsultationRepository;
import com.careconnect.clinicalservice.repository.SurgeryRepository;
import com.careconnect.clinicalservice.repository.VitalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VitalService {

    private final VitalRepository vitalRepository;
    private final ConsultationRepository consultationRepository;
    private final SurgeryRepository surgeryRepository;
    private final AuditLogRepository auditLogRepository;

    @Transactional
    public VitalsResponse recordVitals(VitalsCreateRequest request, Long recordedByUserId) {
        log.info("Recording vitals for patient ID: {}", request.getPatientId());

        Consultation consultation = null;
        if (request.getConsultationId() != null) {
            consultation = consultationRepository.findById(request.getConsultationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Consultation not found with id: " + request.getConsultationId()));
        }

        Surgery surgery = null;
        if (request.getSurgeryId() != null) {
            surgery = surgeryRepository.findById(request.getSurgeryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Surgery not found with id: " + request.getSurgeryId()));
        }

        Vital vital = Vital.builder()
                .patientId(request.getPatientId())
                .consultation(consultation)
                .admissionId(request.getAdmissionId())
                .surgery(surgery)
                .recordedBy(recordedByUserId)
                .bpSystolic(request.getBpSystolic())
                .bpDiastolic(request.getBpDiastolic())
                .heartRate(request.getHeartRate())
                .temperature(request.getTemperature())
                .oxygenSat(request.getOxygenSat())
                .weightKg(request.getWeightKg())
                .heightCm(request.getHeightCm())
                .notes(request.getNotes())
                .build();

        Vital saved = vitalRepository.save(vital);

        // Audit Log
        auditLogRepository.save(AuditLog.builder()
                .userId(recordedByUserId)
                .action(AuditAction.CREATE)
                .module("VITALS")
                .description("Recorded vitals ID: " + saved.getId() + " for patient ID: " + request.getPatientId())
                .ipAddress("127.0.0.1")
                .build());

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<VitalsResponse> getVitalsByPatient(Long patientId) {
        return vitalRepository.findByPatientId(patientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VitalsResponse getLatestVitalsByPatient(Long patientId) {
        Vital vital = vitalRepository.findFirstByPatientIdOrderByRecordedAtDesc(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("No vitals recorded for patient ID: " + patientId));
        return mapToResponse(vital);
    }

    private VitalsResponse mapToResponse(Vital v) {
        return VitalsResponse.builder()
                .id(v.getId())
                .patientId(v.getPatientId())
                .consultationId(v.getConsultation() != null ? v.getConsultation().getId() : null)
                .admissionId(v.getAdmissionId())
                .surgeryId(v.getSurgery() != null ? v.getSurgery().getId() : null)
                .recordedBy(v.getRecordedBy())
                .bpSystolic(v.getBpSystolic())
                .bpDiastolic(v.getBpDiastolic())
                .heartRate(v.getHeartRate())
                .temperature(v.getTemperature())
                .oxygenSat(v.getOxygenSat())
                .weightKg(v.getWeightKg())
                .heightCm(v.getHeightCm())
                .notes(v.getNotes())
                .recordedAt(v.getRecordedAt())
                .build();
    }
}
