package com.careconnect.patientservice.service;

import com.careconnect.patientservice.dto.AdmissionsByDepartmentResponse;
import com.careconnect.patientservice.dto.DepartmentAdmissionSliceResponse;
import com.careconnect.patientservice.dto.UserSummaryResponse;
import com.careconnect.patientservice.entity.Admission;
import com.careconnect.patientservice.feign.AuthServiceClient;
import com.careconnect.patientservice.repository.AdmissionRepository;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdmissionAnalyticsService {

    private static final String UNASSIGNED = "Unassigned";

    private final AdmissionRepository admissionRepository;
    private final AuthServiceClient authServiceClient;

    @Transactional(readOnly = true)
    public AdmissionsByDepartmentResponse getAdmissionsByDepartment(LocalDate startDate, LocalDate endDate) {
        LocalDateTime from = startDate.atStartOfDay();
        LocalDateTime to = endDate.plusDays(1).atStartOfDay();

        List<Admission> admissions = admissionRepository.findByAdmissionDateGreaterThanEqualAndAdmissionDateLessThan(from, to);
        Map<Long, UserSummaryResponse> doctorCache = new HashMap<>();
        Map<String, Long> countsByDepartment = new HashMap<>();

        for (Admission admission : admissions) {
            String dept = resolveDepartmentName(admission.getAdmittingDoctorId(), doctorCache);
            countsByDepartment.merge(dept, 1L, Long::sum);
        }

        List<DepartmentAdmissionSliceResponse> slices = countsByDepartment.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> DepartmentAdmissionSliceResponse.builder()
                        .departmentName(e.getKey())
                        .count(e.getValue())
                        .build())
                .toList();

        return AdmissionsByDepartmentResponse.builder()
                .startDate(startDate)
                .endDate(endDate)
                .totalAdmissions(admissions.size())
                .slices(slices)
                .build();
    }

    private String resolveDepartmentName(Long doctorId, Map<Long, UserSummaryResponse> cache) {
        if (doctorId == null) {
            return UNASSIGNED;
        }
        UserSummaryResponse user = cache.computeIfAbsent(doctorId, id -> {
            try {
                return authServiceClient.getUserSummary(id);
            } catch (FeignException e) {
                log.warn("Could not resolve doctor user {}: {}", id, e.getMessage());
                return null;
            }
        });
        if (user == null || user.getDepartmentName() == null || user.getDepartmentName().isBlank()) {
            return UNASSIGNED;
        }
        return user.getDepartmentName();
    }
}
