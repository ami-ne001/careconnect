package com.careconnect.clinicalservice.service;

import com.careconnect.clinicalservice.dto.PrescriptionCreateRequest;
import com.careconnect.clinicalservice.dto.PrescriptionItemDto;
import com.careconnect.clinicalservice.dto.PrescriptionResponse;
import com.careconnect.clinicalservice.entity.AuditLog;
import com.careconnect.clinicalservice.entity.Consultation;
import com.careconnect.clinicalservice.entity.Prescription;
import com.careconnect.clinicalservice.entity.PrescriptionItem;
import com.careconnect.clinicalservice.enums.AuditAction;
import com.careconnect.clinicalservice.enums.ConsultationStatus;
import com.careconnect.clinicalservice.enums.PrescriptionStatus;
import com.careconnect.clinicalservice.exception.BadRequestException;
import com.careconnect.clinicalservice.exception.ResourceNotFoundException;
import com.careconnect.clinicalservice.repository.AuditLogRepository;
import com.careconnect.clinicalservice.repository.ConsultationRepository;
import com.careconnect.clinicalservice.repository.PrescriptionItemRepository;
import com.careconnect.clinicalservice.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final ConsultationRepository consultationRepository;
    private final AuditLogRepository auditLogRepository;

    @Transactional
    public PrescriptionResponse createPrescription(PrescriptionCreateRequest request, Long doctorId) {
        log.info("Creating prescription for consultation ID: {}", request.getConsultationId());

        Consultation consultation = consultationRepository.findById(request.getConsultationId())
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found with id: " + request.getConsultationId()));

        if (consultation.getStatus() == ConsultationStatus.CLOSED) {
            throw new BadRequestException("Cannot write prescription for a closed consultation");
        }

        if (!consultation.getDoctorId().equals(doctorId)) {
            throw new BadRequestException("Only the consulting doctor can write prescriptions for this consultation");
        }

        Prescription prescription = Prescription.builder()
                .consultation(consultation)
                .patientId(request.getPatientId())
                .doctorId(doctorId)
                .notes(request.getNotes())
                .status(PrescriptionStatus.ACTIVE)
                .build();

        List<PrescriptionItem> items = request.getItems().stream().map(dto -> PrescriptionItem.builder()
                .prescription(prescription)
                .medication(dto.getMedication())
                .dosage(dto.getDosage())
                .frequency(dto.getFrequency())
                .durationDays(dto.getDurationDays())
                .quantity(dto.getQuantity())
                .instructions(dto.getInstructions())
                .build()).collect(Collectors.toList());

        prescription.setItems(items);

        Prescription saved = prescriptionRepository.save(prescription);

        // Audit Log
        auditLogRepository.save(AuditLog.builder()
                .userId(doctorId)
                .action(AuditAction.CREATE)
                .module("PRESCRIPTION")
                .description("Created prescription ID: " + saved.getId() + " for patient ID: " + request.getPatientId())
                .ipAddress("127.0.0.1")
                .build());

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public PrescriptionResponse getPrescriptionById(Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with id: " + id));
        return mapToResponse(prescription);
    }

    @Transactional(readOnly = true)
    public List<PrescriptionResponse> getPrescriptionsByPatient(Long patientId) {
        return prescriptionRepository.findByPatientId(patientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public PrescriptionResponse cancelPrescription(Long id, Long doctorId) {
        log.info("Cancelling prescription ID: {}", id);
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with id: " + id));

        if (prescription.getStatus() != PrescriptionStatus.ACTIVE) {
            throw new BadRequestException("Prescription is already " + prescription.getStatus());
        }

        prescription.setStatus(PrescriptionStatus.CANCELLED);
        Prescription saved = prescriptionRepository.save(prescription);

        // Audit Log
        auditLogRepository.save(AuditLog.builder()
                .userId(doctorId)
                .action(AuditAction.UPDATE)
                .module("PRESCRIPTION")
                .description("Cancelled prescription ID: " + saved.getId())
                .ipAddress("127.0.0.1")
                .build());

        return mapToResponse(saved);
    }

    private PrescriptionResponse mapToResponse(Prescription p) {
        List<PrescriptionItemDto> itemDtos = p.getItems().stream().map(i -> PrescriptionItemDto.builder()
                .id(i.getId())
                .medication(i.getMedication())
                .dosage(i.getDosage())
                .frequency(i.getFrequency())
                .durationDays(i.getDurationDays())
                .quantity(i.getQuantity())
                .instructions(i.getInstructions())
                .build()).collect(Collectors.toList());

        return PrescriptionResponse.builder()
                .id(p.getId())
                .consultationId(p.getConsultation().getId())
                .patientId(p.getPatientId())
                .doctorId(p.getDoctorId())
                .issuedAt(p.getIssuedAt())
                .notes(p.getNotes())
                .status(p.getStatus())
                .items(itemDtos)
                .build();
    }
}
