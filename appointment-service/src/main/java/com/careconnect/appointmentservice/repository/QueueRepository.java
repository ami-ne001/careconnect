package com.careconnect.appointmentservice.repository;

import com.careconnect.appointmentservice.entity.Queue;
import com.careconnect.appointmentservice.enums.QueueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface QueueRepository extends JpaRepository<Queue, Long> {
    List<Queue> findByStatus(QueueStatus status);
    Optional<Queue> findByAppointmentId(Long appointmentId);

    @Query("SELECT COALESCE(MAX(q.ticketNumber), 0) FROM Queue q " +
           "WHERE q.checkedInAt >= :startOfDay AND q.checkedInAt <= :endOfDay")
    Integer findMaxTicketNumberForDate(@Param("startOfDay") LocalDateTime startOfDay,
                                       @Param("endOfDay") LocalDateTime endOfDay);

    @Query("SELECT q FROM Queue q WHERE q.checkedInAt >= :startOfDay AND q.checkedInAt <= :endOfDay ORDER BY q.ticketNumber ASC")
    List<Queue> findTodayQueue(@Param("startOfDay") LocalDateTime startOfDay,
                               @Param("endOfDay") LocalDateTime endOfDay);
}
