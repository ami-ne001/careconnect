package com.careconnect.auth.service;

import com.careconnect.auth.dto.StaffByDepartmentReportResponse;
import com.careconnect.auth.dto.StaffDepartmentMetricResponse;
import com.careconnect.auth.entity.User;
import com.careconnect.auth.enums.Role;
import com.careconnect.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminReportsService {

    private static final String UNASSIGNED = "Unassigned";

    private static final EnumSet<Role> STAFF_ROLES = EnumSet.of(
            Role.DOCTOR,
            Role.NURSE,
            Role.RECEPTIONIST,
            Role.LAB_TECHNICIAN
    );

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public StaffByDepartmentReportResponse getStaffByDepartment() {
        List<User> staff = userRepository.findAll().stream()
                .filter(u -> STAFF_ROLES.contains(u.getRole()))
                .toList();

        Map<String, long[]> counts = new HashMap<>();
        for (User user : staff) {
            String dept = user.getDepartment() != null ? user.getDepartment().getName() : UNASSIGNED;
            long[] pair = counts.computeIfAbsent(dept, k -> new long[2]);
            pair[1]++;
            if (Boolean.TRUE.equals(user.getIsActive())) {
                pair[0]++;
            }
        }

        List<StaffDepartmentMetricResponse> departments = counts.entrySet().stream()
                .filter(e -> e.getValue()[1] > 0)
                .sorted(Map.Entry.comparingByKey())
                .map(e -> {
                    long active = e.getValue()[0];
                    long total = e.getValue()[1];
                    int rate = total == 0 ? 0 : (int) Math.round(100.0 * active / total);
                    return StaffDepartmentMetricResponse.builder()
                            .departmentName(e.getKey())
                            .activeCount(active)
                            .totalCount(total)
                            .activeRate(rate)
                            .build();
                })
                .toList();

        return StaffByDepartmentReportResponse.builder().departments(departments).build();
    }
}
