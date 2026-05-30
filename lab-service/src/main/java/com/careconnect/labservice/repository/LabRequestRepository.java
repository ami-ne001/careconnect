package com.careconnect.labservice.repository;

import com.careconnect.labservice.entity.LabRequest;
import com.careconnect.labservice.enums.LabRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabRequestRepository extends JpaRepository<LabRequest, Long> {
    List<LabRequest> findByPatientId(Long patientId);
    List<LabRequest> findByDoctorId(Long doctorId);
    List<LabRequest> findByConsultationId(Long consultationId);
    List<LabRequest> findByStatus(LabRequestStatus status);
}
