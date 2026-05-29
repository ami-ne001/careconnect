package com.careconnect.patientservice.repository;

import com.careconnect.patientservice.entity.ChronicCondition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChronicConditionRepository extends JpaRepository<ChronicCondition, Long> {
    List<ChronicCondition> findByPatientId(Long patientId);
}
