package com.careconnect.patientservice.repository;

import com.careconnect.patientservice.entity.Admission;
import com.careconnect.patientservice.enums.AdmissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdmissionRepository extends JpaRepository<Admission, Long> {
    List<Admission> findByPatientId(Long patientId);
    List<Admission> findByStatus(AdmissionStatus status);
    long countByRoomIdAndStatus(Long roomId, AdmissionStatus status);
}
