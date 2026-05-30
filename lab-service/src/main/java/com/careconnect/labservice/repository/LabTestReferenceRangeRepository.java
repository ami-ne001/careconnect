package com.careconnect.labservice.repository;

import com.careconnect.labservice.entity.LabTestReferenceRange;
import com.careconnect.labservice.enums.Gender;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabTestReferenceRangeRepository extends JpaRepository<LabTestReferenceRange, Long> {
    List<LabTestReferenceRange> findByTestType_Id(Long testTypeId);
    List<LabTestReferenceRange> findByTestType_IdAndGender(Long testTypeId, Gender gender);
}
