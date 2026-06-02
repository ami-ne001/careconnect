package com.careconnect.clinicalservice.repository;

import com.careconnect.clinicalservice.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findTop20ByOrderByCreatedAtDesc();

    List<AuditLog> findByCreatedAtAfter(java.time.LocalDateTime from);
}
