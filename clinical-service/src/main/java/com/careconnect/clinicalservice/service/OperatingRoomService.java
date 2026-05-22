package com.careconnect.clinicalservice.service;

import com.careconnect.clinicalservice.dto.OperatingRoomResponse;
import com.careconnect.clinicalservice.entity.OperatingRoom;
import com.careconnect.clinicalservice.enums.OperatingRoomStatus;
import com.careconnect.clinicalservice.exception.ResourceNotFoundException;
import com.careconnect.clinicalservice.repository.OperatingRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OperatingRoomService {

    private final OperatingRoomRepository operatingRoomRepository;

    @Transactional(readOnly = true)
    public List<OperatingRoomResponse> getAllOperatingRooms() {
        return operatingRoomRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OperatingRoomResponse getOperatingRoomById(Long id) {
        OperatingRoom room = operatingRoomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Operating Room not found with id: " + id));
        return mapToResponse(room);
    }

    @Transactional
    public OperatingRoomResponse updateStatus(Long id, OperatingRoomStatus status, String notes) {
        OperatingRoom room = operatingRoomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Operating Room not found with id: " + id));
        room.setStatus(status);
        if (notes != null) {
            room.setNotes(notes);
        }
        OperatingRoom saved = operatingRoomRepository.save(room);
        return mapToResponse(saved);
    }

    @Transactional
    public OperatingRoomResponse createOperatingRoom(String name, String notes) {
        if (operatingRoomRepository.findByName(name).isPresent()) {
            throw new IllegalArgumentException("Operating room with name '" + name + "' already exists");
        }
        OperatingRoom room = OperatingRoom.builder()
                .name(name)
                .status(OperatingRoomStatus.AVAILABLE)
                .notes(notes)
                .build();
        OperatingRoom saved = operatingRoomRepository.save(room);
        return mapToResponse(saved);
    }

    private OperatingRoomResponse mapToResponse(OperatingRoom room) {
        return OperatingRoomResponse.builder()
                .id(room.getId())
                .name(room.getName())
                .status(room.getStatus())
                .lastUsedAt(room.getLastUsedAt())
                .notes(room.getNotes())
                .build();
    }
}
