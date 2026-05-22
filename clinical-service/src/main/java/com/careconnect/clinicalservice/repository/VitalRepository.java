package com.careconnect.clinicalservice.repository;

import com.careconnect.clinicalservice.entity.Vital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VitalRepository extends JpaRepository<Vital, Long> {
    List<Vital> findByPatientId(Long patientId);
    List<Vital> findByConsultationId(Long consultationId);

    Optional<Vital> findFirstByPatientIdOrderByRecordedAtDesc(Long patientId);
}
