package com.careconnect.patientservice.service;

import com.careconnect.patientservice.dto.AdmissionCreateRequest;
import com.careconnect.patientservice.dto.AdmissionResponse;
import com.careconnect.patientservice.dto.AdmissionUpdateRequest;
import com.careconnect.patientservice.dto.DischargeRequest;
import com.careconnect.patientservice.dto.RoomResponse;
import com.careconnect.patientservice.entity.Admission;
import com.careconnect.patientservice.entity.Notification;
import com.careconnect.patientservice.entity.PatientProfile;
import com.careconnect.patientservice.entity.Room;
import com.careconnect.patientservice.enums.AdmissionStatus;
import com.careconnect.patientservice.enums.NotificationType;
import com.careconnect.patientservice.enums.RoomStatus;
import com.careconnect.patientservice.exception.BadRequestException;
import com.careconnect.patientservice.exception.ResourceNotFoundException;
import com.careconnect.patientservice.messaging.EventPublisher;
import com.careconnect.patientservice.messaging.PatientAdmittedEvent;
import com.careconnect.patientservice.messaging.PatientDischargedEvent;
import com.careconnect.patientservice.repository.AdmissionRepository;
import com.careconnect.patientservice.repository.NotificationRepository;
import com.careconnect.patientservice.repository.PatientProfileRepository;
import com.careconnect.patientservice.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdmissionService {

    private final AdmissionRepository admissionRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final RoomRepository roomRepository;
    private final NotificationRepository notificationRepository;
    private final EventPublisher eventPublisher;

    @Transactional
    public AdmissionResponse admitPatient(AdmissionCreateRequest request, Long receptionistUserId) {
        PatientProfile patient = patientProfileRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found with id: " + request.getPatientId()));

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + request.getRoomId()));

        if (room.getStatus() != RoomStatus.AVAILABLE) {
            throw new BadRequestException("Room is not available for admission (status: " + room.getStatus() + ")");
        }

        // 1. Mark room as occupied
        room.setStatus(RoomStatus.OCCUPIED);
        roomRepository.save(room);

        // 2. Create admission record
        Admission admission = Admission.builder()
                .patientId(patient.getId())
                .admittingDoctorId(request.getAdmittingDoctorId())
                .room(room)
                .bedNumber(request.getBedNumber())
                .expectedDischargeDate(request.getExpectedDischargeDate())
                .admissionReason(request.getAdmissionReason())
                .diagnosis(request.getDiagnosis())
                .status(AdmissionStatus.ADMITTED)
                .createdBy(receptionistUserId)
                .build();

        Admission saved = admissionRepository.save(admission);

        // 3. Publish PatientAdmittedEvent
        try {
            PatientAdmittedEvent admittedEvent = PatientAdmittedEvent.builder()
                    .patientId(patient.getId())
                    .admissionId(saved.getId())
                    .roomNumber(room.getRoomNumber())
                    .wardName(room.getWard().getName())
                    .build();
            eventPublisher.publishPatientAdmitted(admittedEvent);
        } catch (Exception e) {
            log.error("Failed to publish PatientAdmittedEvent for admission ID: {}", saved.getId(), e);
        }

        // 4. Create patient notification
        try {
            Notification notification = Notification.builder()
                    .userId(patient.getUserId())
                    .type(NotificationType.PATIENT_ADMITTED)
                    .title("Admitted to Ward")
                    .message("You have been admitted to ward '" + room.getWard().getName() + "', room '" + room.getRoomNumber() + "', bed " + saved.getBedNumber() + ".")
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();
            notificationRepository.save(notification);
        } catch (Exception e) {
            log.error("Failed to create admission notification for patient user ID: {}", patient.getUserId(), e);
        }

        return mapToResponse(saved);
    }

    public List<AdmissionResponse> getAllAdmissions() {
        return admissionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public AdmissionResponse getAdmissionById(Long id) {
        Admission admission = admissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admission not found with id: " + id));
        return mapToResponse(admission);
    }

    public List<AdmissionResponse> getAdmissionsByPatientId(Long patientId) {
        if (!patientProfileRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient profile not found with id: " + patientId);
        }
        return admissionRepository.findByPatientId(patientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<AdmissionResponse> getActiveAdmissions() {
        return admissionRepository.findByStatus(AdmissionStatus.ADMITTED).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdmissionResponse updateAdmission(Long id, AdmissionUpdateRequest request) {
        Admission admission = admissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admission not found with id: " + id));

        if (admission.getStatus() == AdmissionStatus.DISCHARGED) {
            throw new BadRequestException("Cannot update details of a discharged patient");
        }

        if (request.getAdmittingDoctorId() != null) {
            admission.setAdmittingDoctorId(request.getAdmittingDoctorId());
        }
        if (request.getExpectedDischargeDate() != null) {
            admission.setExpectedDischargeDate(request.getExpectedDischargeDate());
        }
        if (request.getAdmissionReason() != null) {
            admission.setAdmissionReason(request.getAdmissionReason());
        }
        if (request.getDiagnosis() != null) {
            admission.setDiagnosis(request.getDiagnosis());
        }

        if (request.getRoomId() != null && !request.getRoomId().equals(admission.getRoom().getId())) {
            Room oldRoom = admission.getRoom();
            Room newRoom = roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new ResourceNotFoundException("New Room not found with id: " + request.getRoomId()));

            if (newRoom.getStatus() != RoomStatus.AVAILABLE) {
                throw new BadRequestException("New Room is not available");
            }

            // Transfer bed occupancy
            oldRoom.setStatus(RoomStatus.AVAILABLE);
            newRoom.setStatus(RoomStatus.OCCUPIED);
            roomRepository.save(oldRoom);
            roomRepository.save(newRoom);

            admission.setRoom(newRoom);
        }

        if (request.getBedNumber() != null) {
            admission.setBedNumber(request.getBedNumber());
        }

        return mapToResponse(admissionRepository.save(admission));
    }

    @Transactional
    public AdmissionResponse dischargePatient(Long id, DischargeRequest request) {
        Admission admission = admissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admission not found with id: " + id));

        if (admission.getStatus() == AdmissionStatus.DISCHARGED) {
            throw new BadRequestException("Patient has already been discharged");
        }

        Room room = admission.getRoom();
        PatientProfile patient = patientProfileRepository.findById(admission.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for patient id: " + admission.getPatientId()));

        // 1. Release room
        room.setStatus(RoomStatus.AVAILABLE);
        roomRepository.save(room);

        // 2. Complete discharge fields
        admission.setStatus(AdmissionStatus.DISCHARGED);
        admission.setDischargeStatus(request.getDischargeStatus());
        admission.setConditionOnDischarge(request.getConditionOnDischarge());
        admission.setDischargeNotes(request.getDischargeNotes());
        admission.setFollowUpInstructions(request.getFollowUpInstructions());
        admission.setActualDischargeDate(LocalDateTime.now());

        Admission saved = admissionRepository.save(admission);

        // 3. Publish PatientDischargedEvent
        try {
            PatientDischargedEvent dischargedEvent = PatientDischargedEvent.builder()
                    .patientId(patient.getId())
                    .admissionId(saved.getId())
                    .dischargedAt(saved.getActualDischargeDate())
                    .dischargeStatus(saved.getDischargeStatus().name())
                    .build();
            eventPublisher.publishPatientDischarged(dischargedEvent);
        } catch (Exception e) {
            log.error("Failed to publish PatientDischargedEvent for admission ID: {}", saved.getId(), e);
        }

        // 4. Create patient notification
        try {
            Notification notification = Notification.builder()
                    .userId(patient.getUserId())
                    .type(NotificationType.PATIENT_DISCHARGED)
                    .title("Discharged from Hospital")
                    .message("You have been discharged. Status: " + saved.getDischargeStatus() + ". Follow up instructions: " + saved.getFollowUpInstructions())
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();
            notificationRepository.save(notification);
        } catch (Exception e) {
            log.error("Failed to create discharge notification for patient user ID: {}", patient.getUserId(), e);
        }

        return mapToResponse(saved);
    }

    private AdmissionResponse mapToResponse(Admission admission) {
        RoomResponse roomResponse = RoomResponse.builder()
                .id(admission.getRoom().getId())
                .wardId(admission.getRoom().getWard().getId())
                .roomNumber(admission.getRoom().getRoomNumber())
                .bedCount(admission.getRoom().getBedCount())
                .status(admission.getRoom().getStatus())
                .notes(admission.getRoom().getNotes())
                .build();

        return AdmissionResponse.builder()
                .id(admission.getId())
                .patientId(admission.getPatientId())
                .admittingDoctorId(admission.getAdmittingDoctorId())
                .room(roomResponse)
                .bedNumber(admission.getBedNumber())
                .admissionDate(admission.getAdmissionDate())
                .expectedDischargeDate(admission.getExpectedDischargeDate())
                .actualDischargeDate(admission.getActualDischargeDate())
                .admissionReason(admission.getAdmissionReason())
                .diagnosis(admission.getDiagnosis())
                .status(admission.getStatus())
                .dischargeStatus(admission.getDischargeStatus())
                .conditionOnDischarge(admission.getConditionOnDischarge())
                .dischargeNotes(admission.getDischargeNotes())
                .followUpInstructions(admission.getFollowUpInstructions())
                .createdBy(admission.getCreatedBy())
                .createdAt(admission.getCreatedAt())
                .updatedAt(admission.getUpdatedAt())
                .build();
    }
}
