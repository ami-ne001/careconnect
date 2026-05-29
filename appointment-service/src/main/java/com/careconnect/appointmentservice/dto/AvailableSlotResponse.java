package com.careconnect.appointmentservice.dto;

import lombok.*;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailableSlotResponse {
    private LocalTime startTime;
    private LocalTime endTime;
}
