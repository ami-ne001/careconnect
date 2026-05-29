package com.careconnect.patientservice.service;

import com.careconnect.patientservice.dto.WardCreateRequest;
import com.careconnect.patientservice.dto.WardResponse;
import com.careconnect.patientservice.entity.Ward;
import com.careconnect.patientservice.exception.BadRequestException;
import com.careconnect.patientservice.exception.ResourceNotFoundException;
import com.careconnect.patientservice.repository.WardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WardService {

    private final WardRepository wardRepository;

    @Transactional
    public WardResponse createWard(WardCreateRequest request) {
        if (wardRepository.findByName(request.getName()).isPresent()) {
            throw new BadRequestException("Ward with name " + request.getName() + " already exists");
        }
        Ward ward = Ward.builder()
                .name(request.getName())
                .description(request.getDescription())
                .floor(request.getFloor())
                .build();
        return mapToResponse(wardRepository.save(ward));
    }

    public List<WardResponse> getAllWards() {
        return wardRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public WardResponse getWardById(Long id) {
        Ward ward = wardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ward not found with id: " + id));
        return mapToResponse(ward);
    }

    @Transactional
    public WardResponse updateWard(Long id, WardCreateRequest request) {
        Ward ward = wardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ward not found with id: " + id));
        
        wardRepository.findByName(request.getName()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new BadRequestException("Ward with name " + request.getName() + " already exists");
            }
        });

        ward.setName(request.getName());
        ward.setDescription(request.getDescription());
        ward.setFloor(request.getFloor());
        return mapToResponse(wardRepository.save(ward));
    }

    @Transactional
    public void deleteWard(Long id) {
        if (!wardRepository.existsById(id)) {
            throw new ResourceNotFoundException("Ward not found with id: " + id);
        }
        wardRepository.deleteById(id);
    }

    private WardResponse mapToResponse(Ward ward) {
        return WardResponse.builder()
                .id(ward.getId())
                .name(ward.getName())
                .description(ward.getDescription())
                .floor(ward.getFloor())
                .createdAt(ward.getCreatedAt())
                .build();
    }
}
