package com.careconnect.labservice.repository;

import com.careconnect.labservice.entity.LabResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LabResultRepository extends JpaRepository<LabResult, Long> {
    Optional<LabResult> findByLabRequest_Id(Long labRequestId);
}
