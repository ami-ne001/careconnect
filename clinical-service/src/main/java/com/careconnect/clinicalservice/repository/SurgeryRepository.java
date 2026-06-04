package com.careconnect.clinicalservice.repository;

import com.careconnect.clinicalservice.entity.Surgery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface SurgeryRepository extends JpaRepository<Surgery, Long> {
    List<Surgery> findByPatientId(Long patientId);
    List<Surgery> findByLeadSurgeonId(Long leadSurgeonId);
    List<Surgery> findByOperatingRoomId(Long operatingRoomId);

    List<Surgery> findByOperatingRoomIdOrderByScheduledAtAsc(Long operatingRoomId);

    List<Surgery> findByScheduledAtBetween(LocalDateTime start, LocalDateTime end);
}
