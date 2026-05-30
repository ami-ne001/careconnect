package com.careconnect.labservice.entity;

import com.careconnect.labservice.enums.EquipmentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "equipment")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "type", length = 80)
    private String type;

    @Column(name = "serial_number", unique = true, length = 80)
    private String serialNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private EquipmentStatus status = EquipmentStatus.OPERATIONAL;

    @Column(name = "last_calibrated")
    private LocalDate lastCalibrated;

    @Column(name = "next_calibration")
    private LocalDate nextCalibration;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
