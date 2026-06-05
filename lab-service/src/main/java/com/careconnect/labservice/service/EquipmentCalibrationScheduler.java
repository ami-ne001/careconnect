package com.careconnect.labservice.service;

import com.careconnect.labservice.dto.MaintenanceCreateRequest;
import com.careconnect.labservice.entity.Equipment;
import com.careconnect.labservice.enums.EquipmentStatus;
import com.careconnect.labservice.repository.EquipmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class EquipmentCalibrationScheduler {

    private final EquipmentRepository equipmentRepository;
    private final EquipmentService equipmentService;

    /**
     * Run every day at 1:00 AM to check for overdue calibrations.
     * Equipment that are operational but past their nextCalibration date 
     * will be put into MAINTENANCE status automatically.
     */
    @Scheduled(cron = "0 0 1 * * ?")
    @Transactional
    public void scheduleOverdueCalibrations() {
        log.info("Running daily check for overdue equipment calibrations...");
        
        LocalDate today = LocalDate.now();
        List<Equipment> overdueEquipment = equipmentRepository.findByStatusAndNextCalibrationBefore(EquipmentStatus.OPERATIONAL, today);
        
        if (overdueEquipment.isEmpty()) {
            log.info("No overdue equipment found today.");
            return;
        }

        for (Equipment eq : overdueEquipment) {
            log.warn("Equipment '{}' (ID: {}) is overdue for calibration since {}. Moving to MAINTENANCE.", 
                    eq.getName(), eq.getId(), eq.getNextCalibration());
                    
            MaintenanceCreateRequest maintenanceRequest = new MaintenanceCreateRequest();
            maintenanceRequest.setEquipmentId(eq.getId());
            maintenanceRequest.setIssue("Scheduled Calibration Due (Overdue since " + eq.getNextCalibration() + ")");
            // 1 is the default admin user ID for system actions if reportedBy is null, but we'll use null or 1 depending on DB constraints
            // Looking at the DB, reported_by is NULLABLE (INT UNSIGNED NULL)
            maintenanceRequest.setReportedBy(null); 
            
            equipmentService.reportMaintenance(eq.getId(), maintenanceRequest);
        }
        
        log.info("Finished daily calibration check. {} equipment items moved to maintenance.", overdueEquipment.size());
    }
}
