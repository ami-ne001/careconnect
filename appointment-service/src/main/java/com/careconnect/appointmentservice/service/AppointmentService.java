package com.careconnect.appointmentservice.service;

import com.careconnect.appointmentservice.dto.AppointmentCreateRequest;
import com.careconnect.appointmentservice.dto.AppointmentResponse;
import com.careconnect.appointmentservice.dto.AppointmentStatusUpdateRequest;
import com.careconnect.appointmentservice.dto.AppointmentUpdateRequest;
import com.careconnect.appointmentservice.entity.Appointment;
import com.careconnect.appointmentservice.entity.DoctorAvailability;
import com.careconnect.appointmentservice.enums.AppointmentStatus;
import com.careconnect.appointmentservice.enums.DayOfWeek;
import com.careconnect.appointmentservice.exception.BadRequestException;
import com.careconnect.appointmentservice.exception.ResourceNotFoundException;
import com.careconnect.appointmentservice.messaging.AppointmentConfirmedEvent;
import com.careconnect.appointmentservice.messaging.EventPublisher;
import com.careconnect.appointmentservice.repository.AppointmentRepository;
import com.careconnect.appointmentservice.repository.DoctorAvailabilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final DoctorUnavailabilityService unavailabilityService;
    private final EventPublisher eventPublisher;

    @Transactional
    public AppointmentResponse createAppointment(AppointmentCreateRequest request, Long createdByUserId) {
        validateDoctorAvailability(request.getDoctorId(), request.getScheduledAt(), request.getDurationMinutes());
        validateConflicts(null, request.getDoctorId(), request.getScheduledAt(), request.getDurationMinutes());

        Appointment appointment = Appointment.builder()
                .patientId(request.getPatientId())
                .doctorId(request.getDoctorId())
                .scheduledAt(request.getScheduledAt())
                .durationMinutes(request.getDurationMinutes())
                .type(request.getType())
                .room(request.getRoom())
                .notes(request.getNotes())
                .status(AppointmentStatus.SCHEDULED)
                .createdBy(createdByUserId)
                .build();

        Appointment saved = appointmentRepository.save(appointment);
        if (saved.getStatus() == AppointmentStatus.CONFIRMED) {
            publishConfirmedEvent(saved);
        }

        return mapToResponse(saved);
    }

    @Transactional
    public AppointmentResponse updateAppointment(Long id, AppointmentUpdateRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        if (appointment.getStatus() == AppointmentStatus.COMPLETED || appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new BadRequestException("Cannot update appointment in " + appointment.getStatus() + " status");
        }

        validateDoctorAvailability(appointment.getDoctorId(), request.getScheduledAt(), request.getDurationMinutes());
        validateConflicts(id, appointment.getDoctorId(), request.getScheduledAt(), request.getDurationMinutes());

        appointment.setScheduledAt(request.getScheduledAt());
        appointment.setDurationMinutes(request.getDurationMinutes());
        appointment.setType(request.getType());
        appointment.setRoom(request.getRoom());
        appointment.setNotes(request.getNotes());

        Appointment saved = appointmentRepository.save(appointment);
        return mapToResponse(saved);
    }

    @Transactional
    public AppointmentResponse updateStatus(Long id, AppointmentStatusUpdateRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        AppointmentStatus oldStatus = appointment.getStatus();
        AppointmentStatus newStatus = request.getStatus();

        if (oldStatus == newStatus) {
            return mapToResponse(appointment);
        }

        if (oldStatus == AppointmentStatus.COMPLETED || oldStatus == AppointmentStatus.CANCELLED) {
            throw new BadRequestException("Cannot change status from completed or cancelled");
        }

        appointment.setStatus(newStatus);
        Appointment saved = appointmentRepository.save(appointment);

        if (newStatus == AppointmentStatus.CONFIRMED && oldStatus != AppointmentStatus.CONFIRMED) {
            publishConfirmedEvent(saved);
        }

        return mapToResponse(saved);
    }

    @Transactional
    public AppointmentResponse cancelAppointment(Long id) {
        AppointmentStatusUpdateRequest request = AppointmentStatusUpdateRequest.builder()
                .status(AppointmentStatus.CANCELLED)
                .build();
        return updateStatus(id, request);
    }

    public AppointmentResponse getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        return mapToResponse(appointment);
    }

    public List<AppointmentResponse> getAppointmentsByPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<AppointmentResponse> getAppointmentsByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<AppointmentResponse> getAppointmentsByDoctorAndDate(Long doctorId, LocalDate date) {
        return appointmentRepository.findByDoctorIdAndScheduledAtBetween(
                doctorId,
                date.atStartOfDay(),
                date.atTime(LocalTime.MAX)
        ).stream()
         .map(this::mapToResponse)
         .collect(Collectors.toList());
    }

    public Page<AppointmentResponse> getAllAppointments(Pageable pageable) {
        return appointmentRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    private void validateDoctorAvailability(Long doctorId, LocalDateTime scheduledAt, Integer durationMinutes) {
        LocalDate date = scheduledAt.toLocalDate();
        LocalTime time = scheduledAt.toLocalTime();

        if (!unavailabilityService.isDoctorAvailableOnDate(doctorId, date)) {
            throw new BadRequestException("Doctor is unavailable on this date due to leave/unavailability");
        }

        DayOfWeek dayOfWeek = DayOfWeek.valueOf(date.getDayOfWeek().name());
        Optional<DoctorAvailability> availabilityOpt = availabilityRepository.findByDoctorIdAndDayOfWeek(doctorId, dayOfWeek);
        DoctorAvailability availability;
        if (availabilityOpt.isEmpty()) {
            if (dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY) {
                throw new BadRequestException("Doctor has no availability set for weekends");
            }
            availability = DoctorAvailability.builder()
                    .doctorId(doctorId)
                    .dayOfWeek(dayOfWeek)
                    .startTime(LocalTime.of(9, 0))
                    .endTime(LocalTime.of(17, 0))
                    .build();
        } else {
            availability = availabilityOpt.get();
        }

        LocalTime slotEnd = time.plusMinutes(durationMinutes);
        if (time.isBefore(availability.getStartTime()) || slotEnd.isAfter(availability.getEndTime())) {
            throw new BadRequestException("Requested time must fall within doctor's working hours: " 
                    + availability.getStartTime() + " - " + availability.getEndTime());
        }
    }

    private void validateConflicts(Long appointmentId, Long doctorId, LocalDateTime scheduledAt, Integer durationMinutes) {
        LocalDate date = scheduledAt.toLocalDate();
        LocalTime requestedStart = scheduledAt.toLocalTime();
        LocalTime requestedEnd = requestedStart.plusMinutes(durationMinutes);

        List<Appointment> existingList = appointmentRepository.findByDoctorIdAndScheduledAtBetween(
                doctorId,
                date.atStartOfDay(),
                date.atTime(LocalTime.MAX)
        );

        for (Appointment appt : existingList) {
            if (appointmentId != null && appt.getId().equals(appointmentId)) {
                continue;
            }
            if (appt.getStatus() == AppointmentStatus.CANCELLED) {
                continue;
            }

            LocalTime apptStart = appt.getScheduledAt().toLocalTime();
            LocalTime apptEnd = apptStart.plusMinutes(appt.getDurationMinutes());

            if (requestedStart.isBefore(apptEnd) && requestedEnd.isAfter(apptStart)) {
                throw new BadRequestException("Time slot overlaps with an existing appointment");
            }
        }
    }

    private void publishConfirmedEvent(Appointment appt) {
        AppointmentConfirmedEvent event = AppointmentConfirmedEvent.builder()
                .appointmentId(appt.getId())
                .patientId(appt.getPatientId())
                .doctorId(appt.getDoctorId())
                .scheduledAt(appt.getScheduledAt())
                .appointmentType(appt.getType().name())
                .build();
        eventPublisher.publishAppointmentConfirmed(event);
    }

    private AppointmentResponse mapToResponse(Appointment appt) {
        return AppointmentResponse.builder()
                .id(appt.getId())
                .patientId(appt.getPatientId())
                .doctorId(appt.getDoctorId())
                .scheduledAt(appt.getScheduledAt())
                .durationMinutes(appt.getDurationMinutes())
                .type(appt.getType())
                .room(appt.getRoom())
                .status(appt.getStatus())
                .notes(appt.getNotes())
                .createdBy(appt.getCreatedBy())
                .createdAt(appt.getCreatedAt())
                .updatedAt(appt.getUpdatedAt())
                .build();
    }
}
