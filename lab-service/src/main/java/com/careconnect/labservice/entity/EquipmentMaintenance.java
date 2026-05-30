package com.careconnect.labservice.entity;

import com.careconnect.labservice.enums.MaintenanceStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "equipment_maintenance")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentMaintenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @Column(name = "reported_by")
    private Long reportedBy;

    @Column(name = "issue", nullable = false, columnDefinition = "TEXT")
    private String issue;

    @Column(name = "resolution", columnDefinition = "TEXT")
    private String resolution;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private MaintenanceStatus status = MaintenanceStatus.OPEN;

    @Column(name = "reported_at", nullable = false, insertable = false, updatable = false, columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime reportedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
}
