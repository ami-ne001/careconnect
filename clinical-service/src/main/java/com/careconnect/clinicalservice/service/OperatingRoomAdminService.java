package com.careconnect.clinicalservice.service;

import com.careconnect.clinicalservice.client.AuthServiceClient;
import com.careconnect.clinicalservice.client.PatientServiceClient;
import com.careconnect.clinicalservice.dto.*;
import com.careconnect.clinicalservice.entity.OperatingRoom;
import com.careconnect.clinicalservice.entity.Surgery;
import com.careconnect.clinicalservice.enums.OperatingRoomStatus;
import com.careconnect.clinicalservice.enums.SurgeryStatus;
import com.careconnect.clinicalservice.repository.OperatingRoomRepository;
import com.careconnect.clinicalservice.repository.SurgeryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class OperatingRoomAdminService {

    private static final int SCHEDULE_START_HOUR = 6;
    private static final int SCHEDULE_END_HOUR = 18;
    private static final DateTimeFormatter DAY_LABEL_FMT = DateTimeFormatter.ofPattern("EEE MMM d");

    private final OperatingRoomRepository operatingRoomRepository;
    private final SurgeryRepository surgeryRepository;
    private final AuthServiceClient authServiceClient;
    private final PatientServiceClient patientServiceClient;

    @Transactional(readOnly = true)
    public OperatingRoomOverviewResponse getOverview(LocalDate weekStartParam) {
        LocalDate weekStart = weekStartParam != null
                ? weekStartParam
                : LocalDate.now().with(DayOfWeek.MONDAY);
        LocalDate weekEnd = weekStart.plusDays(6);
        LocalDateTime weekStartDt = weekStart.atStartOfDay();
        LocalDateTime weekEndDt = weekEnd.plusDays(1).atStartOfDay();

        List<OperatingRoom> rooms = operatingRoomRepository.findAll().stream()
                .sorted(Comparator.comparing(OperatingRoom::getName))
                .toList();

        List<Surgery> weekSurgeries = surgeryRepository.findByScheduledAtBetween(weekStartDt, weekEndDt).stream()
                .filter(s -> s.getStatus() != SurgeryStatus.CANCELLED)
                .toList();

        Map<Long, UserSummaryResponse> userCache = new HashMap<>();
        Map<Long, PatientResponse> patientCache = new HashMap<>();

        List<OperatingRoomCardResponse> roomCards = rooms.stream()
                .map(room -> buildRoomCard(room, userCache, patientCache))
                .toList();

        OperatingRoomStatsResponse stats = buildStats(rooms);

        WeekScheduleResponse weekSchedule = buildWeekSchedule(rooms, weekSurgeries, weekStart, weekEnd, userCache, patientCache);

        return OperatingRoomOverviewResponse.builder()
                .stats(stats)
                .rooms(roomCards)
                .weekSchedule(weekSchedule)
                .build();
    }

    private OperatingRoomStatsResponse buildStats(List<OperatingRoom> rooms) {
        long inUse = rooms.stream().filter(r -> r.getStatus() == OperatingRoomStatus.IN_USE).count();
        long available = rooms.stream().filter(r -> r.getStatus() == OperatingRoomStatus.AVAILABLE).count();
        long cleaning = rooms.stream().filter(r -> r.getStatus() == OperatingRoomStatus.CLEANING).count();
        return OperatingRoomStatsResponse.builder()
                .total(rooms.size())
                .inUse(inUse)
                .available(available)
                .cleaning(cleaning)
                .build();
    }

    private OperatingRoomCardResponse buildRoomCard(OperatingRoom room,
                                                    Map<Long, UserSummaryResponse> userCache,
                                                    Map<Long, PatientResponse> patientCache) {
        List<Surgery> roomSurgeries = surgeryRepository.findByOperatingRoomIdOrderByScheduledAtAsc(room.getId()).stream()
                .filter(s -> s.getStatus() != SurgeryStatus.CANCELLED)
                .toList();

        LocalDateTime now = LocalDateTime.now();

        Optional<Surgery> currentSurgery = roomSurgeries.stream()
                .filter(s -> s.getStatus() == SurgeryStatus.IN_PROGRESS
                        || (room.getStatus() == OperatingRoomStatus.IN_USE && isActiveSurgery(s, now)))
                .findFirst();

        if (currentSurgery.isEmpty() && room.getStatus() == OperatingRoomStatus.IN_USE) {
            currentSurgery = roomSurgeries.stream()
                    .filter(s -> s.getStatus() == SurgeryStatus.PRE_OP || s.getStatus() == SurgeryStatus.IN_PROGRESS)
                    .filter(s -> !s.getScheduledAt().isAfter(now.plusHours(1)))
                    .max(Comparator.comparing(Surgery::getScheduledAt));
        }

        Optional<Surgery> lastSurgery = roomSurgeries.stream()
                .filter(s -> s.getStatus() == SurgeryStatus.COMPLETED || s.getActualEndAt() != null)
                .max(Comparator.comparing(s -> s.getActualEndAt() != null ? s.getActualEndAt() : s.getScheduledAt()));

        List<Surgery> upcomingSurgeries = roomSurgeries.stream()
                .filter(s -> s.getStatus() == SurgeryStatus.SCHEDULED || s.getStatus() == SurgeryStatus.PRE_OP)
                .filter(s -> s.getScheduledAt().isAfter(now) || s.getStatus() == SurgeryStatus.PRE_OP)
                .sorted(Comparator.comparing(Surgery::getScheduledAt))
                .toList();

        OperatingRoomSurgerySummaryResponse next = upcomingSurgeries.isEmpty()
                ? null
                : toSummary(upcomingSurgeries.get(0), userCache, patientCache, true);

        List<OperatingRoomSurgerySummaryResponse> upcoming = upcomingSurgeries.size() <= 1
                ? List.of()
                : upcomingSurgeries.subList(1, Math.min(upcomingSurgeries.size(), 4)).stream()
                .map(s -> toSummary(s, userCache, patientCache, false))
                .toList();

        LocalDateTime estReady = null;
        if (room.getStatus() == OperatingRoomStatus.CLEANING && room.getLastUsedAt() != null) {
            estReady = room.getLastUsedAt().plusMinutes(90);
        }

        return OperatingRoomCardResponse.builder()
                .id(room.getId())
                .name(room.getName())
                .status(room.getStatus())
                .uiStatus(toUiStatus(room.getStatus()))
                .lastSurgery(lastSurgery.map(s -> toSummary(s, userCache, patientCache, false)).orElse(null))
                .nextSurgery(next)
                .upcoming(upcoming)
                .current(currentSurgery.map(s -> toSummary(s, userCache, patientCache, true)).orElse(null))
                .estReady(estReady)
                .build();
    }

    private boolean isActiveSurgery(Surgery s, LocalDateTime now) {
        if (s.getStatus() == SurgeryStatus.IN_PROGRESS) {
            return true;
        }
        return s.getActualStartAt() != null
                && s.getActualEndAt() == null
                && !s.getActualStartAt().isAfter(now);
    }

    private OperatingRoomSurgerySummaryResponse toSummary(Surgery s,
                                                          Map<Long, UserSummaryResponse> userCache,
                                                          Map<Long, PatientResponse> patientCache,
                                                          boolean includeProgress) {
        String patientName = resolvePatientName(s.getPatientId(), patientCache);
        String surgeonName = resolveSurgeonName(s.getLeadSurgeonId(), userCache);

        LocalDateTime estimatedEnd = s.getScheduledAt().plusMinutes(s.getEstimatedDuration() != null ? s.getEstimatedDuration() : 60);
        if (s.getActualStartAt() != null) {
            estimatedEnd = s.getActualStartAt().plusMinutes(s.getEstimatedDuration() != null ? s.getEstimatedDuration() : 60);
        }

        Integer progress = null;
        if (includeProgress && s.getActualStartAt() != null && s.getEstimatedDuration() != null && s.getEstimatedDuration() > 0) {
            long elapsed = ChronoUnit.MINUTES.between(s.getActualStartAt(), LocalDateTime.now());
            progress = (int) Math.min(100, Math.max(0, (elapsed * 100) / s.getEstimatedDuration()));
        } else if (includeProgress && s.getStatus() == SurgeryStatus.IN_PROGRESS) {
            progress = 50;
        }

        return OperatingRoomSurgerySummaryResponse.builder()
                .surgeryId(s.getId())
                .surgeryType(s.getSurgeryType())
                .patientName(patientName)
                .surgeonName(surgeonName)
                .scheduledAt(s.getScheduledAt())
                .actualStartAt(s.getActualStartAt())
                .actualEndAt(s.getActualEndAt())
                .estimatedEndAt(estimatedEnd)
                .progressPercent(progress)
                .build();
    }

    private WeekScheduleResponse buildWeekSchedule(List<OperatingRoom> rooms,
                                                   List<Surgery> weekSurgeries,
                                                   LocalDate weekStart,
                                                   LocalDate weekEnd,
                                                   Map<Long, UserSummaryResponse> userCache,
                                                   Map<Long, PatientResponse> patientCache) {
        List<String> dayLabels = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            dayLabels.add(weekStart.plusDays(i).format(DAY_LABEL_FMT));
        }

        List<WeekScheduleRowResponse> rows = rooms.stream()
                .map(room -> {
                    List<WeekScheduleBlockResponse> blocks = weekSurgeries.stream()
                            .filter(s -> s.getOperatingRoom().getId().equals(room.getId()))
                            .map(s -> toScheduleBlock(s, weekStart, room.getName(), userCache, patientCache))
                            .filter(Objects::nonNull)
                            .toList();
                    return WeekScheduleRowResponse.builder()
                            .orName(room.getName())
                            .blocks(blocks)
                            .build();
                })
                .toList();

        return WeekScheduleResponse.builder()
                .weekStart(weekStart)
                .weekEnd(weekEnd)
                .dayLabels(dayLabels)
                .rows(rows)
                .build();
    }

    private WeekScheduleBlockResponse toScheduleBlock(Surgery s,
                                                        LocalDate weekStart,
                                                        String orName,
                                                        Map<Long, UserSummaryResponse> userCache,
                                                        Map<Long, PatientResponse> patientCache) {
        LocalDate surgeryDate = s.getScheduledAt().toLocalDate();
        int dayIndex = (int) ChronoUnit.DAYS.between(weekStart, surgeryDate);
        if (dayIndex < 0 || dayIndex > 6) {
            return null;
        }

        int startHour = s.getScheduledAt().getHour();
        if (startHour < SCHEDULE_START_HOUR) {
            startHour = SCHEDULE_START_HOUR;
        }
        int spanHours = Math.max(1, (int) Math.ceil((s.getEstimatedDuration() != null ? s.getEstimatedDuration() : 60) / 60.0));
        if (startHour + spanHours > SCHEDULE_END_HOUR) {
            spanHours = SCHEDULE_END_HOUR - startHour;
        }
        if (spanHours < 1) {
            spanHours = 1;
        }

        int relativeStart = startHour - SCHEDULE_START_HOUR;
        String patientShort = resolvePatientName(s.getPatientId(), patientCache);
        String label = s.getSurgeryType() + " — " + patientShort;

        return WeekScheduleBlockResponse.builder()
                .dayIndex(dayIndex)
                .startHour(relativeStart)
                .spanHours(spanHours)
                .label(label)
                .orName(orName)
                .colorKey(colorKeyForSurgery(s))
                .build();
    }

    private String colorKeyForSurgery(Surgery s) {
        String type = s.getSurgeryType() != null ? s.getSurgeryType().toLowerCase() : "";
        if (type.contains("cabg") || type.contains("cardiac") || type.contains("coronary")) {
            return "cardiac";
        }
        if (type.contains("knee") || type.contains("hip") || type.contains("ortho")) {
            return "orthopedics";
        }
        if (type.contains("laparoscopic") || type.contains("append") || type.contains("cholecyst")) {
            return "general";
        }
        return "scheduled";
    }

    private String resolvePatientName(Long patientId, Map<Long, PatientResponse> cache) {
        if (patientId == null) {
            return "Unknown patient";
        }
        PatientResponse p = cache.computeIfAbsent(patientId, id -> {
            try {
                return patientServiceClient.getPatientById(id);
            } catch (Exception e) {
                log.warn("Failed to fetch patient {}", id, e);
                return null;
            }
        });
        if (p == null) {
            return "Patient #" + patientId;
        }
        return (p.getFirstName() + " " + p.getLastName()).trim();
    }

    private String resolveSurgeonName(Long surgeonId, Map<Long, UserSummaryResponse> cache) {
        if (surgeonId == null) {
            return "Unknown surgeon";
        }
        UserSummaryResponse u = cache.computeIfAbsent(surgeonId, id -> {
            try {
                return authServiceClient.getUserSummary(id);
            } catch (Exception e) {
                log.warn("Failed to fetch user {}", id, e);
                return null;
            }
        });
        if (u == null) {
            return "Dr. #" + surgeonId;
        }
        return "Dr. " + u.getLastName();
    }

    private String toUiStatus(OperatingRoomStatus status) {
        return switch (status) {
            case AVAILABLE -> "Available";
            case IN_USE -> "In Use";
            case CLEANING -> "Cleaning";
            case MAINTENANCE -> "Maintenance";
        };
    }
}
