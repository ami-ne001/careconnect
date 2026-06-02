package com.careconnect.clinicalservice.service;

import com.careconnect.clinicalservice.client.AuthServiceClient;
import com.careconnect.clinicalservice.dto.AuditActivityResponse;
import com.careconnect.clinicalservice.dto.AuditLogPageResponse;
import com.careconnect.clinicalservice.dto.DailyAuditActivityResponse;
import com.careconnect.clinicalservice.dto.UserSummaryResponse;
import com.careconnect.clinicalservice.entity.AuditLog;
import com.careconnect.clinicalservice.enums.AuditAction;
import com.careconnect.clinicalservice.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    @Transactional(readOnly = true)
    public AuditLogPageResponse getAuditLogs(String q,
                                             String action,
                                             LocalDate startDate,
                                             LocalDate endDate,
                                             int page,
                                             int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.max(1, Math.min(size, 200));
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(safePage, safeSize, sort);

        AuditAction actionEnum = parseAction(action);
        Specification<AuditLog> baseSpec = buildBaseSpec(actionEnum, startDate, endDate);

        if (q == null || q.trim().isEmpty()) {
            Page<AuditLog> dbPage = auditLogRepository.findAll(baseSpec, pageable);
            Map<Long, UserSummaryResponse> userCache = new HashMap<>();
            List<AuditActivityResponse> items = dbPage.getContent().stream()
                    .map(log -> toResponse(log, userCache))
                    .toList();
            return AuditLogPageResponse.builder()
                    .items(items)
                    .total(dbPage.getTotalElements())
                    .page(safePage)
                    .size(safeSize)
                    .build();
        }

        String keyword = q.trim().toLowerCase();
        // For user-name search support, fetch filtered logs (except keyword) then filter in-memory.
        List<AuditLog> candidates = auditLogRepository.findAll(baseSpec, sort);
        Map<Long, UserSummaryResponse> userCache = new HashMap<>();
        List<AuditActivityResponse> filtered = candidates.stream()
                .map(log -> toResponse(log, userCache))
                .filter(item -> matchesKeyword(item, keyword))
                .toList();

        int from = safePage * safeSize;
        if (from >= filtered.size()) {
            return AuditLogPageResponse.builder()
                    .items(List.of())
                    .total(filtered.size())
                    .page(safePage)
                    .size(safeSize)
                    .build();
        }
        int to = Math.min(filtered.size(), from + safeSize);
        return AuditLogPageResponse.builder()
                .items(filtered.subList(from, to))
                .total(filtered.size())
                .page(safePage)
                .size(safeSize)
                .build();
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

    private boolean matchesKeyword(AuditActivityResponse item, String keyword) {
        return containsIgnoreCase(item.getUserName(), keyword)
                || containsIgnoreCase(item.getDescription(), keyword)
                || containsIgnoreCase(item.getModule(), keyword)
                || containsIgnoreCase(item.getAction(), keyword)
                || containsIgnoreCase(item.getIpAddress(), keyword);
    }

    private boolean containsIgnoreCase(String source, String keyword) {
        return source != null && source.toLowerCase().contains(keyword);
    }

    private AuditAction parseAction(String action) {
        if (action == null || action.trim().isEmpty()) {
            return null;
        }
        try {
            return AuditAction.valueOf(action.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private Specification<AuditLog> buildBaseSpec(AuditAction action, LocalDate startDate, LocalDate endDate) {
        return (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (action != null) {
                predicates.add(cb.equal(root.get("action"), action));
            }
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startDate.atStartOfDay()));
            }
            if (endDate != null) {
                predicates.add(cb.lessThan(root.get("createdAt"), endDate.plusDays(1).atStartOfDay()));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
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
