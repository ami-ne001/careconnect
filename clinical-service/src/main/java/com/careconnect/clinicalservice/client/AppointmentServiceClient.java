package com.careconnect.clinicalservice.client;

import com.careconnect.clinicalservice.dto.AppointmentResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "appointment-service", url = "${appointment.service.url}")
public interface AppointmentServiceClient {

    @GetMapping("/api/internal/appointments/{id}")
    AppointmentResponse getAppointmentById(@PathVariable("id") Long id);
}
