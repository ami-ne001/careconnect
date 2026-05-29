package com.careconnect.appointmentservice.service;

import com.careconnect.appointmentservice.dto.DoctorUnavailabilityRequest;
import com.careconnect.appointmentservice.dto.DoctorUnavailabilityResponse;
import com.careconnect.appointmentservice.entity.DoctorUnavailability;
import com.careconnect.appointmentservice.exception.ResourceNotFoundException;
import com.careconnect.appointmentservice.repository.DoctorUnavailabilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorUnavailabilityService {

    private final DoctorUnavailabilityRepository unavailabilityRepository;

    @Transactional
    public DoctorUnavailabilityResponse addUnavailability(Long doctorId, DoctorUnavailabilityRequest request) {
        DoctorUnavailability unavailability = DoctorUnavailability.builder()
                .doctorId(doctorId)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .reason(request.getReason())
                .build();
        
        return mapToResponse(unavailabilityRepository.save(unavailability));
    }

    public List<DoctorUnavailabilityResponse> getUnavailabilityByDoctor(Long doctorId) {
        return unavailabilityRepository.findByDoctorId(doctorId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteUnavailability(Long id) {
        if (!unavailabilityRepository.existsById(id)) {
            throw new ResourceNotFoundException("Unavailability record not found with id: " + id);
        }
        unavailabilityRepository.deleteById(id);
    }

    public boolean isDoctorAvailableOnDate(Long doctorId, LocalDate date) {
        List<DoctorUnavailability> list = unavailabilityRepository.findUnavailabilityOnDate(doctorId, date);
        return list.isEmpty();
    }

    private DoctorUnavailabilityResponse mapToResponse(DoctorUnavailability u) {
        return DoctorUnavailabilityResponse.builder()
                .id(u.getId())
                .doctorId(u.getDoctorId())
                .startDate(u.getStartDate())
                .endDate(u.getEndDate())
                .reason(u.getReason())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
