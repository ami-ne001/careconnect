package com.careconnect.clinicalservice.service;

import com.careconnect.clinicalservice.client.AppointmentServiceClient;
import com.careconnect.clinicalservice.client.AuthServiceClient;
import com.careconnect.clinicalservice.client.PatientServiceClient;
import com.careconnect.clinicalservice.dto.AppointmentResponse;
import com.careconnect.clinicalservice.dto.ConsultationCreateRequest;
import com.careconnect.clinicalservice.dto.ConsultationResponse;
import com.careconnect.clinicalservice.dto.ConsultationUpdateRequest;
import com.careconnect.clinicalservice.dto.PatientResponse;
import com.careconnect.clinicalservice.dto.UserSummaryResponse;
import com.careconnect.clinicalservice.entity.AuditLog;
import com.careconnect.clinicalservice.entity.Consultation;
import com.careconnect.clinicalservice.enums.AuditAction;
import com.careconnect.clinicalservice.enums.ConsultationStatus;
import com.careconnect.clinicalservice.exception.BadRequestException;
import com.careconnect.clinicalservice.exception.ResourceNotFoundException;
import com.careconnect.clinicalservice.messaging.ConsultationClosedEvent;
import com.careconnect.clinicalservice.messaging.EventPublisher;
import com.careconnect.clinicalservice.repository.AuditLogRepository;
import com.careconnect.clinicalservice.repository.ConsultationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final AuditLogRepository auditLogRepository;
    private final AuthServiceClient authServiceClient;
    private final PatientServiceClient patientServiceClient;
    private final AppointmentServiceClient appointmentServiceClient;
    private final EventPublisher eventPublisher;

    @Transactional
    public ConsultationResponse createConsultation(ConsultationCreateRequest request) {
        log.info("Creating consultation for appointment ID: {}", request.getAppointmentId());
        
        // Verify unique appointment ID
        if (consultationRepository.findByAppointmentId(request.getAppointmentId()).isPresent()) {
            throw new BadRequestException("Consultation already exists for appointment ID: " + request.getAppointmentId());
        }

        // Verify appointment exists and matches doctor and patient
        try {
            AppointmentResponse appointment = appointmentServiceClient.getAppointmentById(request.getAppointmentId());
            if (appointment == null) {
                throw new BadRequestException("Appointment not found with ID: " + request.getAppointmentId());
            }
            if (!appointment.getPatientId().equals(request.getPatientId())) {
                throw new BadRequestException("Patient ID in request does not match the appointment patient");
            }
            if (!appointment.getDoctorId().equals(request.getDoctorId())) {
                throw new BadRequestException("Doctor ID in request does not match the appointment doctor");
            }
        } catch (Exception e) {
            throw new BadRequestException("Failed to verify appointment with ID " + request.getAppointmentId() + ": " + e.getMessage());
        }

        // Verify patient exists
        try {
            PatientResponse patient = patientServiceClient.getPatientById(request.getPatientId());
            if (patient == null) {
                throw new BadRequestException("Patient not found with ID: " + request.getPatientId());
            }
        } catch (Exception e) {
            throw new BadRequestException("Failed to verify patient with ID " + request.getPatientId() + ": " + e.getMessage());
        }

        // Verify doctor exists
        try {
            UserSummaryResponse doctor = authServiceClient.getUserSummary(request.getDoctorId());
            if (!"DOCTOR".equalsIgnoreCase(doctor.getRole())) {
                throw new BadRequestException("User with ID " + request.getDoctorId() + " is not registered as a doctor");
            }
        } catch (Exception e) {
            throw new BadRequestException("Failed to verify doctor with ID " + request.getDoctorId() + ": " + e.getMessage());
        }

        Consultation consultation = Consultation.builder()
                .appointmentId(request.getAppointmentId())
                .patientId(request.getPatientId())
                .doctorId(request.getDoctorId())
                .symptoms(request.getSymptoms())
                .diagnosis(request.getDiagnosis())
                .clinicalNotes(request.getClinicalNotes())
                .status(ConsultationStatus.OPEN)
                .build();

        Consultation saved = consultationRepository.save(consultation);

        // Audit Log
        auditLogRepository.save(AuditLog.builder()
                .userId(request.getDoctorId())
                .action(AuditAction.CREATE)
                .module("CONSULTATION")
                .description("Created consultation ID: " + saved.getId() + " for appointment: " + request.getAppointmentId())
                .ipAddress("127.0.0.1")
                .build());

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public ConsultationResponse getConsultationById(Long id) {
        Consultation consultation = consultationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found with id: " + id));
        return mapToResponse(consultation);
    }

    @Transactional(readOnly = true)
    public List<ConsultationResponse> getConsultationsByPatient(Long patientId) {
        return consultationRepository.findByPatientId(patientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ConsultationResponse> getConsultationsByDoctor(Long doctorId) {
        return consultationRepository.findByDoctorId(doctorId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ConsultationResponse updateConsultation(Long id, ConsultationUpdateRequest request, Long updaterId) {
        log.info("Updating consultation ID: {}", id);
        Consultation consultation = consultationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found with id: " + id));

        if (consultation.getStatus() == ConsultationStatus.CLOSED) {
            throw new BadRequestException("Cannot update a closed consultation");
        }

        if (request.getSymptoms() != null) {
            consultation.setSymptoms(request.getSymptoms());
        }
        if (request.getDiagnosis() != null) {
            consultation.setDiagnosis(request.getDiagnosis());
        }
        if (request.getClinicalNotes() != null) {
            consultation.setClinicalNotes(request.getClinicalNotes());
        }

        if (request.getStatus() != null && request.getStatus() != consultation.getStatus()) {
            if (request.getStatus() == ConsultationStatus.CLOSED) {
                closeConsultationInternal(consultation);
            } else {
                consultation.setStatus(request.getStatus());
            }
        }

        Consultation saved = consultationRepository.save(consultation);

        // Audit Log
        auditLogRepository.save(AuditLog.builder()
                .userId(updaterId)
                .action(AuditAction.UPDATE)
                .module("CONSULTATION")
                .description("Updated consultation ID: " + saved.getId() + ", status: " + saved.getStatus())
                .ipAddress("127.0.0.1")
                .build());

        return mapToResponse(saved);
    }

    private void closeConsultationInternal(Consultation consultation) {
        consultation.setStatus(ConsultationStatus.CLOSED);
        consultation.setClosedAt(LocalDateTime.now());

        // Publish event for billing-service
        ConsultationClosedEvent event = ConsultationClosedEvent.builder()
                .consultationId(consultation.getId())
                .patientId(consultation.getPatientId())
                .doctorId(consultation.getDoctorId())
                .diagnosis(consultation.getDiagnosis())
                .consultationFee(new BigDecimal("50.00")) // standard standard consultation fee
                .build();
        eventPublisher.publishConsultationClosed(event);
    }

    private ConsultationResponse mapToResponse(Consultation c) {
        return ConsultationResponse.builder()
                .id(c.getId())
                .appointmentId(c.getAppointmentId())
                .patientId(c.getPatientId())
                .doctorId(c.getDoctorId())
                .symptoms(c.getSymptoms())
                .diagnosis(c.getDiagnosis())
                .clinicalNotes(c.getClinicalNotes())
                .status(c.getStatus())
                .startedAt(c.getStartedAt())
                .closedAt(c.getClosedAt())
                .build();
    }
}
