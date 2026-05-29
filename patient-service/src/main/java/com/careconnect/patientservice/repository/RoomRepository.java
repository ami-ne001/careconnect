package com.careconnect.patientservice.repository;

import com.careconnect.patientservice.entity.Room;
import com.careconnect.patientservice.enums.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findByRoomNumber(String roomNumber);
    List<Room> findByWardId(Long wardId);
    List<Room> findByStatus(RoomStatus status);
}
