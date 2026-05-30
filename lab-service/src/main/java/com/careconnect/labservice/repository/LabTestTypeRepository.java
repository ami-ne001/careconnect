package com.careconnect.labservice.repository;

import com.careconnect.labservice.entity.LabTestType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LabTestTypeRepository extends JpaRepository<LabTestType, Long> {
    Optional<LabTestType> findByName(String name);
}
