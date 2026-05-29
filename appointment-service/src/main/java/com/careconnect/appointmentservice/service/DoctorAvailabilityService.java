package com.careconnect.appointmentservice.service;

import com.careconnect.appointmentservice.dto.AvailableSlotResponse;
import com.careconnect.appointmentservice.dto.AvailableSlotsRequest;
import com.careconnect.appointmentservice.dto.DoctorAvailabilityRequest;
import com.careconnect.appointmentservice.dto.DoctorAvailabilityResponse;
import com.careconnect.appointmentservice.entity.Appointment;
import com.careconnect.appointmentservice.entity.DoctorAvailability;
import com.careconnect.appointmentservice.enums.AppointmentStatus;
import com.careconnect.appointmentservice.enums.DayOfWeek;
import com.careconnect.appointmentservice.exception.BadRequestException;
import com.careconnect.appointmentservice.exception.ResourceNotFoundException;
import com.careconnect.appointmentservice.repository.AppointmentRepository;
import com.careconnect.appointmentservice.repository.DoctorAvailabilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorAvailabilityService {

    private final DoctorAvailabilityRepository availabilityRepository;
    private final DoctorUnavailabilityService unavailabilityService;
    private final AppointmentRepository appointmentRepository;

    @Transactional
    public DoctorAvailabilityResponse setAvailability(Long doctorId, DoctorAvailabilityRequest request) {
        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().equals(request.getEndTime())) {
            throw new BadRequestException("Start time must be before end time");
        }

        Optional<DoctorAvailability> existingOpt = availabilityRepository.findByDoctorIdAndDayOfWeek(doctorId, request.getDayOfWeek());
        DoctorAvailability availability;
        if (existingOpt.isPresent()) {
            availability = existingOpt.get();
            availability.setStartTime(request.getStartTime());
            availability.setEndTime(request.getEndTime());
        } else {
            availability = DoctorAvailability.builder()
                    .doctorId(doctorId)
                    .dayOfWeek(request.getDayOfWeek())
                    .startTime(request.getStartTime())
                    .endTime(request.getEndTime())
                    .build();
        }

        return mapToResponse(availabilityRepository.save(availability));
    }

    public List<DoctorAvailabilityResponse> getAvailabilityByDoctor(Long doctorId) {
        return availabilityRepository.findByDoctorId(doctorId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteAvailability(Long id) {
        if (!availabilityRepository.existsById(id)) {
            throw new ResourceNotFoundException("Availability not found with id: " + id);
        }
        availabilityRepository.deleteById(id);
    }

    public List<AvailableSlotResponse> getAvailableSlots(AvailableSlotsRequest request) {
        List<AvailableSlotResponse> slots = new ArrayList<>();
        Long doctorId = request.getDoctorId();
        LocalDate date = request.getDate();
        int slotDuration = request.getDurationMinutes();

        // 1. Check if doctor is unavailable on this date
        if (!unavailabilityService.isDoctorAvailableOnDate(doctorId, date)) {
            return slots; // return empty list
        }

        // 2. Get availability for the day of week
        DayOfWeek dayOfWeek = DayOfWeek.valueOf(date.getDayOfWeek().name());
        Optional<DoctorAvailability> availabilityOpt = availabilityRepository.findByDoctorIdAndDayOfWeek(doctorId, dayOfWeek);
        if (availabilityOpt.isEmpty()) {
            return slots; // no availability set for this day
        }

        DoctorAvailability availability = availabilityOpt.get();
        LocalTime workStart = availability.getStartTime();
        LocalTime workEnd = availability.getEndTime();

        // 3. Get existing non-cancelled appointments for this doctor on this day
        List<Appointment> appointments = appointmentRepository.findByDoctorIdAndScheduledAtBetween(
                doctorId,
                date.atStartOfDay(),
                date.atTime(LocalTime.MAX)
        ).stream()
         .filter(a -> a.getStatus() != AppointmentStatus.CANCELLED && a.getStatus() != AppointmentStatus.NO_SHOW)
         .collect(Collectors.toList());

        // 4. Generate slots and check for overlaps
        LocalTime current = workStart;
        while (current.plusMinutes(slotDuration).isBefore(workEnd) || current.plusMinutes(slotDuration).equals(workEnd)) {
            LocalTime slotStart = current;
            LocalTime slotEnd = current.plusMinutes(slotDuration);

            boolean isOverlapping = false;
            for (Appointment appt : appointments) {
                LocalTime apptStart = appt.getScheduledAt().toLocalTime();
                LocalTime apptEnd = apptStart.plusMinutes(appt.getDurationMinutes());

                // Overlap check: slotStart < apptEnd AND slotEnd > apptStart
                if (slotStart.isBefore(apptEnd) && slotEnd.isAfter(apptStart)) {
                    isOverlapping = true;
                    break;
                }
            }

            if (!isOverlapping) {
                slots.add(new AvailableSlotResponse(slotStart, slotEnd));
            }

            // Standard step is 30 minutes or slot duration
            current = current.plusMinutes(30);
        }

        return slots;
    }

    private DoctorAvailabilityResponse mapToResponse(DoctorAvailability availability) {
        return DoctorAvailabilityResponse.builder()
                .id(availability.getId())
                .doctorId(availability.getDoctorId())
                .dayOfWeek(availability.getDayOfWeek())
                .startTime(availability.getStartTime())
                .endTime(availability.getEndTime())
                .build();
    }
}
