package com.careconnect.clinicalservice.service;

import com.careconnect.clinicalservice.client.AuthServiceClient;
import com.careconnect.clinicalservice.dto.DailyAuditActivityResponse;
import com.careconnect.clinicalservice.dto.AuditActivityResponse;
import com.careconnect.clinicalservice.dto.UserSummaryResponse;
import com.careconnect.clinicalservice.entity.AuditLog;
import com.careconnect.clinicalservice.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.ArrayList;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final AuthServiceClient authServiceClient;

    @Transactional(readOnly = true)
    public List<AuditActivityResponse> getRecentActivities() {
        List<AuditLog> logs = auditLogRepository.findTop20ByOrderByCreatedAtDesc();
        Map<Long, UserSummaryResponse> userCache = new HashMap<>();

        return logs.stream()
                .map(log -> toResponse(log, userCache))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DailyAuditActivityResponse> getDailyAuditActivity(int lastNDays) {
        LocalDate today = LocalDate.now();
        LocalDateTime from = today.minusDays(lastNDays - 1).atStartOfDay();

        List<AuditLog> logs = auditLogRepository.findByCreatedAtAfter(from);

        // Pre-fill days so chart always has 30 points (even if count is 0).
        Map<LocalDate, Long> countsByDay = new HashMap<>();
        for (int i = 0; i < lastNDays; i++) {
            LocalDate d = today.minusDays(lastNDays - 1 - i);
            countsByDay.put(d, 0L);
        }

        for (AuditLog log : logs) {
            if (log.getCreatedAt() == null) continue;
            LocalDate d = log.getCreatedAt().toLocalDate();
            countsByDay.computeIfPresent(d, (k, v) -> v + 1L);
        }

        List<LocalDate> orderedDays = new ArrayList<>(countsByDay.keySet());
        orderedDays.sort(Comparator.naturalOrder());

        return orderedDays.stream()
                .map(d -> DailyAuditActivityResponse.builder()
                        .day(d.toString()) // ISO date; frontend can format if needed
                        .logins(countsByDay.getOrDefault(d, 0L))
                        .build())
                .toList();
    }

    private AuditActivityResponse toResponse(AuditLog log, Map<Long, UserSummaryResponse> userCache) {
        UserSummaryResponse user = null;
        Long userId = log.getUserId();
        if (userId != null) {
            user = userCache.computeIfAbsent(userId, this::safeGetUserSummary);
        }

        String userName = "System";
        String role = "SYSTEM";
        if (user != null) {
            userName = (user.getFirstName() + " " + user.getLastName()).trim();
            role = user.getRole();
        } else if (userId != null) {
            userName = "User #" + userId;
            role = "UNKNOWN";
        }

        return AuditActivityResponse.builder()
                .id(log.getId())
                .userId(userId)
                .userName(userName)
                .role(role)
                .action(log.getAction().name())
                .module(log.getModule())
                .description(log.getDescription())
                .ipAddress(log.getIpAddress())
                .createdAt(log.getCreatedAt())
                .build();
    }

    private UserSummaryResponse safeGetUserSummary(Long userId) {
        try {
            return authServiceClient.getUserSummary(userId);
        } catch (Exception ex) {
            log.warn("Failed to fetch user summary for userId={}", userId, ex);
            return null;
        }
    }
}
