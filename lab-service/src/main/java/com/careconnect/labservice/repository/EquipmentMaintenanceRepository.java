package com.careconnect.labservice.repository;

import com.careconnect.labservice.entity.EquipmentMaintenance;
import com.careconnect.labservice.enums.MaintenanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentMaintenanceRepository extends JpaRepository<EquipmentMaintenance, Long> {
    List<EquipmentMaintenance> findByEquipment_Id(Long equipmentId);
    List<EquipmentMaintenance> findByStatus(MaintenanceStatus status);
}
