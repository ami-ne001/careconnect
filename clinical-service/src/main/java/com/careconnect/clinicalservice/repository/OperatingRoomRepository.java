package com.careconnect.clinicalservice.repository;

import com.careconnect.clinicalservice.entity.OperatingRoom;
import com.careconnect.clinicalservice.enums.OperatingRoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OperatingRoomRepository extends JpaRepository<OperatingRoom, Long> {
    Optional<OperatingRoom> findByName(String name);
    List<OperatingRoom> findByStatus(OperatingRoomStatus status);
}
