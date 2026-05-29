package com.careconnect.patientservice.service;

import com.careconnect.patientservice.dto.RoomCreateRequest;
import com.careconnect.patientservice.dto.RoomResponse;
import com.careconnect.patientservice.dto.RoomUpdateRequest;
import com.careconnect.patientservice.entity.Room;
import com.careconnect.patientservice.entity.Ward;
import com.careconnect.patientservice.enums.RoomStatus;
import com.careconnect.patientservice.exception.BadRequestException;
import com.careconnect.patientservice.exception.ResourceNotFoundException;
import com.careconnect.patientservice.repository.RoomRepository;
import com.careconnect.patientservice.repository.WardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final WardRepository wardRepository;

    @Transactional
    public RoomResponse createRoom(RoomCreateRequest request) {
        Ward ward = wardRepository.findById(request.getWardId())
                .orElseThrow(() -> new ResourceNotFoundException("Ward not found with id: " + request.getWardId()));

        if (roomRepository.findByRoomNumber(request.getRoomNumber()).isPresent()) {
            throw new BadRequestException("Room with number " + request.getRoomNumber() + " already exists");
        }

        Room room = Room.builder()
                .ward(ward)
                .roomNumber(request.getRoomNumber())
                .bedCount(request.getBedCount())
                .status(request.getStatus() != null ? request.getStatus() : RoomStatus.AVAILABLE)
                .notes(request.getNotes())
                .build();
        return mapToResponse(roomRepository.save(room));
    }

    public List<RoomResponse> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public RoomResponse getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
        return mapToResponse(room);
    }

    public List<RoomResponse> getRoomsByWardId(Long wardId) {
        if (!wardRepository.existsById(wardId)) {
            throw new ResourceNotFoundException("Ward not found with id: " + wardId);
        }
        return roomRepository.findByWardId(wardId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<RoomResponse> getAvailableRooms() {
        return roomRepository.findByStatus(RoomStatus.AVAILABLE).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public RoomResponse updateRoom(Long id, RoomUpdateRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));

        if (request.getRoomNumber() != null) {
            roomRepository.findByRoomNumber(request.getRoomNumber()).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new BadRequestException("Room with number " + request.getRoomNumber() + " already exists");
                }
            });
            room.setRoomNumber(request.getRoomNumber());
        }

        if (request.getBedCount() != null) {
            room.setBedCount(request.getBedCount());
        }
        if (request.getStatus() != null) {
            room.setStatus(request.getStatus());
        }
        if (request.getNotes() != null) {
            room.setNotes(request.getNotes());
        }

        return mapToResponse(roomRepository.save(room));
    }

    @Transactional
    public RoomResponse updateRoomStatus(Long id, RoomStatus status) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
        room.setStatus(status);
        return mapToResponse(roomRepository.save(room));
    }

    private RoomResponse mapToResponse(Room room) {
        return RoomResponse.builder()
                .id(room.getId())
                .wardId(room.getWard().getId())
                .roomNumber(room.getRoomNumber())
                .bedCount(room.getBedCount())
                .status(room.getStatus())
                .notes(room.getNotes())
                .build();
    }
}
