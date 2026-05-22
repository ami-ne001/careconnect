package com.careconnect.clinicalservice.repository;

import com.careconnect.clinicalservice.entity.CareTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CareTaskRepository extends JpaRepository<CareTask, Long> {
    List<CareTask> findByPatientId(Long patientId);
    List<CareTask> findByAssignedTo(Long assignedTo);
}
