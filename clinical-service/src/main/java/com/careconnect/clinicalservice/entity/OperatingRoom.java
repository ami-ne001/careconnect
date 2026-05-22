package com.careconnect.clinicalservice.entity;

import com.careconnect.clinicalservice.enums.OperatingRoomStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "operating_rooms")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperatingRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, unique = true, length = 20)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private OperatingRoomStatus status = OperatingRoomStatus.AVAILABLE;

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
