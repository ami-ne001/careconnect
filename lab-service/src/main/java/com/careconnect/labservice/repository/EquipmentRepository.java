package com.careconnect.labservice.repository;

import com.careconnect.labservice.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;
import java.time.LocalDate;
import com.careconnect.labservice.enums.EquipmentStatus;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    Optional<Equipment> findBySerialNumber(String serialNumber);
    List<Equipment> findByStatusAndNextCalibrationBefore(EquipmentStatus status, LocalDate date);
}
