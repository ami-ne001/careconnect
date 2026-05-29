package com.careconnect.appointmentservice.repository;

import com.careconnect.appointmentservice.entity.DoctorUnavailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DoctorUnavailabilityRepository extends JpaRepository<DoctorUnavailability, Long> {
    List<DoctorUnavailability> findByDoctorId(Long doctorId);

    @Query("SELECT u FROM DoctorUnavailability u WHERE u.doctorId = :doctorId " +
           "AND u.startDate <= :date AND u.endDate >= :date")
    List<DoctorUnavailability> findUnavailabilityOnDate(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);

    @Query("SELECT u FROM DoctorUnavailability u WHERE u.doctorId = :doctorId " +
           "AND u.startDate <= :endDate AND u.endDate >= :startDate")
    List<DoctorUnavailability> findOverlappingUnavailability(@Param("doctorId") Long doctorId,
                                                             @Param("startDate") LocalDate startDate,
                                                             @Param("endDate") LocalDate endDate);
}
